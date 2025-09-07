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
Provide local transport options and recommendations for ${tripData.country}.

Travel Details:
- Duration: ${tripData.duration} days
- Travel Style: ${tripData.travelStyle}
- Budget: ${tripData.budget}
- Group Type: ${tripData.groupType}

VERY IMPORTANT: All costs must be in Indian Rupees (INR) with the symbol ₹.

Return ONLY a JSON response with this exact structure:
{
  "localTransport": [
    {
      "type": "metro",
      "name": "Metro System",
      "description": "Fast and efficient urban transport",
      "cost": "₹200",
      "duration": "15-30 min",
      "availability": "5:00 AM - 12:00 AM"
    }
  ],
  "routes": [
    {
      "from": "Airport",
      "to": "City Center",
      "options": [
        {
          "type": "train",
          "name": "Airport Express",
          "description": "Direct train to city center",
          "cost": 15,
          "duration": "45 min",
          "availability": "5:00 AM - 11:00 PM"
        }
      ],
      "totalCost": "₹1200",
      "totalDuration": "45 min"
    }
  ],
  "costs": [
    {
      "type": "Daily Transport",
      "cost": "₹2000",
      "currency": "INR"
    }
  ]
}

Provide realistic transport options for the destination. No additional text, just the JSON.
`;

        const result = await model.generateContent([prompt]);
        const responseText = result.response.text();
        
        // Parse JSON from response
        let transport;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                transport = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback response
            transport = {
                localTransport: [
                    {
                        type: 'metro',
                        name: 'Public Transport',
                        description: 'Efficient local transport system',
                        cost: 3,
                        duration: '20-40 min',
                        availability: '5:00 AM - 11:00 PM'
                    },
                    {
                        type: 'taxi',
                        name: 'Taxi/Rideshare',
                        description: 'Door-to-door convenience',
                        cost: 15,
                        duration: '10-25 min',
                        availability: '24/7'
                    }
                ],
                routes: [
                    {
                        from: 'Airport',
                        to: 'City Center',
                        options: [
                            {
                                type: 'train',
                                name: 'Airport Express',
                                description: 'Direct train to city center',
                                cost: 15,
                                duration: '45 min',
                                availability: '5:00 AM - 11:00 PM'
                            }
                        ],
                        totalCost: 15,
                        totalDuration: '45 min'
                    }
                ],
                costs: [
                    {
                        type: 'Daily Transport',
                        cost: 25,
                        currency: 'USD'
                    }
                ]
            };
        }

        return data({
            success: true,
            data: transport
        });

    } catch (error) {
        console.error('Transport agent error:', error);
        return data({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Transport planning failed' 
        });
    }
};
