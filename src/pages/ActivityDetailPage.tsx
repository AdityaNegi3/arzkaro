// src/pages/ActivityDetailPage.tsx (CORRECTED)

import React from 'react';
import { Activity, GLOBAL_ACTIVITY_TERMS } from '../data/mockActivity';
// NOTE: No AuthContext or component imports here, as this component doesn't need them.

interface ActivityDetailPageProps {
    activity: Activity;
    onBack: () => void;
}

const ACCENT_VAR = "--accent";

export default function ActivityDetailPage({ activity, onBack }: ActivityDetailPageProps) {
    if (!activity) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-xl text-gray-600">Activity not found. That's awkward.</p>
            </div>
        );
    }

    const dateTime = `${activity.date} | ${activity.time}`;

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-[var(--accent)] mb-6"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Activities
                </button>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Image, Details, Terms */}
                    <div className="md:col-span-2">
                        
                        {/* Image Placeholder */}
                        <div className="h-64 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 overflow-hidden shadow-lg relative">
                            <span className="text-gray-500 italic p-4 text-center">
                                

[Image of {activity.title} activity]

                            </span>
                            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                                {activity.tag}
                            </div>
                        </div>

                        {/* Title and Price */}
                        <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
                        <p className="text-xl font-bold text-[var(--accent)] mb-6">
                            {activity.displayPrice} <span className="text-base text-gray-500 font-normal">+ ₹500 mandatory cover charge (fully redeemable)</span>
                        </p>

                        {/* Activity Details Card */}
                        <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-8">
                            <h2 className="text-xl font-semibold mb-3">About the Activity</h2>
                            <p className="text-gray-700 mb-4">{activity.about}</p>
                            
                            <h3 className="text-lg font-semibold mt-4 mb-2 border-t pt-3">Ideal For:</h3>
                            <p className="text-gray-600 italic">{activity.idealFor}</p>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Terms & Conditions</h2>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                                {GLOBAL_ACTIVITY_TERMS.map((term, index) => (
                                    <li key={index}>{term}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="md:col-span-1">
                        <div className="md:sticky md:top-20 bg-white p-6 border border-gray-100 rounded-2xl shadow-lg">
                            <h3 className="text-xl font-bold mb-4">Event Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-gray-700">
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Date & Time
                                    </span>
                                    <span className="font-semibold">{dateTime}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-700">
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243m1.414-8.486L10.586 3.1a1.998 1.998 0 012.828 0l4.243 4.243m-7.071 7.07l-1.414 1.415M4 12h16" /></svg>
                                        Location
                                    </span>
                                    <span className="font-semibold">{activity.location}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-700 border-t pt-3 font-bold">
                                    <span className="text-lg">Ticket Price</span>
                                    <span className="text-lg text-black">{activity.displayPrice}</span>
                                </div>
                            </div>
                            
                            {/* Booking Button */}
                            <button
                                className="w-full rounded-full py-3 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                                style={{
                                    background: `linear-gradient(90deg, var(${ACCENT_VAR}) 0%, rgba(255,120,90,0.9) 100%)`,
                                    color: '#fff',
                                }}
                            >
                                Book Now
                            </button>
                            <p className='text-xs text-gray-400 text-center mt-2'>*Plus internet handling fee and mandatory cover charge</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Global style to ensure accent variable exists if user didn't set it (copied from Activities.tsx)
<style>{`
  :root { --accent: var(--accent, #FF785A); }
  /* Make sure focus rings use the accent color */
  :root:focus-within { --tw-ring-color: var(--accent); }
`}</style>