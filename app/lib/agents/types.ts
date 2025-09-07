// Agent System Types
export interface AgentMessage {
  id: string;
  agentId: string;
  type: 'request' | 'response' | 'error';
  content: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentContext {
  userId: string;
  sessionId: string;
  tripData?: TripData;
  userPreferences?: UserPreferences;
  conversationHistory: AgentMessage[];
  metadata?: Record<string, any>;
}

export interface TripData {
  country: string;
  duration: number;
  travelStyle: string;
  interests: string;
  budget: string;
  groupType: string;
  startDate?: string;
  endDate?: string;
}

export interface UserPreferences {
  preferredTransport: string[];
  accommodationType: string[];
  activityLevel: 'low' | 'medium' | 'high';
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
}

export interface AgentCapabilities {
  canHandle: string[];
  dependencies: string[];
  priority: number;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  suggestions?: string[];
  nextSteps?: string[];
  messages?: AgentMessage[];
}

// Specific Agent Types
export interface PlannerAgentResponse extends AgentResponse {
  data?: {
    itinerary: DayItinerary[];
    estimatedPrice: string;
    recommendations: string[];
  };
}

export interface DealFinderResponse extends AgentResponse {
  data?: {
    flights: FlightOption[];
    hotels: HotelOption[];
    packages: PackageOption[];
    bestDeals: Deal[];
  };
}

export interface TransportResponse extends AgentResponse {
  data?: {
    localTransport: TransportOption[];
    routes: Route[];
    costs: TransportCost[];
  };
}

export interface WeatherResponse extends AgentResponse {
  data?: {
    currentWeather: WeatherInfo;
    forecast: WeatherForecast[];
    alternatives: WeatherAlternative[];
    recommendations: string[];
  };
}

export interface MessengerResponse extends AgentResponse {
  data?: {
    reminders: Reminder[];
    updates: Update[];
    notifications: Notification[];
  };
}

// Data Models
export interface DayItinerary {
  day: number;
  location: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  description: string;
  duration?: string;
  cost?: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  price: number;
  duration: string;
  stops: number;
  bookingUrl?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
  bookingUrl?: string;
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  price: number;
  includes: string[];
  bookingUrl?: string;
}

export interface Deal {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  bookingUrl?: string;
}

export interface TransportOption {
  type: 'bus' | 'train' | 'taxi' | 'metro' | 'bike' | 'walk';
  name: string;
  description: string;
  cost: number;
  duration: string;
  availability: string;
}

export interface Route {
  from: string;
  to: string;
  options: TransportOption[];
  totalCost: number;
  totalDuration: string;
}

export interface TransportCost {
  type: string;
  cost: number;
  currency: string;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  precipitation: number;
}

export interface WeatherAlternative {
  activity: string;
  reason: string;
  indoorAlternative?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  type: 'booking' | 'preparation' | 'check-in' | 'activity';
  completed: boolean;
}

export interface Update {
  id: string;
  title: string;
  message: string;
  type: 'price_change' | 'availability' | 'weather' | 'general';
  timestamp: Date;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'success' | 'warning';
  timestamp: Date;
  actionRequired: boolean;
}
