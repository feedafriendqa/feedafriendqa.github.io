import Anthropic from "npm:@anthropic-ai/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("1. Parsing request JSON...");
    const { images } = await req.json();
    console.log("2. Images received:", images ? "yes" : "no");

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    console.log("3. API Key loaded:", apiKey ? "yes" : "no");

    if (!apiKey) {
      console.error("ERROR: ANTHROPIC_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing ANTHROPIC_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!images || (!images.front && !images.back)) {
      console.error("ERROR: No images provided");
      return new Response(
        JSON.stringify({ error: "No images provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("4. Creating Anthropic client...");
    const client = new Anthropic({ apiKey });

    const content = [];

    if (images.front) {
      console.log("5a. Adding front image (size: " + images.front.data.length + " bytes)");
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: images.front.type || "image/jpeg",
          data: images.front.data,
        },
      });
      content.push({ type: "text", text: "This is the FRONT of the QID card." });
    }

    if (images.back) {
      console.log("5b. Adding back image (size: " + images.back.data.length + " bytes)");
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: images.back.type || "image/jpeg",
          data: images.back.data,
        },
      });
      content.push({ type: "text", text: "This is the BACK of the QID card." });
    }

    content.push({
      type: "text",
      text: `Extract all visible information from this Qatar QID card. Return ONLY valid JSON with these exact fields (use null if not visible):
{"name":"full English name","qid_number":"11-digit number","nationality":"country","dob":"DD/MM/YYYY","expiry":"DD/MM/YYYY","sponsor":"sponsor name from back","gender":"Male or Female"}
Return only the JSON object, no markdown, no explanation.`,
    });

    console.log("6. Calling Claude API with", content.length, "content items...");
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 400,
      messages: [{ role: "user", content }],
    });

    console.log("7. Claude responded with", message.content.length, "content blocks");
    console.log("8. First block type:", message.content[0]?.type);

    if (!message.content[0] || message.content[0].type !== "text") {
      console.error("ERROR: Unexpected response format from Claude");
      return new Response(
        JSON.stringify({ error: "Invalid response from Claude" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = message.content[0].text;
    console.log("9. Raw text response:", raw.substring(0, 200) + "...");

    const clean = raw.replace(/```json|```/g, "").trim();
    console.log("10. Cleaned text:", clean.substring(0, 200) + "...");

    const data = JSON.parse(clean);
    console.log("11. Successfully parsed JSON:", Object.keys(data).join(", "));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CATCH ERROR:", error.message);
    console.error("Stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
