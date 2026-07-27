const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured transaction data from a receipt image URL using Gemini Vision.
 * Returns { merchant, amount, date, category, items }
 */
const extractReceiptData = async (imageUrl) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const imageResp = await fetch(imageUrl);
  const arrayBuffer = await imageResp.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

  const prompt = `You are a receipt-parsing engine. Look at this receipt image and return ONLY valid JSON
(no markdown fences, no extra text) with this exact shape:
{
  "merchant": string,
  "amount": number,
  "date": string (YYYY-MM-DD, use today's date if not visible),
  "category": string (one of: Food, Groceries, Transport, Shopping, Bills, Entertainment, Health, Travel, Other),
  "items": string[] (short item names, empty array if not readable)
}
If the image is not a receipt, set amount to 0 and category to "Other".`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType } },
  ]);

  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Could not parse receipt data from Gemini response");
  }
};

/**
 * Generates a short natural-language financial insight from a summary of the user's transactions.
 */
const generateInsight = async (summaryText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `You are a friendly personal finance copilot. Based on this monthly summary, give the user
one short, specific, encouraging insight (max 3 sentences) about their spending. Avoid generic advice.

Summary:
${summaryText}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

/**
 * Answers a natural-language question about the user's finances, grounded in a
 * pre-computed data context (so the model never invents numbers).
 */
const answerFinanceQuery = async (question, dataContext) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `You are FinPilot, a personal finance copilot embedded in a dashboard. Answer the user's
question using ONLY the data below — never invent numbers. If the data doesn't contain what's needed,
say so plainly. Keep the answer conversational, max 4 sentences, and reference actual figures.

DATA (JSON):
${JSON.stringify(dataContext)}

USER QUESTION:
${question}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

/**
 * Turns a computed health-score breakdown into a one-line human explanation.
 */
const explainHealthScore = async (breakdown) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `Given this financial health score breakdown (each sub-score is out of 100), write ONE
encouraging, specific sentence explaining the overall score and the single biggest lever to improve it.
No generic advice.

${JSON.stringify(breakdown)}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

/**
 * Streaming variant of answerFinanceQuery — calls onChunk(text) as tokens arrive,
 * for the "typing" effect in the live chat UI.
 */
const answerFinanceQueryStream = async (question, dataContext, onChunk) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `You are FinPilot, a personal finance copilot embedded in a dashboard. Answer the user's
question using ONLY the data below — never invent numbers. If the data doesn't contain what's needed,
say so plainly. Keep the answer conversational, max 4 sentences, and reference actual figures.

DATA (JSON):
${JSON.stringify(dataContext)}

USER QUESTION:
${question}`;

  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) onChunk(text);
  }
};

/**
 * Parses a spoken transcript like "add 250 for lunch" or "mujhe 500 rupaye grocery pe kharch hue"
 * into a structured transaction suggestion.
 */
const parseVoiceTranscript = async (transcript, categories) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `You are a voice-entry parser for a finance app. The user spoke (may be Hindi/English/Hinglish):
"${transcript}"

Available categories: ${categories.join(", ")}

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "type": "income" | "expense",
  "amount": number,
  "category": string (pick the closest match from the available categories, or "Other"),
  "note": string (short description of what it was for)
}
If amount cannot be determined, set it to 0.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Could not parse the voice transcript into a transaction");
  }
};

/**
 * Generates a full narrative monthly report (for export/print), grounded in real aggregates.
 */
const generateMonthlyReport = async (statsContext) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const prompt = `You are FinPilot, a personal finance copilot. Write a short monthly financial report
(4-6 sentences) for the user based ONLY on this real data — never invent numbers. Cover: how the month
went overall, the biggest spending category, one specific win, and one specific, actionable suggestion
for next month.

DATA (JSON):
${JSON.stringify(statsContext)}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = {
  extractReceiptData,
  generateInsight,
  answerFinanceQuery,
  explainHealthScore,
  answerFinanceQueryStream,
  parseVoiceTranscript,
  generateMonthlyReport,
};