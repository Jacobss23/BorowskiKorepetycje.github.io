import { GoogleGenAI, Type } from "@google/genai";
import { MathProblem, EducationLevel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is set
export const isApiKeySet = (): boolean => !!apiKey;

export const generateMathProblems = async (
  topic: string,
  level: EducationLevel,
  count: number = 3
): Promise<MathProblem[]> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `Jesteś doświadczonym nauczycielem matematyki. Wygeneruj ${count} zadań matematycznych z tematu: "${topic}" dla ucznia na poziomie: ${level}.
  Odpowiedzi muszą być w języku polskim.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Treść zadania" },
              answer: { type: Type.STRING, description: "Wynik lub krótka odpowiedź" },
              difficulty: { type: Type.STRING, description: "Poziom trudności: 'Łatwe', 'Średnie', lub 'Trudne'" },
              stepByStep: { type: Type.STRING, description: "Krótka wskazówka jak rozwiązać zadanie" }
            },
            required: ["question", "answer", "difficulty"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MathProblem[];
    }
    return [];
  } catch (error) {
    console.error("Error generating math problems:", error);
    throw error;
  }
};

export const explainConcept = async (topic: string, level: EducationLevel): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `Wyjaśnij pojęcie matematyczne: "${topic}" w sposób prosty i zrozumiały dla ucznia na poziomie: ${level}. Użyj przykładów z życia wziętych jeśli to możliwe. Formatuj odpowiedź używając Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować wyjaśnienia.";
  } catch (error) {
    console.error("Error explaining concept:", error);
    return "Wystąpił błąd podczas generowania wyjaśnienia.";
  }
};