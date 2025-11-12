// src/App.tsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';

// Import all components / pages
import Navbar from './components/Navbar.tsx';
import Auth from './components/Auth.tsx';
import HomePage from './pages/HomePage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import EventDetailPage, { Event } from './pages/EventDetailPage.tsx';
import EventChatPage from './pages/EventChatPage.tsx';
import MyTicketsPage from './pages/MyTicketsPage.tsx';
import TripsPage from './pages/Trips.tsx';
import Activities from './pages/Activities.tsx';
import ActivityDetailPage from './pages/ActivityDetailPage.tsx';
import { Activity, getActivityDataById } from './data/mockActivity.ts';
import ProfilePage from './pages/ProfilePage.tsx';
import ChatWindow from './pages/ChatWindow.tsx';
import TripDetailsPage from './pages/TripDetails.tsx';
import Footer from './components/Footer.tsx';
import TermsPage from './pages/Terms.tsx';
import Thankyou from './pages/Thankyou.tsx';

// Mock Data Imports
import { ALL_MOCK_EVENTS } from './data/mockEvents.ts';
import { ALL_MOCK_TRIPS, DetailedTrip } from './data/mockTrips.ts';

// Convert the array of events into a map for fast lookup
const EVENT_DETAIL_MAP: { [key: string]: Event } = ALL_MOCK_EVENTS.reduce((acc, event) => {
  acc[event.id] = event as Event;
  return acc;
}, {} as { [key: string]: Event });

function getEventDataById(id: string | null): Event | null {
  if (!id) return null;
  return EVENT_DETAIL_MAP[id] || null;
}

// Convert the array of DetailedTrips into a map for fast lookup
const TRIP_DETAIL_MAP: { [key: string]: DetailedTrip } = ALL_MOCK_TRIPS.reduce((acc, trip) => {
  acc[trip.id] = trip as DetailedTrip;
  return acc;
}, {} as { [key: string]: DetailedTrip });

function getTripDataById(id: string | null): DetailedTrip | null {
  if (!id) return null;
  return TRIP_DETAIL_MAP[id] || null;
}

// Mocking the user object structure that would come from AuthContext
interface MockUser {
  uid: string;
  email: string;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const authContext = useAuth();
  const mockUser: MockUser | null = authContext.user
    ? { uid: 'user-123', email: 'user@example.com' }
    : null;

  const user = mockUser;
  const loading = authContext.loading;

  // default page
  const [currentPage, setCurrentPage] = useState<string>('home');

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<DetailedTrip | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);

  // When the app mounts, check the URL path so direct navigations (like /thankyou) work
  useEffect(() => {
    const path = window.location.pathname || '/';
    // normalize trailing slashes
    const cleanPath = path.replace(/\/+$/, '') || '/';

    if (cleanPath === '/thankyou') {
      setCurrentPage('thankyou');
    } else if (cleanPath === '/' || cleanPath === '') {
      setCurrentPage('home');
    } else {
      // if you have other deep routes in future, handle them here
      // fallback to 'home' for unknown paths
      setCurrentPage('home');
    }
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Scroll to top whenever the user navigates (keeps UX consistent)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const selectedEventId = selectedEvent?.id || null;
  const selectedTripId = selectedTrip?.id || null;

  const handleNavigate = (page: string) => {
    // If someone triggers navigate('/thankyou') via code, allow it
    // also clear selected items unless moving to a detail page
    setSelectedEvent(null);
    setSelectedTrip(null);
    setSelectedActivity(null);

    setCurrentPage(page);

    // If we want to support deep-linking without reload, we could pushState:
    // for now keep URL handling minimal. Uncomment to keep URL in sync:
    // window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
  };

  const handleEventSelect = (eventId: string) => {
    const eventData = getEventDataById(eventId);
    if (eventData) {
      setSelectedEvent(eventData);
      setCurrentPage('event-detail');
    } else {
      console.error(`Event with ID ${eventId} not found!`);
      setCurrentPage('events');
    }
  };

  const handleTripSelect = (tripId: string) => {
    const tripData = getTripDataById(tripId);
    if (tripData) {
      setSelectedTrip(tripData);
      setCurrentPage('trip-detail');
    } else {
      console.error(`Trip with ID ${tripId} not found!`);
      setCurrentPage('trips');
    }
  };

  const handleActivitySelect = (activityId: string) => {
    const activityData = getActivityDataById(activityId);
    if (activityData) {
      setSelectedActivity(activityData);
      setCurrentPage('activity-detail');
    } else {
      console.error(`Activity with ID ${activityId} not found!`);
      setCurrentPage('activities');
    }
  };

  const handleChatOpen = (id: string) => {
    const eventData = getEventDataById(id);
    if (eventData) {
      setSelectedEvent(eventData);
      setSelectedTrip(null);
      setSelectedActivity(null);
      setCurrentPage('chat-window');
      return;
    }

    const tripData = getTripDataById(id);
    if (tripData) {
      setSelectedTrip(tripData);
      setSelectedEvent(null);
      setSelectedActivity(null);
      setCurrentPage('chat-window');
      return;
    }

    console.error(`Cannot open chat for missing ID: ${id}`);
  };

  const handleNavbarChatClick = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSelectedEvent(null);
    setSelectedTrip(null);
    setSelectedActivity(null);
    setCurrentPage('chat-window');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onAuthClick={() => setShowAuth(true)}
        onProfileClick={() => setCurrentPage('profile')}
        currentPage={currentPage}
        onNavigate={(p: string) => handleNavigate(p)}
        onChatClick={handleNavbarChatClick}
      />

      {/* Spacer for fixed navbar */}
      <div className="h-24" />

      <main className="flex-grow">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentPage === 'events' && (
          <EventsPage onEventSelect={handleEventSelect} onChatOpen={handleChatOpen} />
        )}

        {currentPage === 'activities' && (
          <Activities onActivitySelect={handleActivitySelect} />
        )}

        {currentPage === 'activity-detail' && selectedActivity && (
          <ActivityDetailPage
            activity={selectedActivity}
            onBack={() => setCurrentPage('activities')}
          />
        )}

        {currentPage === 'trips' && (
          <TripsPage
            onTripSelect={handleTripSelect}
            onChatOpen={handleChatOpen}
            currentUserId={user?.uid || null}
          />
        )}

        {currentPage === 'trip-detail' && selectedTripId && (
          <TripDetailsPage
            tripId={selectedTripId}
            onBack={() => setCurrentPage('trips')}
            onChatOpen={handleChatOpen}
            currentUserId={user?.uid || null}
          />
        )}

        {currentPage === 'profile' && user && <ProfilePage />}

        {currentPage === 'chat-window' && (
          <ChatWindow
            onBack={() => {
              if (selectedEvent) setCurrentPage('event-detail');
              else if (selectedTrip) setCurrentPage('trip-detail');
              else setCurrentPage('home');
            }}
            user={user}
          />
        )}

        {currentPage === 'event-detail' && selectedEvent && (
          <EventDetailPage
            event={selectedEvent}
            onBack={() => setCurrentPage('events')}
            onChatOpen={handleChatOpen}
          />
        )}

        {currentPage === 'event-chat' && selectedEventId && (
          <EventChatPage
            eventId={selectedEventId}
            onBack={() => setCurrentPage('event-detail')}
          />
        )}

        {currentPage === 'my-tickets' && (
          <MyTicketsPage onEventSelect={handleEventSelect} onChatOpen={handleChatOpen} />
        )}

        {currentPage === 'terms' && <TermsPage onBack={() => setCurrentPage('home')} />}

        {currentPage === 'thankyou' && <Thankyou />}

        {showAuth && !user && <Auth onClose={() => setShowAuth(false)} />}
      </main>

      {/* Pass handleNavigate so Footer can trigger navigation (e.g., to 'terms' or 'thankyou') */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
