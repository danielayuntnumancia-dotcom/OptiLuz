import { BillAnalysis } from "../types";

export const analyzeEnergyBill = async (base64Image: string, mimeType: string): Promise<BillAnalysis> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ base64Image, mimeType })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analyze API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data as BillAnalysis;
  } catch (error) {
    console.error("Error analyzing bill:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  analysisContext?: BillAnalysis | null
) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ history, newMessage, analysisContext })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};