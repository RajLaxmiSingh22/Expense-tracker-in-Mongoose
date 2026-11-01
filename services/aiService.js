const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Must match the <option> values in views/home.html
export const CATEGORIES = ["Food", "Groceries", "Transportation", "Entertainment", "Miscellaneous"];

class AIService {
  async suggestCategory(description) {
    const prompt =
      `Classify this expense into exactly one category from: ${CATEGORIES.join(", ")}.\n` +
      `Expense: "${description}"\n` +
      `Reply with only the category name.`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(10000), // don't hang the request if Gemini is slow
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Only accept an answer that is one of our categories
    return CATEGORIES.find((c) => text.toLowerCase().includes(c.toLowerCase())) || "Miscellaneous";
  }
}

export default new AIService();
