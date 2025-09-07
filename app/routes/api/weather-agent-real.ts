import { type ActionFunctionArgs, data } from "react-router";
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripData } from '~/lib/agents/types';

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { tripData } = await request.json();

        if (!tripData) {
            return data({ 
                success: false, 
                error: 'Trip data is required' 
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return data({ 
                success: false, 
                error: 'AI service not configured' 
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
Provide weather information and recommendations for a trip to ${tripData.country} for ${tripData.duration} days.

Travel Details:
- Start Date: ${tripData.startDate || 'Not specified'}
- Travel Style: ${tripData.travelStyle}
- Interests: ${tripData.interests}

Return ONLY a JSON response with this exact structure (use metric units):
{
  "currentWeather": {
    "temperature": 25,
    "condition": "Sunny",
    "humidity": 60,
    "windSpeed": 10,
    "description": "Current weather description"
  },
  "forecast": [
    {
      "date": "2024-01-01",
      "temperature": {"min": 20, "max": 28},
      "condition": "Partly Cloudy",
      "precipitation": 10
    }
  ],
  "alternatives": [
    {
      "activity": "Outdoor activity",
      "reason": "Weather concern",
      "indoorAlternative": "Indoor alternative"
    }
  ]
}

Provide realistic weather data and practical alternatives. No additional text, just the JSON.
`;

        const result = await model.generateContent([prompt]);
        const responseText = result.response.text();
        
        // Parse JSON from response
        let weather;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                weather = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback response
            weather = {
                currentWeather: {
                    temperature: 22,
                    condition: 'Pleasant',
                    humidity: 65,
                    windSpeed: 8,
                    description: 'Good weather for travel'
                },
                forecast: Array.from({ length: tripData.duration }, (_, i) => ({
                    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    temperature: { min: 18, max: 26 },
                    condition: 'Partly Cloudy',
                    precipitation: 20
                })),
                alternatives: []
            };
        }

        return data({
            success: true,
            data: weather
        });

    } catch (error) {
        console.error('Weather agent error:', error);
        return data({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Weather check failed' 
        });
    }
};
