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
    const body = await req.json();
    const { images } = body;

    if (!images || (!images.front && !images.back)) {
      return new Response(
        JSON.stringify({ error: "No images provided in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });

    const content = [];

    if (images.front) {
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

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 400,
      messages: [{ role: "user", content }],
    });

    if (!message.content[0] || message.content[0].type !== "text") {
      return new Response(
        JSON.stringify({ error: "Claude did not return text response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = message.content[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    
    return new Response(
      JSON.stringify({ 
        error: errorMsg,
        stack: errorStack,
        type: error?.constructor?.name || "Unknown"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
