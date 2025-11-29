import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateInsights(data: any) {
  if (!genAI) {
    console.warn("GEMINI_API_KEY not found. Returning mock insights.");
    return getMockInsights();
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      Analyze the following freelance business data and provide 3 concise, actionable insights.
      Focus on revenue trends, client behavior, and expense optimization.
      Return the response as a JSON object with keys: "revenue", "client", "expense".
      Each value should be a short string (max 1 sentence).

      Data: ${JSON.stringify(data)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    try {
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
      return getMockInsights();
    }
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return getMockInsights();
  }
}

function getMockInsights() {
  return {
    revenue: "Based on your current project pipeline, you are projected to exceed your monthly goal by 15%.",
    client: "Acme Corp pays 5 days early on average. Consider offering them a retainer.",
    expense: "You have 2 unused subscriptions (Adobe, Figma) that haven't been active for 30 days."
  };
}
