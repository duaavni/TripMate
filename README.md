<div align="center">

  
  <h3 align="center">AI Multi‑Agent Travel Assistant</h3>
</div>



## <a name="introduction">🤖 Introduction</a>

This project implements a real AI multi‑agent system for travel planning. Users provide destination, start date, travel‑from origin, travel style, interests, group type, budget, and optional notes. The app orchestrates 5 specialized agents to return a day‑by‑day itinerary, weather, flight/hotel/package deals (₹), local transport, and reminders/next steps.

If you're getting started and need assistance or face any bugs, join our active Discord community with over **50k+** members. It's a place where people help each other out.

## Problem Statement

•	What we're solving: 
Travelers and trip planners juggle bookings, budgets, itineraries, and local research across many websites and tools. This fragmented workflow wastes time and causes suboptimal decisions (missed deals, overbooked days, confusing itineraries).

•	Goal:
Provide a single, collaborative multi-agent system that helps users plan, compare, and manage trips end-to-end: search and compare flight/hotel options, create optimized daily itineraries, track budgets, and surface local recommendations — all through a simple dashboard.


## <a name="tech-stack">⚙️ Tech Stack</a>

- React 19 + TypeScript
- React Router v7 (framework mode, SSR)
- Vite
- Appwrite (Auth/Users/Trips)
- Google Generative AI (Gemini) SDK
- Syncfusion UI (buttons/grids)
- Tailwind‑based styles (in `app/app.css`)

## <a name="features">🔋 Features</a>

### Multi‑Agent Features

👉 Planner Agent (₹): Structured itinerary JSON with realistic INR pricing.

👉 Deal Finder Agent (₹): Flights (origin → destination), hotels, and packages, with booking links.

👉 Transport Agent (₹): Local transport modes, routes (airport → city etc.), costs and durations.

👉 Weather Agent: Current weather, multi‑day forecast, and activity alternatives.

👉 Messenger Agent: Reminders/notifications and suggested next steps.

👉 Parallel orchestration on the client using Promise.allSettled for resilience.

👉 Responsive UI with a modern design

👉 Secure user authentication and data management


and many more, built for scalability and a smooth user experience.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/adrianhajdin/travel-agency-dashboard.git
cd travel-agency-dashboard
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
VITE_SYNCFUSION_LICENSE_KEY=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_API_ENDPOINT=
VITE_APPWRITE_API_KEY=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_USERS_COLLECTION_ID=
VITE_APPWRITE_ITINERARY_COLLECTION_ID=
STRIPE_SECRET_KEY=
GEMINI_API_KEY=
UNSPLASH_ACCESS_KEY="
VITE_BASE_URL="http://localhost:5173"
```

Notes:
- We use Google Gemini for real AI responses in our agent endpoints. 

## 🧠 Agents & API Endpoints

The UI calls these endpoints in parallel and merges results:

- `POST /api/planner-agent-real` → itinerary JSON (₹)
- `POST /api/deal-finder-agent-real` → flights/hotels/packages (₹ + bookingUrl)
- `POST /api/transport-agent-real` → local transport + routes (₹)
- `POST /api/weather-agent-real` → current + forecast + alternatives
- `POST /api/messenger-agent-real` → reminders/notifications

Each endpoint accepts a `tripData` body containing: `country, startDate, duration, travelFrom, travelStyle, interests, budget, groupType, notes`.

## 🧭 How to Use

1) Open the homepage → “AI Trip Planning”.
2) Fill Destination, Start Date, Travel From, Travel Style, Budget, Group Type, Interests, and optional Notes.
3) Start planning → agents run in parallel → results compile into the dashboard modal.

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173/) in your browser to view the project.
