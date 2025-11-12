// // src/pages/Activities.tsx

// import React from "react";
// // Import Activity data and type
// import { ALL_ACTIVITIES, Activity } from '../data/mockActivity'; 

// // Define Props to accept the navigation handler
// interface ActivitiesProps {
//     onActivitySelect: (activityId: string) => void;
// }

// type Category = {
//   id: string;
//   title: string;
//   subtitle?: string;
//   icon?: React.ReactNode;
// };

// const ACCENT_VAR = "--accent";

// const categories: Category[] = [
//   { id: "game-zones", title: "GAME ZONES" },
//   { id: "theme-parks", title: "THEME PARKS" },
//   { id: "workshops", title: "WORKSHOPS" },
//   { id: "adventure", title: "ADVENTURE" },
//   { id: "kids-play", title: "KIDS PLAY" },
//   { id: "fitness", title: "FITNESS" },
//   { id: "pets", title: "PETS" },
//   { id: "water-parks", title: "WATER PARKS" },
//   { id: "games-quizzes", title: "GAMES & QUIZZES" },
//   { id: "art-craft", title: "ART & CRAFT" },
//   { id: "e-sports", title: "E-SPORTS" },
//   { id: "museums", title: "MUSEUMS" },
// ];

// const activitiesList: Activity[] = ALL_ACTIVITIES;

// export default function Activities({ onActivitySelect }: ActivitiesProps) {
//   return (
//     <div className="min-h-screen bg-white text-gray-900">
//       <div className="max-w-7xl mx-auto px-6 py-10">
//         {/* Header (omitted for brevity) */}
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-2xl font-semibold">Explore activities</h1>
//           <div className="w-96 hidden md:block">
//             <label className="relative block">
//               <input
//                 className="w-full rounded-full border border-gray-200 px-4 py-2 pl-10 text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
//                 placeholder="Search for events, movies and restaurants"
//               />
//               <svg
//                 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   d="M21 21l-4.35-4.35"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <circle
//                   cx={11}
//                   cy={11}
//                   r={6}
//                   stroke="currentColor"
//                   strokeWidth={2}
//                 />
//               </svg>
//             </label>
//           </div>
//         </div>

//         {/* Categories grid (omitted for brevity) */}
//         <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-6 mb-12">
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150 bg-gradient-to-b from-yellow-50 to-white"
//             >
//               <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center shadow-inner">
//                 {/* Small illustrative placeholder circle */}
//                 <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <rect width="46" height="46" rx="8" fill="url(#g)" />
//                   <defs>
//                     <linearGradient id="g" x1="0" x2="1">
//                       <stop offset="0" stopColor="#fff7ed" />
//                       <stop offset="1" stopColor="#fff9f4" />
//                     </linearGradient>
//                   </defs>
//                 </svg>
//               </div>
//               <div className="text-xs text-gray-700 font-semibold leading-none text-center">
//                 {cat.title}
//               </div>
//             </button>
//           ))}
//         </div>

//         {/* Filters row (omitted for brevity) */}
//         <div className="mb-6">
//           <div className="flex flex-wrap gap-3 items-center">
//             <button className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm">
//               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M3 6h18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
//                 <path d="M6 12h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
//                 <path d="M10 18h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
//               </svg>
//               Filters
//             </button>

//             <div className="flex gap-2">
//               {['Under 5 km', 'Bowling', 'Today', 'Tomorrow', 'This Weekend', 'Art & Craft Workshops', 'Workshops'].map((f) => (
//                 <button key={f} className="rounded-full border px-3 py-2 text-sm text-gray-700">
//                   {f}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Activities list */}
//         <h2 className="text-lg font-semibold mb-4">All Activities</h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {activitiesList.map((a) => (
//             <div 
//               key={a.id} 
//               className="rounded-2xl bg-white border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
//             >
//               {/* === START CLICKABLE AREA === */}
//               <div onClick={() => onActivitySelect(a.id)}>
//                   <div className="h-40 bg-gradient-to-r from-gray-100 to-white flex items-end p-4">
//                     <div className="bg-white/90 rounded-full px-3 py-1 text-xs font-semibold shadow">{a.tag}</div>
//                   </div>
//                   <div className="p-4">
//                     <h3 className="text-md font-semibold mb-2 flex items-center justify-between">
//                       <span>{a.title}</span>
//                       <span className="text-sm font-bold text-[var(--accent)]">{a.displayPrice}</span>
//                     </h3>
//                     <p className="text-sm text-gray-500 mb-4">{a.location} | {a.date}, {a.time}</p>
//                   </div>
//               </div>
//               {/* === END CLICKABLE AREA === */}
              
//               <div className="flex items-center gap-3 p-4 pt-0">
//                   <button
//                     className="flex-1 rounded-full py-2 font-semibold text-sm shadow-sm"
//                     style={{
//                       background: `linear-gradient(90deg, var(${ACCENT_VAR}) 0%, rgba(255,120,90,0.9) 100%)`,
//                       color: '#fff',
//                     }}
//                   >
//                     Book now
//                   </button>
//                   {/* The dedicated 'Details' button can now be redundant or used for quick actions */}
//                   <button 
//                     onClick={() => onActivitySelect(a.id)}
//                     className="rounded-full border px-4 py-2 text-sm"
//                   >
//                     View
//                   </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Footer spacing */}
//         <div className="h-20" />
//       </div>

//       {/* Tiny global style to ensure accent variable exists if user didn't set it */}
//       <style>{`
//         :root { --accent: var(--accent, #FF785A); }
//         /* Make sure focus rings use the accent color */
//         :root:focus-within { --tw-ring-color: var(--accent); }
//       `}</style>
//     </div>
//   );
// }
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