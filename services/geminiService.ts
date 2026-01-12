
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getFinancialAdvice = async (transactions: Transaction[]) => {
  if (transactions.length === 0) return "Adicione algumas transações para receber conselhos financeiros personalizados.";

  const prompt = `
    Analise o seguinte fluxo de caixa doméstico e forneça 3 dicas curtas e práticas de economia ou gestão:
    ${JSON.stringify(transactions.map(t => ({ 
      tipo: t.type, 
      valor: t.amount, 
      categoria: t.category, 
      desc: t.description 
    })))}
    Responda em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter conselhos:", error);
    return "Não foi possível gerar dicas no momento. Revise seus gastos manualmente.";
  }
};
