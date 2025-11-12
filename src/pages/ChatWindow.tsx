// // src/pages/ChatWindow.tsx
// import React, { useEffect, useMemo, useRef, useState } from 'react';

// type User = {
//   id: string;
//   name?: string | null;
//   email?: string | null;
//   avatarUrl?: string | null;
// } | null;

// type ChatMessage = {
//   id: string;
//   sender: 'me' | 'them' | 'system';
//   text: string;
//   ts: number;
// };

// type Conversation = {
//   id: string;
//   title: string;
//   last: string;
//   unread?: number;
//   // **NEW PROPERTIES FOR FILTERING**
//   isGroup: boolean;
//   isFriendChat: boolean;
// };

// type ChatWindowProps = {
//   onBack: () => void;
//   user: User;
// };

// // **NEW TYPE FOR FILTERING**
// type ConversationFilter = 'All' | 'Groups' | 'Unread' | 'Friends';

// export default function ChatWindow({ onBack, user }: ChatWindowProps) {
//   // ---- Mock data (updated with new properties) ----
//   const [conversations] = useState<Conversation[]>([
//     { id: 'conv-1', title: 'General Event Chat', last: 'See you there!', unread: 3, isGroup: true, isFriendChat: false },
//     { id: 'conv-2', title: 'Organizers', last: 'Tickets sent', unread: 0, isGroup: false, isFriendChat: false },
//     { id: 'conv-3', title: 'Friends: Adi, Ravi', last: 'Let’s meet at 6', unread: 1, isGroup: true, isFriendChat: true },
//     { id: 'conv-4', title: 'One-on-One: Sarah', last: 'See you tomorrow', unread: 0, isGroup: false, isFriendChat: true },
//     { id: 'conv-5', title: 'Announcement', last: 'Read this!', unread: 5, isGroup: false, isFriendChat: false },
//   ]);

//   const [activeConv, setActiveConv] = useState<string>('conv-1');

//   const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
//     'conv-1': [
//       { id: 'm1', sender: 'them', text: 'Welcome to the event chat!', ts: Date.now() - 1000 * 60 * 60 },
//       { id: 'm2', sender: 'me', text: 'Thanks — excited to be here', ts: Date.now() - 1000 * 60 * 50 },
//       { id: 'm3', sender: 'them', text: 'Doors open at 6pm', ts: Date.now() - 1000 * 60 * 45 },
//     ],
//     'conv-2': [
//       { id: 'o1', sender: 'system', text: 'Organizer pinned a message', ts: Date.now() - 1000 * 60 * 60 * 24 },
//     ],
//     'conv-3': [
//       { id: 'f1', sender: 'them', text: 'Where should we meet?', ts: Date.now() - 1000 * 60 * 30 },
//     ],
//     'conv-4': [
//         { id: 's1', sender: 'them', text: 'Can you bring the slides?', ts: Date.now() - 1000 * 60 * 10 },
//     ],
//     'conv-5': [
//         { id: 'a1', sender: 'them', text: 'Important update on venue!', ts: Date.now() - 1000 * 60 * 20 },
//     ],
//   });

//   // ---- UI state ----
//   const [query, setQuery] = useState('');
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLTextAreaElement | null>(null);

//   // **NEW STATE FOR FILTERING**
//   const [filterType, setFilterType] = useState<ConversationFilter>('All');
//   const filters: ConversationFilter[] = ['All', 'Unread', 'Groups', 'Friends'];

//   // auto-scroll to bottom
//   useEffect(() => {
//     const el = listRef.current;
//     if (el) el.scrollTop = el.scrollHeight;
//   }, [activeConv, messages]);

//   // auto-grow textarea
//   useEffect(() => {
//     const el = inputRef.current;
//     if (!el) return;
//     el.style.height = '0px';
//     const h = Math.min(el.scrollHeight, 140);
//     el.style.height = h + 'px';
//   }, [input]);

//   // **UPDATED MEMOIZED FILTERING LOGIC**
//   const filteredConversations = useMemo(() => {
//     let result = conversations;

//     // Apply main filter
//     if (filterType === 'Unread') {
//       result = result.filter((c) => (c.unread ?? 0) > 0);
//     } else if (filterType === 'Groups') {
//       result = result.filter((c) => c.isGroup);
//     } else if (filterType === 'Friends') {
//       result = result.filter((c) => c.isFriendChat);
//     }

//     // Apply search query filter
//     if (query.trim()) {
//       result = result.filter((c) =>
//         c.title.toLowerCase().includes(query.toLowerCase())
//       );
//     }

//     return result;
//   }, [conversations, query, filterType]);

//   const sendMessage = () => {
//     const text = input.trim();
//     if (!text) return;
//     const newMsg: ChatMessage = {
//       id: `m-${Date.now()}`,
//       sender: 'me',
//       text,
//       ts: Date.now(),
//     };
//     setMessages((prev) => {
//       const convMsgs = prev[activeConv] ? [...prev[activeConv], newMsg] : [newMsg];
//       return { ...prev, [activeConv]: convMsgs };
//     });
//     setInput('');
//     // playful simulated reply
//     setIsTyping(true);
//     setTimeout(() => {
//       const reply: ChatMessage = {
//         id: `r-${Date.now()}`,
//         sender: 'them',
//         text: '👍 got it',
//         ts: Date.now(),
//       };
//       setMessages((prev) => {
//         const convMsgs = prev[activeConv] ? [...prev[activeConv], reply] : [reply];
//         return { ...prev, [activeConv]: convMsgs };
//       });
//       setIsTyping(false);
//     }, 700);
//   };

//   const formatTime = (ts: number) => {
//     const d = new Date(ts);
//     const hh = String(d.getHours()).padStart(2, '0');
//     const mm = String(d.getMinutes()).padStart(2, '0');
//     return `${hh}:${mm}`;
//   };

//   const activeTitle = conversations.find((c) => c.id === activeConv)?.title ?? 'Chat';

//   // ---- Full-screen overlay container ----
//   return (
//     <div className="fixed inset-0 z-50">
//       {/* Subtle gradient background */}
//       <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      

//       {/* Frame */}
//       <div className="relative h-full w-full flex flex-col">
//         {/* Top bar */}
//         <header className="flex items-center gap-3 px-4 sm:px-6 h-14 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
//           <button
//             onClick={onBack}
//             className="inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200"
//           >
//             ← Back
//           </button>
//           <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Messages</h2>
//           <div className="ml-auto text-xs sm:text-sm text-gray-600">
//             {user?.name || user?.email ? `Signed in as ${user?.name ?? user?.email}` : 'Guest'}
//           </div>
//         </header>

//         {/* Content area */}
//         <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-4">
//           {/* Sidebar */}
//           <aside className="md:col-span-1 border-r bg-white/70 backdrop-blur">
//             <div className="p-3 border-b">
//               <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Conversations</div>
//               <div className="relative mb-3">
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search..."
//                   className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring"
//                 />
//                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
//               </div>
              
//               {/* **NEW FILTER TABS** */}
//               <div className="flex gap-2 overflow-x-auto pb-1">
//                 {filters.map((filter) => (
//                   <button
//                     key={filter}
//                     onClick={() => setFilterType(filter)}
//                     className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition ${
//                       filterType === filter
//                         ? 'bg-[#FF785A] text-white font-medium'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     {filter}
//                     {filter === 'Unread' && (
//                         <span className="ml-1 text-[10px] inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#FF785A] font-bold">
//                             {conversations.filter(c => (c.unread ?? 0) > 0).length}
//                         </span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 56px - 64px - 64px)' }}> {/* Adjusted height for new filter bar */}
//               {filteredConversations.map((c) => {
//                 const isActive = c.id === activeConv;
//                 return (
//                   <button
//                     key={c.id}
//                     onClick={() => setActiveConv(c.id)}
//                     className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b hover:bg-gray-50 transition ${
//                       isActive ? 'bg-gray-100' : ''
//                     }`}
//                   >
//                     <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm">
//                       {c.isGroup ? '👥' : (c.isFriendChat ? '⭐' : c.title.slice(0, 2).toUpperCase())}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <div className="font-medium truncate">{c.title}</div>
//                         {c.unread ? (
//                           <span className="ml-auto inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF785A]/10 text-[#FF785A] border border-[#FF785A]/20">
//                             {c.unread}
//                           </span>
//                         ) : null}
//                       </div>
//                       <div className="text-xs text-gray-500 truncate">{c.last}</div>
//                     </div>
//                   </button>
//                 );
//               })}
//               {filteredConversations.length === 0 && (
//                 <div className="p-6 text-center text-gray-400">
//                     {query ? 'No results for your search.' : `No ${filterType.toLowerCase()} conversations.`}
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Chat panel */}
//           <main className="md:col-span-3 flex flex-col bg-white">
//             {/* Chat header */}
//             <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 border-b bg-white/90 backdrop-blur">
//               <div className="flex items-center gap-3">
//                 <div className="h-9 w-9 rounded-full bg-[#FF785A]/10 flex items-center justify-center font-semibold text-[#FF785A]">
//                   {activeTitle.slice(0, 1).toUpperCase()}
//                 </div>
//                 <div>
//                   <div className="font-semibold">{activeTitle}</div>
//                   <div className="text-xs text-gray-500">Active • last seen just now</div>
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div ref={listRef} className="flex-1 px-3 sm:px-6 py-4 overflow-auto space-y-3">
//               {(messages[activeConv] ?? []).map((m) => (
//                 <MessageBubble key={m.id} m={m} formatTime={formatTime} />
//               ))}

//               {((messages[activeConv] ?? []).length === 0) && (
//                 <div className="text-center text-gray-400 mt-10">No messages yet — say hi 👋</div>
//               )}

//               {isTyping && (
//                 <div className="max-w-xs">
//                   <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100 text-gray-700">
//                     <TypingDots />
//                     <span className="text-xs">typing…</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Composer */}
//             <div className="px-3 sm:px-6 py-3 border-t bg-white">
//               <div className="flex items-end gap-2">
//                 <button
//                   className="shrink-0 h-10 w-10 rounded-full border hover:bg-gray-50"
//                   title="Attach"
//                 >
//                   📎
//                 </button>
//                 <button
//                   className="shrink-0 h-10 w-10 rounded-full border hover:bg-gray-50"
//                   title="Emoji"
//                 >
//                   🙂 
//                 </button>

//                 <div className="flex-1">
//                   <textarea
//                     ref={inputRef}
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter' && !e.shiftKey) {
//                         e.preventDefault();
//                         sendMessage();
//                       }
//                     }}
//                     placeholder="Write a message…"
//                     className="w-full resize-none max-h-[140px] min-h-[40px] px-4 py-2 rounded-2xl border focus:outline-none focus:ring"
//                   />
//                 </div>

//                 <button
//                   onClick={sendMessage}
//                   disabled={!input.trim()}
//                   className={`shrink-0 h-10 px-5 rounded-2xl font-medium text-white transition ${
//                     input.trim()
//                       ? 'bg-[#FF785A] hover:opacity-90'
//                       : 'bg-gray-300 cursor-not-allowed'
//                   }`}
//                 >
//                   Send
//                 </button>
//               </div>
//               <div className="text-[11px] text-gray-400 mt-1">Press Enter to send • Shift+Enter for a new line</div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------- Presentational bits ---------- */

// function MessageBubble({
//   m,
//   formatTime,
// }: {
//   m: ChatMessage;
//   formatTime: (ts: number) => string;
// }) {
//   const isMe = m.sender === 'me';
//   const isSystem = m.sender === 'system';

//   if (isSystem) {
//     return (
//       <div className="flex justify-center">
//         <div className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 italic">
//           {m.text} • {formatTime(m.ts)}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
//       {!isMe && (
//         <div className="mr-2 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs select-none">
//           👤
//         </div>
//       )}
//       <div className="max-w-[78%] sm:max-w-[70%]">
//         <div
//           className={`inline-block px-4 py-2 rounded-2xl shadow-sm ${
//             isMe
//               ? 'bg-[#FF785A] text-white rounded-br-sm'
//               : 'bg-gray-100 text-gray-900 rounded-bl-sm'
//           }`}
//         >
//           {m.text}
//         </div>
//         <div
//           className={`mt-1 text-[10px] ${
//             isMe ? 'text-right text-white/80' : 'text-gray-500'
//           }`}
//         >
//           {formatTime(m.ts)}
//         </div>
//       </div>
//       {isMe && (
//         <div className="ml-2 h-8 w-8 rounded-full bg-[#FF785A]/10 text-[#FF785A] flex items-center justify-center text-xs select-none">
//           😊
//         </div>
//       )}
//     </div>
//   );
// }

// function TypingDots() {
//   return (
//     <span className="inline-flex items-center gap-1">
//       <Dot />
//       <Dot delay={120} />
//       <Dot delay={240} />
//     </span>
//   );
// }

// function Dot({ delay = 0 }: { delay?: number }) {
//   return (
//     <span
//       className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500/70 animate-bounce"
//       style={{ animationDelay: `${delay}ms` }}
//     />
//   );
// }

// src/pages/ComingSoonPage.tsx
import React from 'react';
import { motion } from 'framer-motion';

// Use the accent color provided previously
const ACCENT_COLOR = '#FF785A'; 

export default function ComingSoonPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: {
        staggerChildren: 0.3, // Delay children animations
        when: "beforeChildren", // Parent animation finishes before children start
        ease: "easeOut",
        duration: 0.8
      }
    },
    animate: {
      // Subtle infinite pulse for the whole container
      scale: [1, 1.005, 1],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        ease: "easeOut",
        duration: 0.6
      }
    }
  };

  const soonVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring", // More natural, bouncy animation
        stiffness: 100,
        damping: 10,
        mass: 0.5,
        duration: 0.8
      }
    }
  };

  return (
    // Outer container: Full screen, white background, centering content
    <div 
      className="flex items-center justify-center min-h-screen" 
      style={{ backgroundColor: '#FFFFFF' }} // Clean White Background
    >
      <motion.div 
        className="text-center p-6"
        variants={containerVariants}
        initial="hidden"
        animate={["visible", "animate"]} // Play both visible and animate states
      >
        
        {/* Main Text Container */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight">
          
          {/* "COMING" in Black with animation */}
          <motion.span 
            className="text-gray-900 block" // Explicitly black/dark gray for contrast
            variants={itemVariants}
          >
            COMING
          </motion.span>
          
          {/* "SOON" in Accent Orange with animation */}
          <motion.span 
            className="block mt-4 sm:mt-6"
            style={{ 
              color: ACCENT_COLOR,
              // Adding a subtle shadow for a glowing effect without being too stark on white
              textShadow: `0 0 8px rgba(255, 120, 90, 0.4), 0 0 20px rgba(255, 120, 90, 0.2)`
            }}
            variants={soonVariants}
          >
            SOON
          </motion.span>
        </h1>
        
        {/* Subtitle/Message */}
        <motion.p 
          className="mt-8 text-lg sm:text-xl md:text-2xl text-gray-500 font-medium"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }} // Delayed fade-in
        >
          We're brewing up something amazing. Stay tuned!
        </motion.p>
        
      </motion.div>
    </div>
  );
}