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
Find the best travel deals for a trip to ${tripData.country} for ${tripData.duration} days.

Travel Details:
- Origin (Travel From): ${tripData.travelFrom || 'Not specified'}
- Budget: ${tripData.budget}
- Travel Style: ${tripData.travelStyle}
- Group Type: ${tripData.groupType}
- Start Date: ${tripData.startDate || 'Not specified'}
- Additional Notes: ${tripData.notes || 'None'}

VERY IMPORTANT: All prices must be in Indian Rupees (INR) with the symbol ₹ and realistic Indian market pricing.

Return ONLY a JSON response with this exact structure:
{
  "flights": [
    {
      "id": "flight_1",
      "airline": "Airline Name",
      "from": "${tripData.travelFrom || 'Origin'}",
      "to": "${tripData.country}",
      "departure": "8:00 AM",
      "arrival": "2:00 PM",
      "price": "₹25000",
      "duration": "6h 30m",
      "stops": 1,
      "bookingUrl": "https://example.com/book"
    }
  ],
  "hotels": [
    {
      "id": "hotel_1",
      "name": "Hotel Name",
      "location": "City Center",
      "pricePerNight": "₹5000",
      "rating": 4.5,
      "amenities": ["WiFi", "Pool", "Restaurant"],
      "bookingUrl": "https://example.com/book"
    }
  ],
  "packages": [
    {
      "id": "package_1",
      "name": "Complete Package",
      "description": "Flight + Hotel + Activities",
      "price": "₹75000",
      "includes": ["Round-trip flights", "3-star hotel", "City tours"],
      "bookingUrl": "https://example.com/book"
    }
  ],
  "bestDeals": [
    {
      "id": "deal_1",
      "type": "package",
      "title": "Best Package Deal",
      "originalPrice": "₹90000",
      "discountedPrice": "₹75000",
      "discount": 17,
      "validUntil": "2024-12-31",
      "bookingUrl": "https://example.com/book"
    }
  ]
}

Provide realistic deals based on the budget, origin and destination. No additional text, just the JSON.
`;

        const result = await model.generateContent([prompt]);
        const responseText = result.response.text();
        
        // Parse JSON from response
        let deals;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                deals = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback response
            const basePrice = tripData.budget === 'Budget' ? 300 : tripData.budget === 'Luxury' ? 1200 : 600;
            deals = {
                flights: [
                    {
                        id: 'flight_1',
                        airline: 'Major Airline',
                        departure: '8:00 AM',
                        arrival: '2:00 PM',
                        price: basePrice,
                        duration: '6h 30m',
                        stops: 1,
                        bookingUrl: 'https://example.com/book'
                    }
                ],
                hotels: [
                    {
                        id: 'hotel_1',
                        name: 'City Hotel',
                        location: 'City Center',
                        price: basePrice / 3,
                        rating: 4.2,
                        amenities: ['WiFi', 'Pool', 'Restaurant'],
                        bookingUrl: 'https://example.com/book'
                    }
                ],
                packages: [
                    {
                        id: 'package_1',
                        name: 'Complete Package',
                        description: 'Flight + Hotel + Activities',
                        price: basePrice * 1.5,
                        includes: ['Round-trip flights', 'Hotel accommodation', 'City tours'],
                        bookingUrl: 'https://example.com/book'
                    }
                ],
                bestDeals: [
                    {
                        id: 'deal_1',
                        type: 'package',
                        title: `Best ${tripData.country} Package Deal`,
                        originalPrice: basePrice * 2,
                        discountedPrice: basePrice * 1.5,
                        discount: 25,
                        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        bookingUrl: 'https://example.com/book'
                    }
                ]
            };
        }

        return data({
            success: true,
            data: deals
        });

    } catch (error) {
        console.error('Deal finder agent error:', error);
        return data({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Deal search failed' 
        });
    }
};
