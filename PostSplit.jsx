// Vercel serverless function — runs on the server, NOT in the browser.
// Keeps your ANTHROPIC_API_KEY hidden from anyone using the app.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64, mediaType } = req.body;

  if (!base64 || !mediaType) {
    return res.status(400).json({ error: "Missing image data" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `Extract every line item and price from this receipt.
Return ONLY valid JSON, no markdown, no explanation:
{"items":[{"name":"Item name","price":0.00}],"total":0.00}
Round prices to 2 decimal places. Do not include tax or tip as items — only food/drink items.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
