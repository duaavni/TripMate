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
Create travel reminders and notifications for a trip to ${tripData.country} for ${tripData.duration} days.

Travel Details:
- Start Date: ${tripData.startDate || 'Not specified'}
- Travel Style: ${tripData.travelStyle}
- Budget: ${tripData.budget}
- Group Type: ${tripData.groupType}

Return ONLY a JSON response with this exact structure:
{
  "reminders": [
    {
      "id": "reminder_1",
      "title": "Book Flights",
      "description": "Secure your flight tickets",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "type": "booking",
      "completed": false
    }
  ],
  "updates": [
    {
      "id": "update_1",
      "title": "Travel Tips",
      "message": "Research local customs and cultural etiquette",
      "type": "general",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "read": false
    }
  ],
  "notifications": [
    {
      "id": "notification_1",
      "title": "Trip Planning Complete!",
      "message": "Your trip is ready!",
      "type": "success",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "actionRequired": false
    }
  ]
}

Create practical reminders and helpful notifications. No additional text, just the JSON.
`;

        const result = await model.generateContent([prompt]);
        const responseText = result.response.text();
        
        // Parse JSON from response
        let reminders;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                reminders = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback response
            const startDate = tripData.startDate ? new Date(tripData.startDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            reminders = {
                reminders: [
                    {
                        id: 'reminder_1',
                        title: 'Book Flights',
                        description: 'Secure your flight tickets for the best prices',
                        dueDate: new Date(startDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                        type: 'booking',
                        completed: false
                    },
                    {
                        id: 'reminder_2',
                        title: 'Book Accommodations',
                        description: 'Reserve your hotel or accommodation',
                        dueDate: new Date(startDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        type: 'booking',
                        completed: false
                    },
                    {
                        id: 'reminder_3',
                        title: 'Check Documents',
                        description: 'Ensure passport and required documents are ready',
                        dueDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        type: 'preparation',
                        completed: false
                    }
                ],
                updates: [
                    {
                        id: 'update_1',
                        title: 'Travel Tips for Your Destination',
                        message: `Research local customs and cultural etiquette for ${tripData.country}`,
                        type: 'general',
                        timestamp: new Date().toISOString(),
                        read: false
                    }
                ],
                notifications: [
                    {
                        id: 'notification_1',
                        title: 'Trip Planning Complete!',
                        message: `Your ${tripData.duration}-day trip to ${tripData.country} is ready!`,
                        type: 'success',
                        timestamp: new Date().toISOString(),
                        actionRequired: false
                    }
                ]
            };
        }

        return data({
            success: true,
            data: reminders
        });

    } catch (error) {
        console.error('Messenger agent error:', error);
        return data({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Reminder setup failed' 
        });
    }
};
