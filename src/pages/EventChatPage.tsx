// src/pages/EventDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, MessageSquare } from 'lucide-react';
import { supabase, Event as EventType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EventChatPage from './EventChatPage';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError('No event id provided.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Failed loading event:', error);
          if (mounted) setError('Failed to load event.');
        } else {
          if (mounted) setEvent(data);
        }
      } catch (e) {
        console.error('Exception loading event:', e);
        if (mounted) setError('Failed to load event (exception).');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading event…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-xl text-center">
          <p className="text-rose-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-gray-600">Event not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div
        className="h-56 md:h-80 relative bg-center bg-cover"
        style={{
          backgroundImage: `url(${event.cover_url || '/default-event-hero.jpg'})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="p-6 md:p-12 text-white">
            <h1 className="text-2xl md:text-4xl font-bold drop-shadow">{event.title}</h1>
            <p className="text-sm md:text-base opacity-90 mt-1">{event.artist_name}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-gray-700 font-semibold text-lg">{event.title}</div>
                <div className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded">{event.category || 'Event'}</div>
              </div>
              <div className="text-sm text-gray-500 mt-1">{event.venue || ''}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} /> <span>{event.date ? new Date(event.date).toLocaleString() : 'TBA'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} /> <span>{event.location || 'Online'}</span>
              </div>

              <button
                onClick={() => setOpenChat(true)}
                className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#FF785A] text-white hover:opacity-95"
              >
                <MessageSquare size={16} />
                Chat
              </button>
            </div>
          </div>

          {/* About */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-gray-600 mt-2">{event.description || 'No description available.'}</p>
          </div>

          {/* Top offers / actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium">Top offers</h4>
              <div className="text-sm text-gray-500 mt-2">YES Private Debit Card Offer — Tap to view details</div>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium">Details</h4>
              <div className="text-sm text-gray-500 mt-2">
                Doors open {event.time || 'TBA'} — carry valid ID if required.
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Users size={16} />
              <span>{event.attendees_count ?? '—'} attendees</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!user) return navigate('/login');
                  // navigate to purchase or open purchase modal
                  navigate(`/events/${event.id}/checkout`);
                }}
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Buy Tickets
              </button>
              <button
                onClick={() => setOpenChat(true)}
                className="px-4 py-2 border border-gray-200 rounded-md"
              >
                Open Group Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat modal (overlay) */}
      {openChat && (
        <EventChatPage
          eventId={event.id}
          onBack={() => setOpenChat(false)}
        />
      )}
    </div>
  );
}
