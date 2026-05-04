export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                score: { type: "NUMBER" },
                feedback: { type: "STRING" },
              },
              required: ["score", "feedback"],
            },
          },
        }),
      },
    );

    const data = await response.json();
    const evalResult = JSON.parse(data.candidates[0].content.parts[0].text);

    res.status(200).json(evalResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
