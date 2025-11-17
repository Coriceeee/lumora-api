import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ==== CORS FIX ====
  res.setHeader("Access-Control-Allow-Origin", "*"); // hoặc thay * bằng "https://lumora.ai.vn"
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ==================

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, temperature } = req.body as {
    prompt?: string;
    temperature?: number;
  };

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    return res.status(500).json({ error: "Server error calling Gemini" });
  }
}
