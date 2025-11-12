import React, { useState } from 'react';
import { User, MessageCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavbarProps = {
  onAuthClick: () => void;
  onProfileClick: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onChatClick: () => void; // chat icon click handler
};

export default function Navbar({
  onAuthClick,
  onProfileClick,
  currentPage,
  onNavigate,
  onChatClick,
}: NavbarProps) {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const leagueFont = {
    fontFamily:
      `'League Spartan', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`,
  };

  const NavItem = ({
    label,
    page,
    colorClasses,
    onClick,
  }: {
    label: string;
    page: string;
    colorClasses: string;
    onClick?: () => void;
  }) => {
    const isActive = currentPage === page;

    return (
      <button
        onClick={() => {
          onNavigate(page);
          if (onClick) onClick();
        }}
        className={`inline-flex items-center px-4 py-2 rounded-full text-base font-bold tracking-wide transition-all duration-200 ${
          isActive
            ? `${colorClasses} shadow-sm text-gray-900`
            : `text-gray-700 hover:text-gray-900 ${colorClasses}`
        }`}
      >
        {label}
      </button>
    );
  };

  const handleChatClick = () => {
    if (user) {
      onChatClick();
    } else {
      onAuthClick();
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-300"
      style={leagueFont}
    >
      {/* ===== DESKTOP: unchanged for md+ ===== */}
      <div className="hidden md:flex w-full px-10 py-4 justify-between items-center">
        {/* LEFT: logo (bigger visual scale but same navbar height) */}
        <div className="flex items-center">
          <button
            onClick={() => onNavigate('home')}
            aria-label="Go to home"
            className="flex items-center"
          >
            <img
              src="/logo.png"
              alt="arz"
              className="h-14 w-auto object-contain transform scale-150 origin-left"
            />
          </button>
        </div>

        {/* CENTER: nav links */}
        <div className="flex items-center gap-10">
          <NavItem
            label="Events"
            page="events"
            colorClasses="hover:bg-rose-200 active:bg-rose-200 bg-rose-200/0"
          />
          <NavItem
            label="Trips"
            page="trips"
            colorClasses="hover:bg-lime-200 active:bg-lime-200 bg-lime-200/0"
          />
          <NavItem
            label="Activities"
            page="activities"
            colorClasses="hover:bg-sky-200 active:bg-sky-200 bg-sky-200/0"
          />
        </div>

        {/* RIGHT: chat + login/profile */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleChatClick}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Open chat"
            title={user ? 'Open chat' : 'Sign in to use chat'}
          >
            <MessageCircle size={24} className="text-gray-700" />
          </button>

          {user ? (
            <button
              onClick={onProfileClick}
              className="flex items-center gap-3 hover:opacity-90 transition"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username ?? 'profile'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
              )}
              <span className="text-base font-semibold text-gray-900">
                {profile?.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-4 py-2 rounded-full text-base font-semibold text-gray-900 hover:bg-gray-200 transition-all duration-200"
            >
              Login/Signup
            </button>
          )}
        </div>
      </div>

      {/* ===== MOBILE: only for small screens (md:hidden) ===== */}
      <div className="flex md:hidden w-full px-4 py-3 items-center justify-between">
        {/* LEFT: logo aligned left on mobile */}
        <div className="flex items-center">
          <button
            onClick={() => onNavigate('home')}
            aria-label="Go to home"
            className="flex items-center"
          >
            <img src="/logo.png" alt="arz" className="h-10 w-auto object-contain" />
          </button>
        </div>

        {/* spacer to keep center area flexible */}
        <div className="flex-1" />

        {/* RIGHT: chat + hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleChatClick}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Open chat"
            title={user ? 'Open chat' : 'Sign in to use chat'}
          >
            <MessageCircle size={20} className="text-gray-700" />
          </button>

          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-over / menu (simple full-screen panel) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm p-6 md:hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="arz" className="h-10 w-auto object-contain" />
              <span className="text-lg font-bold">Menu</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <NavItem
              label="Events"
              page="events"
              colorClasses="hover:bg-rose-200 active:bg-rose-200 bg-rose-200/0"
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              label="Trips"
              page="trips"
              colorClasses="hover:bg-lime-200 active:bg-lime-200 bg-lime-200/0"
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              label="Activities"
              page="activities"
              colorClasses="hover:bg-sky-200 active:bg-sky-200 bg-sky-200/0"
              onClick={() => setMobileOpen(false)}
            />
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6 flex flex-col gap-4">
            {user ? (
              <button
                onClick={() => {
                  onProfileClick();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username ?? 'profile'} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={18} className="text-gray-600" />
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold">{profile?.username}</div>
                  <div className="text-sm text-gray-600">View profile</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  setMobileOpen(false);
                }}
                className="px-4 py-2 rounded-full text-base font-semibold text-gray-900 hover:bg-gray-200 transition-all duration-200"
              >
                Login / Signup
              </button>
            )}

            <button
              onClick={() => {
                handleChatClick();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-100 transition"
            >
              <MessageCircle size={18} />
              <span>Chat</span>
            </button>

            <div className="mt-4 text-sm text-gray-600">
              <div className="font-medium mb-2">Quick links</div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { onNavigate('events'); setMobileOpen(false); }} className="px-3 py-1 rounded-full text-sm hover:bg-gray-100">Events</button>
                <button onClick={() => { onNavigate('trips'); setMobileOpen(false); }} className="px-3 py-1 rounded-full text-sm hover:bg-gray-100">Trips</button>
                <button onClick={() => { onNavigate('activities'); setMobileOpen(false); }} className="px-3 py-1 rounded-full text-sm hover:bg-gray-100">Activities</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
