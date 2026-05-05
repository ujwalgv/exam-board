export default function handler(req, res) {
    // This allows the frontend to request the Supabase keys securely 
    // from Vercel's Environment Variables during runtime.
    res.status(200).json({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    });
}