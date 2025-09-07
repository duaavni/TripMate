import { type ActionFunctionArgs, data } from "react-router";
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripData } from '~/lib/agents/types';

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { tripData } = await request.json();

        if (!tripData) {
            return data({ 
                success: false, 
                error: 'Trip data is required for planning' 
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
Create a detailed ${tripData.duration}-day travel itinerary for ${tripData.country}.

User Preferences:
- Travel Style: ${tripData.travelStyle}
- Interests: ${tripData.interests}
- Budget: ${tripData.budget}
- Group Type: ${tripData.groupType}
- Start Date: ${tripData.startDate || 'Not specified'}
- Origin (Travel From): ${tripData.travelFrom || 'Not specified'}
- Additional Notes: ${tripData.notes || 'None'}

VERY IMPORTANT: All prices must be in Indian Rupees (INR) with the symbol ₹ and realistic Indian pricing. Do not use USD or any other currency.

Return ONLY a JSON response with this exact structure:
{
  "name": "Trip title",
  "description": "Brief trip description",
  "estimatedPrice": "₹XXXXX",
  "itinerary": [
    {
      "day": 1,
      "location": "City/Area name",
      "activities": [
        {"time": "Morning", "description": "Activity description"},
        {"time": "Afternoon", "description": "Activity description"},
        {"time": "Evening", "description": "Activity description"}
      ]
    }
  ]
}

Make it realistic, practical, and tailored to the user's preferences. No additional text, just the JSON.
`;

        const result = await model.generateContent([prompt]);
        const responseText = result.response.text();
        
        // Parse JSON from response
        let itinerary;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                itinerary = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback response
            itinerary = {
                name: `${tripData.duration}-Day ${tripData.country} Adventure`,
                description: `A ${tripData.travelStyle.toLowerCase()} trip to ${tripData.country}`,
                estimatedPrice: tripData.budget === 'Budget' ? '$500' : tripData.budget === 'Luxury' ? '$3000' : '$1500',
                itinerary: Array.from({ length: tripData.duration }, (_, i) => ({
                    day: i + 1,
                    location: `${tripData.country} - Day ${i + 1}`,
                    activities: [
                        { time: 'Morning', description: `Explore local attractions and ${tripData.interests.toLowerCase()}` },
                        { time: 'Afternoon', description: 'Enjoy local cuisine and cultural experiences' },
                        { time: 'Evening', description: 'Relax and prepare for the next day' }
                    ]
                }))
            };
        }

        return data({
            success: true,
            data: {
                itinerary: itinerary.itinerary,
                estimatedPrice: itinerary.estimatedPrice,
                recommendations: [
                    'Book accommodations early for better rates',
                    'Research local customs and cultural etiquette',
                    'Download offline maps and translation apps'
                ]
            }
        });

    } catch (error) {
        console.error('Planner agent error:', error);
        return data({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Trip planning failed' 
        });
    }
};
