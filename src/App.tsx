import React, { useState, useEffect, useCallback } from 'react';
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

type PageName =
  | 'home'
  | 'events'
  | 'event-detail'
  | 'activities'
  | 'activity-detail'
  | 'trips'
  | 'trip-detail'
  | 'profile'
  | 'chat-window'
  | 'event-chat'
  | 'my-tickets'
  | 'terms'
  | 'thankyou';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function parsePathname(pathname: string) {
  // Normalize pathname (no trailing slash except root)
  const clean = pathname.replace(/\/+$/, '') || '/';
  // Patterns:
  if (clean === '/' || clean === '') return { page: 'home' as PageName };
  if (clean === '/events') return { page: 'events' as PageName };
  if (clean === '/activities') return { page: 'activities' as PageName };
  if (clean === '/trips') return { page: 'trips' as PageName };
  if (clean === '/profile') return { page: 'profile' as PageName };
  if (clean === '/chat' || clean === '/chat-window') return { page: 'chat-window' as PageName };
  if (clean === '/thankyou') return { page: 'thankyou' as PageName };
  if (clean === '/terms') return { page: 'terms' as PageName };
  if (clean === '/my-tickets') return { page: 'my-tickets' as PageName };

  // dynamic routes
  const eventMatch = clean.match(/^\/event\/([^/]+)$/);
  if (eventMatch) return { page: 'event-detail' as PageName, id: eventMatch[1] };

  const tripMatch = clean.match(/^\/trip\/([^/]+)$/);
  if (tripMatch) return { page: 'trip-detail' as PageName, id: tripMatch[1] };

  const activityMatch = clean.match(/^\/activity\/([^/]+)$/);
  if (activityMatch) return { page: 'activity-detail' as PageName, id: activityMatch[1] };

  const eventChatMatch = clean.match(/^\/event-chat\/([^/]+)$/);
  if (eventChatMatch) return { page: 'event-chat' as PageName, id: eventChatMatch[1] };

  // fallback
  return { page: 'home' as PageName };
}

function pathFor(page: PageName, id?: string | null) {
  switch (page) {
    case 'home':
      return '/';
    case 'events':
      return '/events';
    case 'activities':
      return '/activities';
    case 'trips':
      return '/trips';
    case 'profile':
      return '/profile';
    case 'chat-window':
      return '/chat';
    case 'thankyou':
      return '/thankyou';
    case 'terms':
      return '/terms';
    case 'my-tickets':
      return '/my-tickets';
    case 'event-detail':
      return id ? `/event/${id}` : '/events';
    case 'trip-detail':
      return id ? `/trip/${id}` : '/trips';
    case 'activity-detail':
      return id ? `/activity/${id}` : '/activities';
    case 'event-chat':
      return id ? `/event-chat/${id}` : '/events';
    default:
      return '/';
  }
}

function AppContent() {
  const authContext = useAuth();
  const mockUser: MockUser | null = authContext.user
    ? { uid: 'user-123', email: 'user@example.com' }
    : null;

  const user = mockUser;
  const loading = authContext.loading;

  // default page
  const [currentPage, setCurrentPage] = useState<PageName>('home');

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<DetailedTrip | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);

  // Navigation helper that syncs history
  const handleNavigate = useCallback((page: PageName, id?: string | null, replace = false) => {
    // update app state
    setSelectedEvent(null);
    setSelectedTrip(null);
    setSelectedActivity(null);

    // if navigating to a detail page, restore the selected item so back/forward states can check it
    if (page === 'event-detail' && id) {
      const ev = getEventDataById(id);
      setSelectedEvent(ev);
      if (!ev) page = 'events'; // fallback
    } else if (page === 'trip-detail' && id) {
      const tr = getTripDataById(id);
      setSelectedTrip(tr);
      if (!tr) page = 'trips';
    } else if (page === 'activity-detail' && id) {
      const ac = getActivityDataById(id);
      setSelectedActivity(ac);
      if (!ac) page = 'activities';
    }

    setCurrentPage(page);

    // update URL
    const newPath = pathFor(page, id);
    try {
      if (replace) window.history.replaceState({}, '', newPath);
      else window.history.pushState({}, '', newPath);
    } catch (err) {
      // some environments (file://) can throw; ignore
      // console.warn('History API failed', err);
    }
  }, []);

  // When the app mounts, read the URL and set the app state (supports deep linking)
  useEffect(() => {
    const { page, id } = parsePathname(window.location.pathname);
    // hydrate state based on parsed path
    if (page === 'event-detail' && id) {
      const ev = getEventDataById(id);
      if (ev) {
        setSelectedEvent(ev);
        setCurrentPage('event-detail');
      } else {
        setCurrentPage('events');
        // ensure URL matches
        window.history.replaceState({}, '', '/events');
      }
    } else if (page === 'trip-detail' && id) {
      const tr = getTripDataById(id);
      if (tr) {
        setSelectedTrip(tr);
        setCurrentPage('trip-detail');
      } else {
        setCurrentPage('trips');
        window.history.replaceState({}, '', '/trips');
      }
    } else if (page === 'activity-detail' && id) {
      const ac = getActivityDataById(id);
      if (ac) {
        setSelectedActivity(ac);
        setCurrentPage('activity-detail');
      } else {
        setCurrentPage('activities');
        window.history.replaceState({}, '', '/activities');
      }
    } else {
      setCurrentPage(page);
      // normalize URL without creating history entry
      window.history.replaceState({}, '', pathFor(page, (id as string) || null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // popstate handler: when user clicks back/forward in browser
  useEffect(() => {
    const onPopState = () => {
      const { page, id } = parsePathname(window.location.pathname);
      if (page === 'event-detail' && id) {
        const ev = getEventDataById(id);
        if (ev) {
          setSelectedEvent(ev);
          setSelectedTrip(null);
          setSelectedActivity(null);
          setCurrentPage('event-detail');
          return;
        }
        setCurrentPage('events');
        return;
      }

      if (page === 'trip-detail' && id) {
        const tr = getTripDataById(id);
        if (tr) {
          setSelectedTrip(tr);
          setSelectedEvent(null);
          setSelectedActivity(null);
          setCurrentPage('trip-detail');
          return;
        }
        setCurrentPage('trips');
        return;
      }

      if (page === 'activity-detail' && id) {
        const ac = getActivityDataById(id);
        if (ac) {
          setSelectedActivity(ac);
          setSelectedEvent(null);
          setSelectedTrip(null);
          setCurrentPage('activity-detail');
          return;
        }
        setCurrentPage('activities');
        return;
      }

      // simple pages
      setSelectedEvent(null);
      setSelectedTrip(null);
      setSelectedActivity(null);
      setCurrentPage(page);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ✅ Scroll to top whenever the user navigates (keeps UX consistent)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const handleEventSelect = (eventId: string) => {
    const eventData = getEventDataById(eventId);
    if (eventData) {
      // push state with event id
      handleNavigate('event-detail', eventId);
    } else {
      console.error(`Event with ID ${eventId} not found!`);
      handleNavigate('events');
    }
  };

  const handleTripSelect = (tripId: string) => {
    const tripData = getTripDataById(tripId);
    if (tripData) {
      handleNavigate('trip-detail', tripId);
    } else {
      console.error(`Trip with ID ${tripId} not found!`);
      handleNavigate('trips');
    }
  };

  const handleActivitySelect = (activityId: string) => {
    const activityData = getActivityDataById(activityId);
    if (activityData) {
      handleNavigate('activity-detail', activityId);
    } else {
      console.error(`Activity with ID ${activityId} not found!`);
      handleNavigate('activities');
    }
  };

  const handleChatOpen = (id: string) => {
    const eventData = getEventDataById(id);
    if (eventData) {
      setSelectedEvent(eventData);
      setSelectedTrip(null);
      setSelectedActivity(null);
      handleNavigate('chat-window'); // chat window generic; if you want event-specific chat, use event-chat route
      return;
    }

    const tripData = getTripDataById(id);
    if (tripData) {
      setSelectedTrip(tripData);
      setSelectedEvent(null);
      setSelectedActivity(null);
      handleNavigate('chat-window');
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
    handleNavigate('chat-window');
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
        onProfileClick={() => handleNavigate('profile')}
        currentPage={currentPage}
        onNavigate={(p: string) => {
          // keep API compatible for components that pass a string route name
          // Map simple strings to PageName where possible
          const mapping: { [k: string]: PageName } = {
            home: 'home',
            events: 'events',
            activities: 'activities',
            trips: 'trips',
            profile: 'profile',
            chat: 'chat-window',
            'chat-window': 'chat-window',
            'my-tickets': 'my-tickets',
            terms: 'terms',
            thankyou: 'thankyou',
          };
          const page = mapping[p] || 'home';
          handleNavigate(page);
        }}
        onChatClick={handleNavbarChatClick}
      />

      {/* Spacer for fixed navbar */}
      <div className="h-24" />

      <main className="flex-grow">
        {currentPage === 'home' && <HomePage onNavigate={() => handleNavigate('home')} />}

        {currentPage === 'events' && (
          <EventsPage onEventSelect={handleEventSelect} onChatOpen={handleChatOpen} />
        )}

        {currentPage === 'activities' && (
          <Activities onActivitySelect={handleActivitySelect} />
        )}

        {currentPage === 'activity-detail' && selectedActivity && (
          <ActivityDetailPage
            activity={selectedActivity}
            onBack={() => handleNavigate('activities')}
          />
        )}

        {currentPage === 'trips' && (
          <TripsPage
            onTripSelect={handleTripSelect}
            onChatOpen={handleChatOpen}
            currentUserId={user?.uid || null}
          />
        )}

        {currentPage === 'trip-detail' && selectedTrip && (
          <TripDetailsPage
            tripId={selectedTrip.id}
            onBack={() => handleNavigate('trips')}
            onChatOpen={handleChatOpen}
            currentUserId={user?.uid || null}
          />
        )}

        {currentPage === 'profile' && user && <ProfilePage />}

        {currentPage === 'chat-window' && (
          <ChatWindow
            onBack={() => {
              if (selectedEvent) handleNavigate('event-detail', selectedEvent.id);
              else if (selectedTrip) handleNavigate('trip-detail', selectedTrip.id);
              else handleNavigate('home');
            }}
            user={user}
          />
        )}

        {currentPage === 'event-detail' && selectedEvent && (
          <EventDetailPage
            event={selectedEvent}
            onBack={() => handleNavigate('events')}
            onChatOpen={handleChatOpen}
          />
        )}

        {currentPage === 'event-chat' && selectedEvent && (
          <EventChatPage
            eventId={selectedEvent.id}
            onBack={() => handleNavigate('event-detail', selectedEvent.id)}
          />
        )}

        {currentPage === 'my-tickets' && (
          <MyTicketsPage onEventSelect={handleEventSelect} onChatOpen={handleChatOpen} />
        )}

        {currentPage === 'terms' && <TermsPage onBack={() => handleNavigate('home')} />}

        {currentPage === 'thankyou' && <Thankyou />}

        {showAuth && !user && <Auth onClose={() => setShowAuth(false)} />}
      </main>

      {/* Pass handleNavigate so Footer can trigger navigation (e.g., to 'terms' or 'thankyou') */}
      <Footer onNavigate={(p: string) => handleNavigate(p as PageName)} />
    </div>
  );
}
