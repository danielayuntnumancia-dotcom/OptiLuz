import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    clientName: { type: Type.STRING, description: "Name of the client if available" },
    cups: { type: Type.STRING, description: "CUPS identifier" },
    currentProvider: { type: Type.STRING, description: "Current energy provider name" },
    currentTariff: { type: Type.STRING, description: "Current tariff name (e.g., PVPC, Plan Estable)" },
    contractedPowerP1: { type: Type.NUMBER, description: "Contracted power in kW for period 1" },
    contractedPowerP2: { type: Type.NUMBER, description: "Contracted power in kW for period 2" },
    consumptionP1: { type: Type.NUMBER, description: "Consumption in kWh for period 1 (Punta)" },
    consumptionP2: { type: Type.NUMBER, description: "Consumption in kWh for period 2 (Llano)" },
    consumptionP3: { type: Type.NUMBER, description: "Consumption in kWh for period 3 (Valle)" },
    totalConsumption: { type: Type.NUMBER, description: "Total consumption in kWh" },
    billingPeriodStart: { type: Type.STRING, description: "Start date of billing period" },
    billingPeriodEnd: { type: Type.STRING, description: "End date of billing period" },
    currentTotalCost: { type: Type.NUMBER, description: "Total invoice amount in Euros" },
    powerOptimizationSuggestion: { type: Type.STRING, description: "Suggestion to optimize contracted power based on usage" },
    narrativeAnalysis: { type: Type.STRING, description: "A detailed summary explaining the analysis, detected inefficiencies, and why specific recommendations were made." },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          companyName: { type: Type.STRING },
          tariffName: { type: Type.STRING },
          url: { type: Type.STRING, description: "A real URL to the tariff page or the company's main website for hiring." },
          estimatedMonthlyCost: { type: Type.NUMBER, description: "Total estimated monthly cost (Energy + Power + Tax)" },
          estimatedPowerCost: { type: Type.NUMBER, description: "Estimated monthly cost specifically for the fixed Power Term (Potencia)" },
          estimatedEnergyCost: { type: Type.NUMBER, description: "Estimated monthly cost specifically for Energy Consumption (Energía)" },
          pricePerKwh: { type: Type.NUMBER, description: "The average price per kWh used for this calculation (e.g. 0.12)" },
          savingsAmount: { type: Type.NUMBER },
          savingsPercentage: { type: Type.NUMBER },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          contractDuration: { type: Type.STRING },
          greenEnergy: { type: Type.BOOLEAN }
        }
      }
    }
  },
  required: ["recommendations", "narrativeAnalysis", "totalConsumption", "currentTotalCost"]
};

const prompt = `
  Analiza esta factura de energía eléctrica española. Extrae los datos técnicos (consumo, potencia, costes).
  A continuación, actúa como un consultor energético experto en el mercado español.
  Utilizando tu conocimiento sobre las tarifas actuales (PVPC, Mercado Libre: Endesa, Iberdrola, Naturgy, Repsol, TotalEnergies, Octopus, etc.),
  recomienda las 3 mejores alternativas para este perfil de consumo.
  
  CRUCIAL:
  1. Para cada recomendación, DESGLOSA el coste estimado mensual en "Coste de Potencia" (Término fijo) y "Coste de Energía" (Consumo).
  2. Indica explícitamente el PRECIO DEL KWH medio que estás usando para la simulación.
  3. Incluye una URL real a la página de la tarifa o compañía para que el usuario pueda contratarla.
  4. Proporciona una lista detallada de PROS (ej: precio fijo, sin permanencia) y CONTRAS (ej: revisable al año, requiere servicio mantenimiento).
  
  Analiza si la potencia contratada es adecuada o si se puede bajar para ahorrar.
`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const jsonText = response.text || "{}";
    let analysis: any;
    try {
      analysis = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse JSON response", e);
      analysis = {};
    }

    if (!analysis.recommendations) analysis.recommendations = [];
    if (!analysis.totalConsumption) analysis.totalConsumption = 0;
    if (!analysis.currentTotalCost) analysis.currentTotalCost = 0;
    if (!analysis.narrativeAnalysis) analysis.narrativeAnalysis = "No se pudo generar un análisis detallado de la factura.";

    res.json(analysis);
  } catch (error: any) {
    console.error("Error analyzing bill:", error);
    res.status(500).json({ error: "Failed to analyze bill", details: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { history, newMessage, analysisContext } = req.body;
    const ai = getAiClient();
    
    let systemInstruction = `Eres 'OptiLuz Bot', un experto consultor energético.
    
    TU OBJETIVO: Ayudar al usuario a reducir su factura.
    
    CAPACIDAD ESPECIAL (MODIFICAR DASHBOARD):
    Tienes el poder de actualizar los cálculos y recomendaciones de la pantalla si el usuario te da nueva información.
    
    SI NECESITAS ACTUALIZAR EL DASHBOARD:
    Responde ÚNICAMENTE con un objeto JSON válido que siga la estructura 'BillAnalysis'.
    IMPORTANTE: En el array 'recommendations', DEBES incluir:
    - 'pricePerKwh' (precio unitario energía)
    - 'estimatedPowerCost' (coste fijo mes potencia)
    - 'estimatedEnergyCost' (coste variable mes energía)
    - 'url' (enlace a la web de la tarifa)
    - 'pros' y 'cons' detallados.
    
    SI SOLO ESTÁS CHARLANDO:
    Responde con texto plano normal, amable y conciso.`;

    if (analysisContext) {
      systemInstruction += `\n\nDATOS ACTUALES DEL DASHBOARD (Usar como base para recalcular si es necesario):\n${JSON.stringify(analysisContext, null, 2)}`;
    }
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to send message", details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
