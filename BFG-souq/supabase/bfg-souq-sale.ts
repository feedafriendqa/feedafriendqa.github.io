// bfg-souq-sale
// Books for Good Souq till backend.
//  action "sale"   -> validates items, recomputes the total server-side, saves order + items, emails the receipt
//  action "events" -> lists active events for the till login picker
//  action "resend" -> re-sends the receipt for an existing order (by order_no + buyer_email)
// Receipts are sent from noreplytogetherforgood@gmail.com over Gmail SMTP. Needs secrets:
//   GMAIL_USER (default noreplytogetherforgood@gmail.com) and GMAIL_APP_PASSWORD (a Google app password).
// If GMAIL_APP_PASSWORD is not set the sale is still saved and receipt_status = 'not_configured'.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...CORS } });
const esc = (t: unknown) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const qr = (n: number) => "QR " + (Math.round(n * 100) / 100);
const SITE = "https://connect.feedafriend.org/BFG-souq";
const TOTE_PRICE = 30;
// Logos are fetched once from the repo and attached inline (CID) so they always display in mail apps.
const LOGO_BASE = "https://raw.githubusercontent.com/feedafriendqa/feedafriendqa.github.io/main/BFG-souq/email";
let logoCache: { faf: Uint8Array; tfg: Uint8Array } | null = null;
async function loadLogos() {
  if (logoCache) return logoCache;
  const get = async (n: string) => {
    try { const r = await fetch(`${LOGO_BASE}/${n}`); return r.ok ? new Uint8Array(await r.arrayBuffer()) : undefined; } catch { return undefined; }
  };
  const faf = await get("faf-logo.png"), tfg = await get("tfg-logo.png");
  if (faf && tfg && faf.length > 500 && tfg.length > 500) { logoCache = { faf, tfg }; return logoCache; }
  return null;
}
const METHODS: Record<string, { label: string; ar: string; status: string }> = {
  cash: { label: "Cash", ar: "نقداً", status: "received" },
  fawran: { label: "Fawran", ar: "فورَا", status: "awaiting_match" },
  card: { label: "Card", ar: "بطاقة", status: "awaiting_match" },
};

function receiptHtml(o: any, items: any[], cid: boolean) {
  const when = new Date(o.created_at).toLocaleString("en-GB", { timeZone: "Asia/Qatar", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const m = METHODS[o.payment_method];
  const rows = items.map((l) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e7ede9;font-size:13px"><b>${esc(l.label)}</b></td><td style="padding:8px 0;border-bottom:1px solid #e7ede9;text-align:center;font-size:13px">${l.qty}</td><td style="padding:8px 0;border-bottom:1px solid #e7ede9;text-align:right;font-size:13px">${qr(l.unit_price)}</td><td style="padding:8px 0;border-bottom:1px solid #e7ede9;text-align:right;font-size:13px;font-weight:800">${qr(l.line_total)}</td></tr>`).join("");
  const lbl = "font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#98a89e";
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;color:#101a14">
<div style="background:#146c43;padding:18px 20px"><table width="100%"><tr><td><img src="${cid ? "cid:faflogo" : SITE + "/faf-logo-white-email.png"}" height="34" alt="Feed a Friend" style="vertical-align:middle"> &nbsp; <img src="${cid ? "cid:tfglogo" : SITE + "/tfg-logo-white.png"}" height="40" alt="Together for Good" style="vertical-align:middle"></td><td style="text-align:right;color:#fff;font-weight:800;font-size:16px">Receipt<br><span style="font-size:14px">إيصال</span></td></tr></table></div>
<div style="padding:18px 20px">
<div style="font-weight:900;font-size:18px">${esc(o.event || "Books for Good Souq")}</div><div style="font-size:14px;color:#6b7d73;direction:rtl;text-align:right">سوق كتب من أجل الخير</div>
<p style="font-size:13px;line-height:1.6">Thank you, ${esc(o.buyer_name)}. Every riyal from today's sale supports Feed a Friend.<br><span style="direction:rtl;display:block;text-align:right;color:#6b7d73">شكراً لك. يدعم كل ريال من بيع اليوم Feed a Friend.</span></p>
<table width="100%" style="background:#fbfcfa;border-radius:10px;font-size:12px;margin:12px 0" cellpadding="8"><tr><td><div style="${lbl}">Receipt no. · رقم الإيصال</div><b>${esc(o.order_no)}</b></td><td><div style="${lbl}">Date · التاريخ</div><b>${esc(when)}</b></td></tr><tr><td><div style="${lbl}">Payment · طريقة الدفع</div><b>${m.label} · ${m.ar}</b></td><td><div style="${lbl}">Served by · البائع</div><b>${esc(o.volunteer_name || "")}</b></td></tr></table>
<table width="100%" style="border-collapse:collapse"><tr style="border-bottom:1.5px solid #0b2f20;font-size:10px;text-transform:uppercase;color:#6b7d73"><td style="padding-bottom:6px">Item · الصنف</td><td style="text-align:center">Qty</td><td style="text-align:right">Unit</td><td style="text-align:right">Amount</td></tr>${rows}</table>
<table width="100%" style="margin-top:10px"><tr><td style="font-weight:800;font-size:14px">Total paid · المبلغ المدفوع</td><td style="text-align:right;font-weight:900;font-size:22px;color:#146c43">${qr(o.total)}</td></tr></table>
<div style="font-size:11px;color:#98a89e;margin-top:2px">All prices in Qatari riyals (QAR). No VAT is charged in Qatar. · جميع الأسعار بالريال القطري.</div>
<div style="border-top:1px solid #e7ede9;margin-top:14px;padding-top:12px;font-size:11px;line-height:1.6;color:#6b7d73">
<div style="font-weight:800;color:#101a14">Together for Good Events W.L.L. · توجذر فور جود ايفينتس ذ.م.م</div>
<div>In support of Feed a Friend · Books for Good</div>
<div>C.R. no. 229085 · Commercial licence no. 319832 · Tax ID (TIN) 5008097008</div>
<div>Unit 36, Floor 2, Building 32, Street 205, Zone 56, Doha, Qatar</div>
<div>Returns and exchanges: in line with Qatari consumer law. These are preloved books, sold in the condition seen at the time of purchase.</div>
<div style="direction:rtl;text-align:right">الإرجاع والاستبدال وفقاً لقوانين حماية المستهلك في دولة قطر. الكتب مستعملة وتُباع بالحالة التي كانت عليها وقت الشراء.</div>
<div>Issued to ${esc(o.buyer_name)} · ${esc(o.buyer_email)}</div></div>
</div></div>`;
}

async function sendReceipt(admin: any, o: any, items: any[]) {
  const pass = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";
  const user = Deno.env.get("GMAIL_USER") || "noreplytogetherforgood@gmail.com";
  if (!pass) {
    await admin.from("bfg_orders").update({ receipt_status: "not_configured", receipt_error: "GMAIL_APP_PASSWORD secret not set" }).eq("id", o.id);
    return { status: "not_configured" };
  }
  try {
    const logos = await loadLogos();
    const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
    await client.send({
      from: `Together for Good <${user}>`,
      to: o.buyer_email,
      subject: `Your Books for Good receipt · ${o.order_no}`,
      content: `Thank you ${o.buyer_name}. Receipt ${o.order_no}, total ${qr(o.total)}. View this email in HTML for the full receipt.`,
      html: receiptHtml(o, items, !!logos),
      attachments: logos ? [
        { filename: "faf-logo.png", content: logos.faf, encoding: "binary", contentType: "image/png", contentID: "faflogo" },
        { filename: "tfg-logo.png", content: logos.tfg, encoding: "binary", contentType: "image/png", contentID: "tfglogo" },
      ] : [],
    });
    await client.close();
    await admin.from("bfg_orders").update({ receipt_status: "sent", receipt_sent_at: new Date().toISOString(), receipt_error: null }).eq("id", o.id);
    return { status: "sent" };
  } catch (e) {
    const msg = (e as Error).message.slice(0, 300);
    console.error("receipt send failed", o.order_no, msg);
    await admin.from("bfg_orders").update({ receipt_status: "failed", receipt_error: msg }).eq("id", o.id);
    return { status: "failed", error: msg };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));

    if (body.action === "events") {
      const { data: evs } = await admin.from("bfg_events").select("id,name,event_date").eq("active", true).order("event_date", { ascending: false });
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Qatar" });
      return json({ ok: true, today, events: evs ?? [] });
    }

    if (body.action === "resend") {
      const { data: o } = await admin.from("bfg_orders").select("*").eq("order_no", String(body.order_no ?? "")).ilike("buyer_email", String(body.buyer_email ?? "")).maybeSingle();
      if (!o) return json({ error: "Order not found" }, 404);
      const { data: items } = await admin.from("bfg_order_items").select("*").eq("order_id", o.id).order("unit_price");
      return json({ ok: true, order_no: o.order_no, receipt: await sendReceipt(admin, o, items ?? []) });
    }

    // ---- new sale ----
    const name = String(body.buyer_name ?? "").trim().slice(0, 120);
    const email = String(body.buyer_email ?? "").trim().toLowerCase().slice(0, 200);
    const phone = String(body.buyer_phone ?? "").replace(/[^\d+]/g, "").slice(0, 20) || null;
    const method = String(body.payment_method ?? "");
    const volName = String(body.volunteer_name ?? "").trim().slice(0, 120);
    const volPhone = String(body.volunteer_phone ?? "").trim().slice(0, 30);
    if (name.length < 2) return json({ error: "Buyer name required" }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Valid email required" }, 400);
    if (!METHODS[method]) return json({ error: "Invalid payment method" }, 400);
    if (volName.length < 2) return json({ error: "Volunteer name required" }, 400);

    // which event is this sale for? (till login picks it; an old cached till falls back to today's single event)
    let ev: any = null;
    if (body.event_id) {
      const { data } = await admin.from("bfg_events").select("id,name,active").eq("id", String(body.event_id)).maybeSingle();
      ev = data;
    } else {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Qatar" });
      const { data } = await admin.from("bfg_events").select("id,name,active").eq("active", true).eq("event_date", today);
      if (data && data.length === 1) ev = data[0];
    }
    if (!ev) return json({ error: "Please refresh the till and choose the event" }, 400);
    if (!ev.active) return json({ error: "That event is closed. Refresh the till and choose another." }, 400);

    const raw = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
    const items: any[] = [];
    for (const it of raw) {
      const qty = Math.floor(Number(it.qty));
      if (!(qty > 0 && qty <= 500)) continue;
      if (it.type === "tote") {
        items.push({ item_type: "tote", label: "FAF tote bag (sale price, usually QR 50)", unit_price: TOTE_PRICE, qty, line_total: TOTE_PRICE * qty });
      } else if (it.type === "book") {
        const p = Math.round(Number(it.price) * 100) / 100;
        if (!(p > 0 && p <= 1000)) return json({ error: "Invalid book price" }, 400);
        items.push({ item_type: "book", label: "Book · QR " + p, unit_price: p, qty, line_total: Math.round(p * qty * 100) / 100 });
      }
    }
    if (!items.length) return json({ error: "No items" }, 400);
    const total = Math.round(items.reduce((t, i) => t + i.line_total, 0) * 100) / 100;

    let cashGiven: number | null = null, change: number | null = null;
    if (method === "cash") {
      const g = Number(body.cash_given);
      cashGiven = g >= total ? Math.round(g * 100) / 100 : total;
      change = Math.round((cashGiven - total) * 100) / 100;
    }

    const { data: seqRow, error: seqErr } = await admin.rpc("bfg_next_order_no");
    if (seqErr || !seqRow) return json({ error: "Could not allocate receipt number" }, 500);
    const orderNo = String(seqRow);

    const { data: order, error: oErr } = await admin.from("bfg_orders").insert({
      order_no: orderNo, buyer_name: name, buyer_email: email, buyer_phone: phone, payment_method: method,
      total, cash_given: cashGiven, change_given: change, payment_status: METHODS[method].status,
      volunteer_name: volName, volunteer_phone: volPhone || null, event_id: ev.id, event: ev.name,
    }).select().single();
    if (oErr || !order) { console.error(oErr); return json({ error: "Could not save sale" }, 500); }

    const { error: iErr } = await admin.from("bfg_order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (iErr) {
      console.error(iErr);
      await admin.from("bfg_orders").delete().eq("id", order.id);
      return json({ error: "Could not save items" }, 500);
    }

    const receipt = await sendReceipt(admin, order, items);
    return json({ ok: true, order_no: orderNo, total, created_at: order.created_at, payment_status: order.payment_status, receipt });
  } catch (e) {
    console.error("bfg-souq-sale error:", (e as Error).message);
    return json({ error: "Server error" }, 500);
  }
});
