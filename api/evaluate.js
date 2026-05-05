export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Safely extract the key and remove any accidental whitespace or quotes
  let rawKey = process.env.GEMINI_API_KEY_2 || "";
  const apiKey = rawKey.replace(/['"]/g, "").trim();

  // Diagnostic Tool: Get the first 5 and last 4 characters of the key to verify which key Vercel is actually using
  const keyPrefix = apiKey.length > 10 ? apiKey.substring(0, 5) : "NONE";
  const keySuffix = apiKey.length > 10 ? apiKey.slice(-4) : "NONE";
  const debugKeyInfo = `${keyPrefix}...${keySuffix}`;

  if (!apiKey) {
    return res
      .status(500)
      .json({
        error:
          "Server Configuration Error: GEMINI_API_KEY_2 is missing in Vercel.",
      });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      // Appending the debugKeyInfo here so you can verify on your live site!
      return res.status(500).json({
        error: `Gemini API Error: ${data.error?.message || response.statusText} (Vercel is using Key: ${debugKeyInfo})`,
      });
    }

    const resultText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "FAILED: Unable to evaluate.";
    res.status(200).json({ result: resultText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
