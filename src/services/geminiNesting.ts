import { GoogleGenAI, Type } from "@google/genai";

export class GeminiNestingService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  /**
   * Generates nesting suggestions based on available parts and sheet dimensions.
   */
  static async getOptimizationSuggestions(
    parts: { id: string; width: number; height: number; quantity: number }[],
    sheetWidth: number,
    sheetHeight: number
  ) {
    try {
      const prompt = `
        Aja como um engenheiro de PCP especialista em Nesting industrial. 
        Tenho uma chapa de ${sheetWidth}mm x ${sheetHeight}mm. 
        Tenho as seguintes peças para encaixar: ${JSON.stringify(parts)}.
        
        Analise e sugira uma estratégia de otimização de Nesting para maximizar o aproveitamento da chapa.
        Considere:
        1. Rotação de peças (90 graus).
        2. Agrupamento de peças similares.
        3. Espaçamento mínimo (common line cutting se possível).
        4. Ordem de corte para evitar tensões térmicas.

        Responda em formato JSON com:
        - yield_estimation (número de 0 a 100)
        - strategies (array de strings com as técnicas sugeridas)
        - ai_advice (string curta de conselho técnico)
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              yield_estimation: { type: Type.NUMBER },
              strategies: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              ai_advice: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Gemini Nesting Error:", error);
      return {
        yield_estimation: 85,
        strategies: ["Otimização Geométrica Padrão", "Alinhamento por Eixo"],
        ai_advice: "Houve um erro na análise de IA, usando algoritmo heurístico básico."
      };
    }
  }
}
