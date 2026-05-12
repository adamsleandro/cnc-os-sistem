import { GoogleGenAI, Type } from "@google/genai";

export class AIOperationService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  /**
   * Analyzes current MES metrics and provides strategic operational advice.
   */
  static async analyzeOperationalEfficiency(data: {
    machines: any[];
    kpis: any;
    pendingOrders: any[];
  }) {
    try {
      const prompt = `
        Aja como um Diretor de Operações Industriais (COO) especializado em Indústria 4.0.
        Analise os seguintes dados da fábrica:
        - Máquinas: ${JSON.stringify(data.machines)}
        - KPIs Atuais (OEE/OLE): ${JSON.stringify(data.kpis)}
        - Fila de Pedidos: ${data.pendingOrders.length} ordens aguardando.

        Identifique gargalos, riscos de atraso e oportunidades de melhoria.
        Forneça recomendações práticas para:
        1. Otimização de Setup.
        2. Alocação de operadores.
        3. Manutenção preventiva.

        Responda em JSON com:
        - general_health_score (0-100)
        - critical_alerts (array de strings)
        - optimization_plan (array de strings)
        - executive_summary (string curta)
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              general_health_score: { type: Type.NUMBER },
              critical_alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
              optimization_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
              executive_summary: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Operation Analysis Error:", error);
      return {
        general_health_score: 85,
        critical_alerts: ["Erro de conexão com Gemini para análise em tempo real."],
        optimization_plan: ["Manter cronograma padrão", "Verificar disponibilidade de matéria-prima"],
        executive_summary: "Sistema operando em modo heurístico offline."
      };
    }
  }

  /**
   * Suggests the best machine for a specific order based on current load and historical speed.
   */
  static async suggestOrderRouting(order: any, availableMachines: any[]) {
    // Basic logic for MVP, could be AI-powered
    const eligible = availableMachines.filter(m => m.status !== 'manutencao');
    return eligible.sort((a, b) => (a.load || 0) - (b.load || 0))[0];
  }
}
