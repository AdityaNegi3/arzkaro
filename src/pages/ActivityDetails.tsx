import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Heart, ShoppingCart, Calendar, MapPin, MessageCircle } from 'lucide-react';

// --- Type Definitions ---
export type Event = {
  id: string;
  title: string;
  artist_name: string;
  venue: string;
  city: string;
  event_date: string; // ISO string
  ticket_price: number;
  description: string;
  image_url: string;
  includes: string[];
  notes: string[];
  contact: string;
  member_count?: number;
};

export type Message = { id: string; author: string; text: string; time: string };

// Accent color (You can change this globally if needed)
const ACCENT = '#FF785A'; // Matches the orange in your screenshot

/**
 * ChatWindow (named export) - This component remains largely the same as it's a modal.
 * Only the accent color injection is ensured.
 */
export function ChatWindow({
  open,
  onClose,
  owned,
  eventName,
  initialMessages = [],
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  owned: boolean;
  eventName: string;
  initialMessages?: Message[];
  onSend?: (text: string) => void;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  useEffect(() => {
    if (!listRef.current) return;
    requestAnimationFrame(() => {
      listRef.current!.scrollTop = listRef.current!.scrollHeight;
    });
  }, [messages, open]);

  const send = () => {
    if (!input.trim() || !owned) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const m: Message = { id: Math.random().toString(36).slice(2), author: 'You', text: input.trim(), time };
    setMessages((s) => [...s, m]);
    onSend?.(input.trim());
    setInput('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="relative w-full max-w-md md:max-w-lg h-[80vh] md:h-[70vh] bg-white rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col"
        role="document"
        aria-label={`${eventName} group chat`}
        style={{ outline: 'none' }}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold"
              style={{ backgroundColor: ACCENT }}
              aria-hidden
            >
              G
            </div>
            <div>
              <div className="font-semibold text-sm truncate max-w-[200px] md:max-w-full">{eventName} Group Chat</div>
              <div className="text-xs text-gray-500">Connect with others coming to the event</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!owned && (
              <span className="px-2 py-1 rounded-md text-xs bg-yellow-50 text-yellow-800" title="Read-only">
                Read-only
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </header>

        <div ref={listRef} className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white to-gray-50 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400">No messages yet — be the first to say hi!</div>
          )}

          {messages.map((m) => {
            const mine = m.author === 'You';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                {!mine && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">
                      {m.author[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[82%] px-3 py-2 rounded-lg shadow-sm
                    ${mine ? 'bg-[var(--accent)] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}
                  role="article"
                  aria-label={`${m.author} message`}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    <span className="font-medium text-[.85rem]">{m.author}</span>
                    <span className="mx-1">•</span>
                    <time className="text-[.8rem]">{m.time}</time>
                  </div>
                  <div className="text-sm leading-tight">{m.text}</div>
                </div>

                {mine && (
                  <div className="flex-shrink-0 ml-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: ACCENT, color: 'white' }}
                      aria-hidden
                    >
                      Y
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={owned ? 'Write a message to the group...' : 'Read-only — buy a ticket to chat'}
              disabled={!owned}
              aria-label="Message input"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
              style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.06)' }}
            />

            <button
              onClick={send}
              disabled={!owned || !input.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-60 focus:outline-none focus:ring-2"
              style={{ backgroundColor: ACCENT }}
              aria-label="Send message"
            >
              Send
            </button>
          </div>

          {!owned && <div className="mt-2 text-xs text-gray-500">Purchase a ticket to participate in the chat.</div>}
        </div>
      </div>

      <style>{`:root{ --accent: ${ACCENT}; }`}</style>
    </div>
  );
}

// --- Component Helper: FAQ Item ---
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  return (
    <details className="border-b border-gray-200 py-3 cursor-pointer group">
      <summary className="flex justify-between items-center text-base font-semibold text-gray-800 list-none">
        {question}
        <svg
          className="w-5 h-5 text-[var(--accent)] transition-transform duration-300 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </summary>
      <div className="pt-3 pb-1 text-sm text-gray-600 leading-relaxed">
        {answer}
      </div>
    </details>
  );
};


/**
 * EventDetailPage - Accepts a dynamic 'event' object.
 * Updated to match the provided screenshot design.
 */
export default function EventDetailPage({ event, onBack, onChatOpen }: { event: Event, onBack?: () => void, onChatOpen: (eventId: string) => void }) {
  const currentEvent = event;

  // Use a state for 'owned' to simulate ticket purchase
  const [owned, setOwned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // For the modal chat window

  // MOCK MESSAGES: Can be dynamic based on event.id
  const initialMessages: Message[] = [
    { id: 'm1', author: 'Organizer', text: `Welcome to the ${currentEvent.title} chat!`, time: '19:05' },
    { id: 'm2', author: 'FanSam', text: 'Is there a cloakroom available?', time: '19:12' },
    { id: 'm3', author: 'EventBot', text: 'Doors open at 7:30 PM. ID required at entry.', time: '19:30' },
  ];

  const buyTicket = async () => {
    setProcessing(true);
    // Simulate API call or processing time
    await new Promise((r) => setTimeout(r, 700));
    setOwned(true);
    setProcessing(false);
    // Directly open the chat modal after purchase as per screenshot interaction
    setChatOpen(true); 
    // If you prefer to open the full-page chat after purchase, uncomment below:
    // onChatOpen(currentEvent.id);
  };

  const formattedDate = new Date(currentEvent.event_date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const price = currentEvent.ticket_price ?? 0;
  const priceFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const bookingCtaText = owned
    ? 'Open Chat & Ticket' // Updated text when owned
    : processing
    ? 'Processing…'
    : `Book Experience ${priceFormatter.format(price)}`;

  // --- Static Content (FAQ & T&C) ---
  const eventFaqs = [
    { question: "Is there an age restriction for the event?", answer: "Yes, entry is strictly for individuals aged 18 and above." },
    { question: "Is there parking available?", answer: "Yes, paid parking facilities will be available at the venue." },
    { question: "Can I get a refund if I can't attend the event?", answer: "No, tickets are non-refundable once purchased." },
    { question: "Is the venue wheelchair accessible?", answer: "Yes, the venue is wheelchair accessible, with access available in the VIP and Dance Floor sections only." },
    { question: "Will food, beverages & alcohol be available at the venue?", answer: "Yes, a variety of food and beverage options, including alcohol, will be available for purchase." },
    { question: "Is re-entry into the venue allowed?", answer: "No, re-entry will not be permitted once you exit the venue." },
    { question: "Is there a designated smoking area?", answer: "Yes, a designated smoking area will be provided for attendees." },
  ];

  const termsAndConditions = [
    "Please carry a valid ID proof along with you.",
    "No refunds on purchased ticket are possible, even in case of any rescheduling.",
    "Security procedures, including frisking remain the right of the management.",
    "No dangerous or potentially hazardous objects including but not limited to weapons, knives, guns, fireworks, helmets, lazer devices, bottles, musical instruments will be allowed in the venue and may be ejected with or without the owner from the venue.",
    "The attendees will be able to reserve their tickets and any applicable add-ons (as communicated on the District Platform) by paying 50% of the total amount at the checkout. The remaining balance of the reservation amount must be paid by 11:59 AM on March 7, 2026 (“Due Date”).",
    "Only attendees booking tickets and applicable add-ons through the District Platform before 11:59 PM on February 21, 2026 are eligible for this feature.",
    "If an attendee fails to pay the remaining amount by the Balance Due Date, the Reservation Amount will be forfeited and will not be refunded. The reservation for the ticket will be cancelled.",
    "In case the event is postponed or cancelled by the organiser prior to the Balance Due Date due to a force majeure event, the attendee shall be eligible for refund of the Reservation Amount. In case the event is postponed or cancelled by the organiser after the Balance Due Date, the attendee shall not be eligible for any refund.",
    "Tickets to the event or a particular category or any add-ons (if applicable) may appear as “Sold Out” on the District platform due to reservations made by other attendees. Such tickets to the event or a particular category or any add-ons (if applicable) may re-open and be listed for sale on the District platform at a price determined by the organiser in case any attendee fails to pay the remaining balance by the respective due date.",
    "Tickets and applicable add-ons will be confirmed only once full payment is successfully received before the Due Date. If an attendee fails to pay the remaining balance by the Due Date, the reservation will be cancelled, and the initial 50% payment will be non-refundable.",
    "In case of cancellation of event by organiser or due to a Force Majeure Event then the attendee shall be eligible for refund in accordance with these terms. In case the event is postponed by the organiser then also the attendee shall be entitled to refund in accordance with these terms.",
    "The sponsors/performers/organizers are not responsible for any injury or damage occurring due to the event. Any claims regarding the same would be settled in courts in Mumbai.",
    "People in an inebriated state may not be allowed entry.",
    "Organizers hold the right to deny late entry to the event.",
    "Venue rules apply.",
  ];
  // ---------------------------------


  // Safety check
  if (!currentEvent || !currentEvent.title || !currentEvent.image_url) {
    // In a real app, this should navigate back or show a 404.
    return <div className="p-10 text-center text-xl text-red-600">Error: Event data is missing or invalid.</div>;
  }

  return (
    <div style={{ ['--accent' as any]: ACCENT } as React.CSSProperties} className="min-h-screen bg-white text-gray-900">

      {/* HERO SECTION */}
      <section className="relative h-[320px] md:h-[480px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentEvent.image_url})`,
            // Adjust filter for a slightly brighter, less blurred look as per screenshot
            filter: 'brightness(0.9) blur(0.5px)', 
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          {/* Custom Back Button and Icons (adjusted for better contrast and positioning) */}
          <div className="absolute top-0 w-full max-w-6xl mx-auto px-4 pt-4 flex items-center justify-between z-10"> {/* Added z-10 */}
            <button
              onClick={() => onBack?.()}
              // Adjusted button styling to match screenshot
              className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Back to events list"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50" aria-label="Wishlist">
                <Heart size={20} fill='white' />
              </button>
              <button className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50" aria-label="Cart">
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
          {/* Main Hero Text - Centered and larger as per screenshot */}
          <div className="max-w-6xl mx-auto px-4 pb-8 w-full">
            <div className="text-white text-center"> {/* Added text-center */}
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                {currentEvent.title}
              </h1>
              <div className="mt-2 text-xl font-medium text-white/90">by {currentEvent.artist_name}</div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-white/80"> {/* Added justify-center */}
                <span className="inline-flex items-center gap-1"><Calendar size={16} /> {formattedDate}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={16} /> {currentEvent.venue}, {currentEvent.city}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">18+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT + SIDEBAR LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT COLUMN: About, Event Guide, Venue, Gallery, FAQ, T&C (Main Content) */}
          <div className="md:col-span-2 space-y-8">
            {/* About Section - Styled to match screenshot card */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-3">About the Event</h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {currentEvent.description}
              </p>
              <div className="mt-6">
                {/* Rating bubble from screenshot */}
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700">
                  Rating: 8/10 <span className="text-xs text-gray-500">(70.5K+ reviews)</span>
                </div>
              </div>
            </section>

            {/* Event Guide Section (Updated from Itinerary) - Example placeholder */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Event Guide</h3>
              <div className="min-h-[150px] rounded-lg border-dashed border-2 border-gray-200 p-6 text-base text-gray-600 flex items-center justify-center">
                Copy as it is from District Platform. (Placeholder for detailed event schedule/rules).
              </div>
            </section>

            {/* Venue Section (With Maps Placeholder) */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Venue: {currentEvent.venue}</h3>
              <p className="text-base text-gray-700 mb-4">{currentEvent.venue}, {currentEvent.city}. Check the map below for directions.</p>
              {/* Maps Integration Placeholder */}
              <div className="h-60 rounded-lg border-dashed border-2 border-gray-200 flex items-center justify-center text-sm text-gray-500 bg-gray-50">
                
                <p>Interactive Map of {currentEvent.venue} Location</p>
              </div>
            </section>

            {/* Gallery Section */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Gallery & Media</h3>
              <div className="h-40 rounded-lg border-dashed border-2 border-gray-200 flex items-center justify-center text-sm text-gray-500">
                



[Image of Event Venue]


                Event Images and Videos
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-2">Frequently Asked Questions (FAQ)</h3>
              <div className="divide-y divide-gray-200">
                {eventFaqs.map((faq, index) => (
                  <FaqItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </section>

            {/* Terms & Conditions Section */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Terms & Conditions</h3>
              <ul className="list-disc list-outside space-y-3 pl-5 text-sm text-gray-700 marker:text-[var(--accent)]">
                {termsAndConditions.map((term, index) => (
                  <li key={index} className='pl-2'>{term}</li>
                ))}
              </ul>
            </section>

          </div>

          {/* RIGHT COLUMN: Booking Card (Sticky) + Details */}
          <div className="md:col-span-1 space-y-8">
            {/* Price/Booking Card (Sticky) - Matches screenshot styling */}
            <aside className="hidden md:block sticky top-6 bg-white rounded-xl p-6 shadow-2xl border border-gray-100">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold">{priceFormatter.format(price)}</span>
                <span className="text-sm text-gray-500">per person</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-b pb-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Duration</span>
                  <span className="text-gray-500 text-sm">3 hr</span> {/* Placeholder, replace with dynamic data if available */}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Travelers</span>
                  <span className="text-gray-500 text-sm">
                    {currentEvent.member_count?.toLocaleString() ?? 'Many'} joined
                  </span>
                </div>
              </div>

              <button
                onClick={() => (owned ? setChatOpen(true) : buyTicket())}
                disabled={processing}
                className={`mt-5 w-full px-4 py-3 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/50`}
                style={{ backgroundColor: ACCENT }}
                aria-label={owned ? 'Open chat' : 'Book experience'}
              >
                {bookingCtaText}
              </button>

              <button
                onClick={() => onChatOpen(currentEvent.id)} // This will open the full page chat
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2"
                aria-label="View group chat"
              >
                <MessageCircle size={18} />
                View Group Chat (Read-only)
              </button>

              <div className="mt-4 text-xs text-center text-gray-500">
                They've already joined: Male • Female
              </div>
            </aside>

            {/* Event Details and Inclusions - Placeholder for additional content below booking card */}
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-3">What's Included</h3>
              <ul className="space-y-2 text-gray-700">
                {currentEvent.includes.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-[var(--accent)] mr-2 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold mt-6 mb-3">Notes & Organizer</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">Important Notes</h4>
                  <ul className="mt-1 text-sm text-gray-600 space-y-1">
                    {currentEvent.notes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Organizer</h4>
                  <div className="mt-1 text-sm text-gray-600">{currentEvent.artist_name} • {currentEvent.venue}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA for Mobile - Matches screenshot style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold">{priceFormatter.format(price)}</div>
            <div className="text-xs text-gray-500">per person</div>
          </div>
          <button
            onClick={() => (owned ? onChatOpen(currentEvent.id) : buyTicket())} // Use full chat page on mobile for consistency
            disabled={processing}
            className={`flex-1 px-4 py-3 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/50`}
            style={{ backgroundColor: ACCENT }}
            aria-label={owned ? 'Open chat' : 'Book experience'}
          >
            {owned ? 'Open Chat' : (processing ? 'Processing…' : 'Book Tickets')}
          </button>
        </div>
      </div>


      {/* Chat window Modal (Fallback/Read-only view) */}
      <ChatWindow
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        owned={owned}
        eventName={currentEvent.title}
        initialMessages={initialMessages}
        onSend={(t) => console.log('sent message', t)}
      />

      {/* Root accent value */}
      <style>{`:root { --accent: ${ACCENT}; }`}</style>
    </div>
  );
}
