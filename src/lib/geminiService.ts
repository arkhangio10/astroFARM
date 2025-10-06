import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export interface AIGeneratedScenario {
  ndvi: number;
  soilMoisture: number;
  temperature: number;
  precipitationForecast: number;
  cloudCover: number;
  scenario: string;
  description: string;
  risks: string[];
  recommendations: string[];
  dataAge: number;
}

export class GeminiWeatherService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async generateScenarioFromHistoricalData(
    region: string,
    cropType: string,
    historicalData: {
      ndvi: number[];
      soilMoisture: number[];
      temperature: number[];
      precipitation: number[];
    }
  ): Promise<AIGeneratedScenario> {
    const prompt = `
As an expert in agronomy and NASA data analysis, generate a realistic but challenging climate scenario for the ${region} region for a ${cropType} crop.

Historical data from the last 7 days:
- Average NDVI: ${(historicalData.ndvi.reduce((a, b) => a + b, 0) / historicalData.ndvi.length).toFixed(2)}
- Average soil moisture: ${(historicalData.soilMoisture.reduce((a, b) => a + b, 0) / historicalData.soilMoisture.length).toFixed(1)}%
- Average temperature: ${(historicalData.temperature.reduce((a, b) => a + b, 0) / historicalData.temperature.length).toFixed(1)}°C
- Accumulated precipitation: ${historicalData.precipitation.reduce((a, b) => a + b, 0).toFixed(1)}mm

Generate a REALISTIC future scenario representing an extreme but possible climate situation (drought, frost, excessive rain, heat wave, etc).

IMPORTANTE:
- Description: máximo 60 caracteres
- Risks: máximo 3 items, cada uno máximo 40 caracteres
- Recommendations: máximo 3 items, cada uno máximo 40 caracteres

Respond ONLY with a valid JSON in this exact format:
{
  "ndvi": 0.65,
  "soilMoisture": 0.45,
  "temperature": 28,
  "precipitationForecast": 2,
  "cloudCover": 0.3,
  "scenario": "Moderate heat wave",
  "description": "Heat wave with high temperatures and low humidity",
  "risks": ["Water stress", "Reduced growth", "High evaporation"],
  "recommendations": ["Water more often", "Apply mulch", "Water early"],
  "dataAge": 1
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer JSON del texto
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback si no se puede parsear
      return this.getFallbackScenario();
    } catch (error) {
      console.error('Error generando escenario con Gemini:', error);
      return this.getFallbackScenario();
    }
  }

  async generateAdaptiveTip(
    currentData: any,
    cropState: any,
    isAIMode: boolean,
    scenario?: string
  ): Promise<string> {
    const prompt = `
As an expert agricultural advisor, generate specific and actionable advice.

Context:
- Mode: ${isAIMode ? 'AI Simulation' : 'Real NASA Data'}
${isAIMode && scenario ? `- Simulated scenario: ${scenario}` : ''}
- Crop state: ${cropState.growth}% growth, ${cropState.health}% health
- NDVI: ${(currentData.ndvi * 100).toFixed(0)}%
- Soil moisture: ${(currentData.soilMoisture * 100).toFixed(0)}%
- Temperature: ${currentData.temperature}°C

Generate ONE short advice (maximum 20 words) that is specific and actionable.
${isAIMode ? 'The advice should prepare the farmer for the simulated scenario.' : 'The advice should be based on current satellite data.'}

Respond ONLY with the advice, no additional formatting.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generando tip:', error);
      return isAIMode 
        ? '🤖 Practice with this extreme scenario to be prepared'
        : '🛰️ NASA data shows normal conditions for your crop';
    }
  }

  private getFallbackScenario(): AIGeneratedScenario {
    const scenarios = [
      {
        ndvi: 0.35,
        soilMoisture: 0.15,
        temperature: 38,
        precipitationForecast: 0,
        cloudCover: 0.05,
        scenario: 'Severe drought',
        description: 'Extreme drought conditions with high temperature and low humidity',
        risks: ['Crop loss', 'Severe water stress', 'Wilting'],
        recommendations: ['Emergency irrigation', 'Temporary shade', 'Reduce planting density'],
        dataAge: 1
      },
      {
        ndvi: 0.75,
        soilMoisture: 0.85,
        temperature: 18,
        precipitationForecast: 25,
        cloudCover: 0.90,
        scenario: 'Heavy rain',
        description: 'Heavy rain season with flood risk',
        risks: ['Waterlogging', 'Fungal diseases', 'Nutrient loss'],
        recommendations: ['Improve drainage', 'Apply preventive fungicides', 'Protect sensitive crops'],
        dataAge: 1
      },
      {
        ndvi: 0.45,
        soilMoisture: 0.40,
        temperature: 2,
        precipitationForecast: 0,
        cloudCover: 0.10,
        scenario: 'Frost risk',
        description: 'Temperature near freezing point',
        risks: ['Frost damage', 'Growth halt', 'Tissue death'],
        recommendations: ['Night irrigation', 'Crop cover', 'Continuous monitoring'],
        dataAge: 1
      },
      {
        ndvi: 0.80,
        soilMoisture: 0.65,
        temperature: 24,
        precipitationForecast: 5,
        cloudCover: 0.30,
        scenario: 'Ideal conditions',
        description: 'Optimal conditions for growth',
        risks: [],
        recommendations: ['Maintain current practices', 'Monitor regularly'],
        dataAge: 1
      },
      {
        ndvi: 0.50,
        soilMoisture: 0.25,
        temperature: 42,
        precipitationForecast: 0,
        cloudCover: 0.02,
        scenario: 'Extreme heat wave',
        description: 'Dangerous temperatures for crops',
        risks: ['Thermal stress', 'Leaf burns', 'Production loss'],
        recommendations: ['Intensive irrigation', 'Shade cloth', 'Sprinkler irrigation'],
        dataAge: 1
      }
    ];
    
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }
}

export const geminiService = new GeminiWeatherService();
