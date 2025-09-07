import React, { useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { cn } from '~/lib/utils';
import type { TripData, AgentResponse } from '~/lib/agents/types';

interface RealMultiAgentInterfaceProps {
  onTripGenerated?: (tripData: any) => void;
  className?: string;
}

interface TravelPreferences {
  country: string;
  duration: number;
  travelStyle: string;
  interests: string;
  budget: string;
  groupType: string;
  startDate?: string;
  travelFrom?: string; // origin city/airport
  notes?: string; // additional preferences
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  progress: number;
  message?: string;
  result?: any;
}

const RealMultiAgentInterface: React.FC<RealMultiAgentInterfaceProps> = ({ onTripGenerated, className }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { id: 'planner', name: 'Planner', status: 'idle', progress: 0 },
    { id: 'weather', name: 'Weather', status: 'idle', progress: 0 },
    { id: 'dealFinder', name: 'Deal Finder', status: 'idle', progress: 0 },
    { id: 'transport', name: 'Transport', status: 'idle', progress: 0 },
    { id: 'messenger', name: 'Messenger', status: 'idle', progress: 0 },
  ]);
  const [result, setResult] = useState<any>(null);
  const [preferences, setPreferences] = useState<TravelPreferences>({
    country: '',
    duration: 7,
    travelStyle: '',
    interests: '',
    budget: '',
    groupType: '',
    startDate: '',
    travelFrom: '',
    notes: '',
  });

  const handleStartPlanning = async () => {
    setIsProcessing(true);
    setResult(null);
    setShowForm(false);

    // Reset agent statuses
    setAgentStatuses(prev => prev.map(agent => ({
      ...agent,
      status: 'idle' as const,
      progress: 0,
      message: undefined,
      result: undefined,
    })));

    // Include origin and additional preferences; allow extra fields beyond TripData
    const tripData: any = {
      country: preferences.country,
      duration: preferences.duration,
      travelStyle: preferences.travelStyle,
      interests: preferences.interests,
      budget: preferences.budget,
      groupType: preferences.groupType,
      startDate: preferences.startDate,
      travelFrom: preferences.travelFrom,
      notes: preferences.notes,
    };

    try {
      // Execute all agents in parallel
      const agentPromises = [
        executeAgent('planner', '/api/planner-agent-real', tripData),
        executeAgent('weather', '/api/weather-agent-real', tripData),
        executeAgent('dealFinder', '/api/deal-finder-agent-real', tripData),
        executeAgent('transport', '/api/transport-agent-real', tripData),
        executeAgent('messenger', '/api/messenger-agent-real', tripData),
      ];

      const results = await Promise.allSettled(agentPromises);
      
      // Process results - some may have failed
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failedResults = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      // Log any failures for debugging
      if (failedResults.length > 0) {
        console.warn('Some agents failed:', failedResults);
      }

      // Compile final result with available data
      const finalResult = {
        tripPlan: successfulResults[0]?.data || null,
        weather: successfulResults[1]?.data || null,
        deals: successfulResults[2]?.data || null,
        transport: successfulResults[3]?.data || null,
        reminders: successfulResults[4]?.data || null,
        suggestions: [
          'Book accommodations early for better rates',
          'Research local customs and cultural etiquette',
          'Download offline maps and translation apps'
        ],
        nextSteps: [
          'Review and customize the itinerary',
          'Check weather conditions for your travel dates',
          'Research and book flights and accommodations',
          'Set up travel insurance and necessary documents'
        ],
        agentStatus: {
          successful: successfulResults.length,
          failed: failedResults.length,
          total: results.length
        }
      };

      setResult(finalResult);

      if (onTripGenerated) {
        // Wrap the result in the expected structure for AgentDashboard
        const wrappedResult = {
          success: true,
          data: finalResult
        };
        console.log('Passing result to AgentDashboard:', wrappedResult);
        onTripGenerated(wrappedResult);
      }

      // Log results for debugging
      if (failedResults.length > 0) {
        console.log('Some agents failed:', failedResults.length);
      } else {
        console.log('All agents succeeded');
      }

    } catch (err) {
      console.error('Multi-agent planning failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAgent = async (agentId: string, endpoint: string, tripData: TripData) => {
    try {
      // Update agent status to working
      setAgentStatuses(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'working', message: 'Processing...' }
          : agent
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setAgentStatuses(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, progress }
            : agent
        ));
      }

      // Make API call
      console.log(`[${agentId}] Calling ${endpoint} with:`, tripData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tripData }),
      });

      console.log(`[${agentId}] Response status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${agentId}] HTTP error:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`[${agentId}] API result:`, result);

      // Check if the API returned an error
      if (!result.success) {
        console.error(`[${agentId}] API returned error:`, result.error);
        throw new Error(result.error || `Agent ${agentId} failed`);
      }

      // Update agent status to completed
      setAgentStatuses(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'completed', progress: 100, message: 'Completed', result: result.data }
          : agent
      ));

      return result;

    } catch (error) {
      console.error(`[${agentId}] Agent error:`, error);
      
      // Update agent status to error
      setAgentStatuses(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'error', message: 'Failed' }
          : agent
      ));
      throw error;
    }
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-200';
      case 'working': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'idle': return '⏸️';
      case 'working': return '⚙️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏸️';
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            AI Multi-Agent Travel Assistant
          </h2>
          <p className="text-gray-600">
            Our specialized AI agents work together to create your perfect trip plan
          </p>
        </div>

        {/* Travel Preferences Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tell us about your dream trip</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={preferences.country}
                  onChange={(e) => setPreferences(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Japan, France, Thailand"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="30"
                  value={preferences.duration}
                  onChange={(e) => setPreferences(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="travelStyle" className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Style
                </label>
                <select
                  id="travelStyle"
                  value={preferences.travelStyle}
                  onChange={(e) => setPreferences(prev => ({ ...prev, travelStyle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select travel style</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Business">Business</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Budget">Budget</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  id="budget"
                  value={preferences.budget}
                  onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="Budget">Budget</option>
                  <option value="Mid-range">Mid-range</option>
                  <option value="High-end">High-end</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label htmlFor="groupType" className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Group
                </label>
                <select
                  id="groupType"
                  value={preferences.groupType}
                  onChange={(e) => setPreferences(prev => ({ ...prev, groupType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select group type</option>
                  <option value="Solo">Solo</option>
                  <option value="Couple">Couple</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <input
                  id="interests"
                  type="text"
                  value={preferences.interests}
                  onChange={(e) => setPreferences(prev => ({ ...prev, interests: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Culture, Food, Nature, History"
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={preferences.startDate}
                  onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="travelFrom" className="block text-sm font-medium text-gray-700 mb-2">
                  Travel From (Origin City/Airport)
                </label>
                <input
                  id="travelFrom"
                  type="text"
                  value={preferences.travelFrom}
                  onChange={(e) => setPreferences(prev => ({ ...prev, travelFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Delhi, Mumbai, BLR, HYD"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Preferences (Optional)
                </label>
                <textarea
                  id="notes"
                  value={preferences.notes}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Anything else we should consider (diet, pace, must-see, etc.)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Agent Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {agentStatuses.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-300',
                agent.status === 'working' ? 'border-blue-300 bg-blue-50' :
                agent.status === 'completed' ? 'border-green-300 bg-green-50' :
                agent.status === 'error' ? 'border-red-300 bg-red-50' :
                'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{getStatusIcon(agent.status)}</span>
                <span className="text-sm font-medium text-gray-700">
                  {agent.name}
                </span>
              </div>
              
              {agent.status === 'working' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              )}
              
              <p className="text-xs text-gray-600">
                {agent.message || 'Ready'}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-6">
          {!showForm && !isProcessing && !result && (
            <ButtonComponent
              type="button"
              className="button-class !h-12 !w-full md:!w-[300px] !bg-gray-600 hover:!bg-gray-700 mr-4"
              onClick={() => setShowForm(true)}
            >
              <span className="p-16-semibold text-white">Back to Form</span>
            </ButtonComponent>
          )}
          
          <ButtonComponent
            type="button"
            className={cn(
              'button-class !h-12 !w-full md:!w-[300px]',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isProcessing}
            onClick={handleStartPlanning}
          >
            <img 
              src={`/assets/icons/${isProcessing ? 'loader.svg' : 'magic-star.svg'}`} 
              className={cn("size-5 mr-2", { 'animate-spin': isProcessing })} 
            />
            <span className="p-16-semibold text-white">
              {isProcessing ? 'AI Agents Working...' : 'Start Multi-Agent Planning'}
            </span>
          </ButtonComponent>
        </div>


        {/* Start Over Button (Only) */}
        {!showForm && !isProcessing && (
          <div className="text-center mt-2">
            <ButtonComponent
              type="button"
              className="button-class !h-12 !w-full md:!w-[300px] !bg-green-600 hover:!bg-green-700"
              onClick={() => {
                setResult(null);
                setShowForm(true);
                setAgentStatuses(prev => prev.map(agent => ({
                  ...agent,
                  status: 'idle' as const,
                  progress: 0,
                  message: undefined,
                  result: undefined,
                })));
              }}
            >
              <span className="p-16-semibold text-white">Plan Another Trip</span>
            </ButtonComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealMultiAgentInterface;
