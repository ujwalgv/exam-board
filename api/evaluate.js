export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Safely extract the key and remove any accidental whitespace or quotes
  let rawKey = process.env.GEMINI_API_KEY || "";
  const apiKey = rawKey.replace(/['"]/g, "").trim();

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Gemini Network Error: API Key configuration missing." });
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
      // Keep generic professional error for client
      return res.status(500).json({
        error: "Gemini Network Error: Unable to complete verification.",
      });
    }

    const resultText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "FAILED: Unable to evaluate.";
    res.status(200).json({ result: resultText });
  } catch (error) {
    res.status(500).json({
      error: "Gemini Network Error: Unable to complete verification.",
    });
  }
}
