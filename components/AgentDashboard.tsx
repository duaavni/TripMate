import React, { useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { cn } from '~/lib/utils';
import type { AgentResponse, TripData } from '~/lib/agents/types';

interface AgentDashboardProps {
  result: AgentResponse;
  onClose: () => void;
  className?: string;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ result, onClose, className }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'deals' | 'weather' | 'transport' | 'reminders'>('overview');

  // Always show results section, no error handling
  console.log('AgentDashboard received result:', result);

  const { tripPlan, weather, deals, transport, reminders, suggestions, nextSteps } = result.data || {};
  console.log('Extracted data:', { tripPlan, weather, deals, transport, reminders, suggestions, nextSteps });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗺️' },
    { id: 'deals', label: 'Deals', icon: '💰' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'transport', label: 'Transport', icon: '🚌' },
    { id: 'reminders', label: 'Reminders', icon: '🔔' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🗺️</span>
            <div>
              <p className="text-sm text-gray-600">Trip Plan</p>
              <p className="font-semibold">{tripPlan?.name || 'Ready'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">💰</span>
            <div>
              <p className="text-sm text-gray-600">Best Deals</p>
              <p className="font-semibold">{deals?.bestDeals?.length || 0} found</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🌤️</span>
            <div>
              <p className="text-sm text-gray-600">Weather</p>
              <p className="font-semibold">{weather?.currentWeather?.condition || 'Checked'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🚌</span>
            <div>
              <p className="text-sm text-gray-600">Transport</p>
              <p className="font-semibold">{transport?.localTransport?.length || 0} options</p>
            </div>
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Suggestions</h3>
          <ul className="list-disc list-inside space-y-1">
            {suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="text-sm text-blue-700">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {nextSteps && nextSteps.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">📋 Next Steps</h3>
          <ul className="list-disc list-inside space-y-1">
            {nextSteps.map((step: string, index: number) => (
              <li key={index} className="text-sm text-green-700">{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderItinerary = () => (
    <div className="space-y-4">
      {tripPlan?.itinerary?.map((day: any, index: number) => (
        <div key={index} className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Day {day.day}: {day.location}</h3>
          <div className="space-y-2">
            {day.activities?.map((activity: any, activityIndex: number) => (
              <div key={activityIndex} className="flex items-start space-x-3">
                <span className="text-sm font-medium text-gray-500 w-20">{activity.time}</span>
                <p className="text-sm text-gray-700">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDeals = () => (
    <div className="space-y-6">
      {/* Flights */}
      {deals?.flights && deals.flights.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Flights</h3>
          <div className="space-y-3">
            {deals.flights.map((flight: any, index: number) => (
              <div key={index} className="flex justify-between items-start border rounded p-3">
                <div>
                  <p className="font-medium">{flight.airline}</p>
                  <p className="text-sm text-gray-600">{flight.from} → {flight.to}</p>
                  <p className="text-sm text-gray-600">{flight.departure} - {flight.arrival} • {flight.duration} • {flight.stops} stop(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{flight.price}</p>
                  {flight.bookingUrl && (
                    <ButtonComponent
                      type="button"
                      className="button-class !h-8 !mt-2"
                      onClick={() => window.open(flight.bookingUrl, '_blank')}
                    >
                      <span className="text-sm">Book Flight</span>
                    </ButtonComponent>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotels */}
      {deals?.hotels && deals.hotels.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Hotels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.hotels.map((hotel: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <p className="font-medium">{hotel.name}</p>
                <p className="text-sm text-gray-600">{hotel.location}</p>
                <p className="text-sm text-gray-600">Rating: {hotel.rating}</p>
                <p className="text-sm text-green-600 font-semibold">{hotel.pricePerNight} / night</p>
                {hotel.bookingUrl && (
                  <ButtonComponent
                    type="button"
                    className="button-class !h-8 !mt-2"
                    onClick={() => window.open(hotel.bookingUrl, '_blank')}
                  >
                    <span className="text-sm">Book Hotel</span>
                  </ButtonComponent>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Deals */}
      {deals?.bestDeals?.map((deal: any, index: number) => (
        <div key={index} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{deal.title}</h3>
              <p className="text-sm text-gray-600">Type: {deal.type}</p>
              <p className="text-sm text-gray-600">Valid until: {new Date(deal.validUntil).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">{deal.discountedPrice}</p>
              {deal.originalPrice && (
                <p className="text-sm text-gray-500 line-through">{deal.originalPrice}</p>
              )}
              {deal.discount && (
                <p className="text-sm text-red-600">-{deal.discount}% off</p>
              )}
            </div>
          </div>
          {deal.bookingUrl && (
            <ButtonComponent
              type="button"
              className="button-class !h-8 !mt-2"
              onClick={() => window.open(deal.bookingUrl, '_blank')}
            >
              <span className="text-sm">Book Now</span>
            </ButtonComponent>
          )}
        </div>
      ))}
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-4">
      {weather?.currentWeather && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Current Weather</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-xl font-semibold">{weather.currentWeather.temperature}°C</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Condition</p>
              <p className="text-xl font-semibold">{weather.currentWeather.condition}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-xl font-semibold">{weather.currentWeather.humidity}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Wind</p>
              <p className="text-xl font-semibold">{weather.currentWeather.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      )}

      {weather?.forecast && weather.forecast.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weather.forecast.map((day: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">{day.condition}</p>
                <p className="text-sm">{day.temperature.min}°C - {day.temperature.max}°C</p>
                {day.precipitation > 0 && (
                  <p className="text-sm text-blue-600">💧 {day.precipitation}%</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {weather?.alternatives && weather.alternatives.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Weather Alternatives</h3>
          <div className="space-y-2">
            {weather.alternatives.map((alt: any, index: number) => (
              <div key={index} className="text-sm">
                <p className="font-medium text-yellow-800">{alt.activity}</p>
                <p className="text-yellow-700">{alt.reason}</p>
                {alt.indoorAlternative && (
                  <p className="text-yellow-600">💡 {alt.indoorAlternative}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTransport = () => (
    <div className="space-y-4">
      {transport?.localTransport && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Local Transport Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transport.localTransport.map((option: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    <p className="text-sm text-gray-600">Duration: {option.duration}</p>
                    <p className="text-sm text-gray-600">Available: {option.availability}</p>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{option.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {transport?.routes && transport.routes.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Recommended Routes</h3>
          <div className="space-y-3">
            {transport.routes.map((route: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <p className="font-medium">{route.from} → {route.to}</p>
                <p className="text-sm text-gray-600">Total: {route.totalCost} • {route.totalDuration}</p>
                <div className="mt-2 space-y-1">
                  {route.options.map((option: any, optIndex: number) => (
                    <p key={optIndex} className="text-sm text-gray-500">
                      • {option.name} ({option.cost}, {option.duration})
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-4">
      {reminders?.reminders && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Travel Reminders</h3>
          <div className="space-y-3">
            {reminders.reminders.map((reminder: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => {}}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-sm text-gray-600">{reminder.description}</p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(reminder.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {reminder.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders?.notifications && reminders.notifications.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Notifications</h3>
          <div className="space-y-2">
            {reminders.notifications.map((notification: any, index: number) => (
              <div key={index} className={`p-3 rounded ${
                notification.type === 'urgent' ? 'bg-red-50 border border-red-200' :
                notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm">{notification.message}</p>
                {notification.actionRequired && (
                  <p className="text-xs text-red-600 mt-1">Action required</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'itinerary': return renderItinerary();
      case 'deals': return renderDeals();
      case 'weather': return renderWeather();
      case 'transport': return renderTransport();
      case 'reminders': return renderReminders();
      default: return renderOverview();
    }
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Trip Planning Results</h2>
        <ButtonComponent
          type="button"
          className="button-class !h-8 !w-8 !p-0"
          onClick={onClose}
        >
          <span className="text-white">×</span>
        </ButtonComponent>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AgentDashboard;
