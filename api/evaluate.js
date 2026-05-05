export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check if the key is missing on the server
    if (!apiKey) {
        return res.status(500).json({ error: "Server Configuration Error: GEMINI_API_KEY is missing." });
    }

    const { prompt } = req.body;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // If Gemini rejects the request (e.g., bad API key, quota exceeded)
        if (!response.ok) {
            return res.status(500).json({ error: `Gemini API Error: ${data.error?.message || response.statusText}` });
        }

        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        if (!resultText) {
            return res.status(500).json({ error: "Gemini API returned an empty response." });
        }
        
        res.status(200).json({ result: resultText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}