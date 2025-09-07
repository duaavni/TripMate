import {Link, type LoaderFunctionArgs, useSearchParams} from "react-router";
import {ButtonComponent} from "@syncfusion/ej2-react-buttons";
import {cn, parseTripData} from "~/lib/utils";
import {Header, TripCard} from "../../../components";
import RealMultiAgentInterface from "../../../components/RealMultiAgentInterface";
import AgentDashboard from "../../../components/AgentDashboard";
import {getAllTrips} from "~/appwrite/trips";
import type {Route} from "../../../.react-router/types/app/routes/admin/+types/trips";
import {useState} from "react";
import {getUser} from "~/appwrite/auth";
import {PagerComponent} from "@syncfusion/ej2-react-grids";
import type { AgentResponse } from "~/lib/agents/types";

// Removed FeaturedDestination component and its usages

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const limit = 8;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || "1", 10);
    const offset = (page - 1) * limit;

    const [user, { allTrips, total } ] = await Promise.all([
        getUser(),
        getAllTrips(limit, offset),
    ])

    return {
        trips: allTrips.map(({ $id, tripDetails, imageUrls }) => ({
            id: $id,
            ...parseTripData(tripDetails),
            imageUrls: imageUrls ?? []
        })),
        total
    }
}

const TravelPage = ({ loaderData }: Route.ComponentProps) => {
    const trips = loaderData.trips as Trip[] | [];

    const [searchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page') || '1')

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [showAgentInterface, setShowAgentInterface] = useState(false);
    const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);
    const [showAgentDashboard, setShowAgentDashboard] = useState(false);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.location.search = `?page=${page}`
    }

    const handleTripGenerated = (tripData: any) => {
        setAgentResult(tripData);
        setShowAgentDashboard(true);
    }

    const handleCloseAgentDashboard = () => {
        setShowAgentDashboard(false);
        setAgentResult(null);
    }

    return (
        <main className="flex flex-col">
            <section className="travel-hero">
                <div>
                    <section className="wrapper">
                        <article>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-primary-700 mb-4">
                                Create Your Perfect Getaway
                            </h1>

                            <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                                Tailor every detail of your journey—choose destinations, activities, and accommodations effortlessly, and start your adventure with confidence and ease.
                            </p>
                        </article>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <ButtonComponent 
                                type="button" 
                                className="button-class !h-11 !w-full md:!w-[240px]"
                                onClick={() => setShowAgentInterface(true)}
                            >
                                <img src="/assets/icons/magic-star.svg" className="size-5 mr-2" />
                                <span className="p-16-semibold text-white">
                                    AI Trip Planning
                                </span>
                            </ButtonComponent>
                            
                            <Link to="#trips">
                                <ButtonComponent type="button" className="button-class !h-11 !w-full md:!w-[240px] !bg-gray-600 hover:!bg-gray-700">
                                    <span className="p-16-semibold text-white">
                                        Browse Trips
                                    </span>
                                </ButtonComponent>
                            </Link>
                        </div>
                    </section>
                </div>
            </section>

            {/* Featured destinations section removed */}

            <section id="trips" className="py-20 wrapper flex flex-col gap-10">
                <Header title="Handpicked Trips" description="Browse well-planned trips designes for your travel style" />

                <div className="trip-grid">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            id={trip.id}
                            name={trip.name}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ""}
                            tags={[trip.interests, trip.travelStyle]}
                            price={trip.estimatedPrice}
                        />
                    ))}
                </div>

                <PagerComponent
                    totalRecordsCount={loaderData.total}
                    pageSize={8}
                    currentPage={currentPage}
                    click={(args) => handlePageChange(args.currentPage)}
                    cssClass="!mb-4"
                />
            </section>

            <footer className="h-28 bg-white">
                <div className="wrapper footer-container">
                    <Link to="/">
                        <img
                            src="/assets/icons/logo.png"
                            alt="logo"
                            className="size-[40px]"
                        />
                        <h1>TripMate</h1>
                    </Link>

                    <div>
                        {['Terms & Conditions', "Privacy Policy"].map((item) => (
                            <Link to="/" key={item}>{item}</Link>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Agent Interface Modal */}
            {showAgentInterface && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-bold">AI Travel Assistant</h2>
                            <ButtonComponent
                                type="button"
                                className="button-class !h-8 !w-8 !p-0"
                                onClick={() => setShowAgentInterface(false)}
                            >
                                <span className="text-white">×</span>
                            </ButtonComponent>
                        </div>
                        <RealMultiAgentInterface 
                            onTripGenerated={handleTripGenerated}
                            className="p-0"
                        />
                    </div>
                </div>
            )}

            {/* Agent Dashboard Modal */}
            {showAgentDashboard && agentResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <AgentDashboard 
                            result={agentResult}
                            onClose={handleCloseAgentDashboard}
                        />
                    </div>
                </div>
            )}
        </main>
    )
}
export default TravelPage
