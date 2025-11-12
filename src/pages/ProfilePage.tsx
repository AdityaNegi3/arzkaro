import React, { useState, useCallback, createContext, useContext, useMemo, useEffect } from 'react';
import { Edit2, X, User, Briefcase, Users, Save, Globe, LogOut, Image as ImageIcon } from 'lucide-react';
// NOTE: In a real React project, you would import the Supabase client here:
// import { createClient } from '@supabase/supabase-js';

// --- Global Constants & Utilities ---
const PRIMARY_COLOR = '#FF785A';
const SECONDARY_COLOR = '#E46D54';
const DEFAULT_AVATAR_URL = 'https://placehold.co/100x100/FF785A/ffffff?text=AV'; // Fallback image

// 1. CONTEXT DEFINITION
const ProfileContext = createContext(null);

// 2. CUSTOM HOOK TO ACCESS CONTEXT
const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// 3. PROFILE PROVIDER (Manages state and logic)
const ProfileProvider = ({ children }) => {
  // --- SUPABASE CONFIGURATION (READ FROM .ENV) ---
  // In a real project, replace these lines with your actual environment variable access:
  // const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  // const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const SUPABASE_URL = 'https://bvbmxxxtlwtbjxstakwm.supabase.co'; // Replace with your actual URL
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Ym14eHh0bHd0Ymp4c3Rha3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjY4NjQsImV4cCI6MjA3ODQ0Mjg2NH0.tw2OLkEflxOInM67Bkog9CPGwfNqxLB8Nqif9YsCw1w'; // Replace with your actual ANON KEY
  
  // Simulated Supabase client for this environment
  const supabase = useMemo(() => {
    // In a real project, this would be: return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('--- SUPABASE CLIENT INITIALIZED (MOCK) ---');
    
    // Mock user data for initialization/session check
    const mockSession = { user: { id: 'mock-user-id-12345', email: 'aditya@example.com' } };

    return {
      // Mocking the auth object and required methods
      auth: {
        getSession: async () => ({ 
          data: { session: mockSession }
        }),
        signOut: async () => { /* Actual sign out logic here */ },
        // Add other auth methods like onAuthStateChange if needed
      },
      from: (tableName) => ({
        // Mocking the select method: simulates fetching no existing data (new user case)
        select: async () => ({ data: null, error: { code: 'PGRST116' } }), 
        // Mocking the upsert method
        upsert: async (data, options) => ({ data: [data], error: null }),
      }),
    };
  }, [SUPABASE_URL, SUPABASE_ANON_KEY]);
  // --- END SUPABASE CONFIGURATION ---

  const [profile, setProfile] = useState({
    fullName: 'Guest User',
    bio: '',
    pictureUrl: DEFAULT_AVATAR_URL,
  });
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // 4. ASYNC LOGIC: FETCH INITIAL PROFILE DATA & AUTH
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      
      // 1. Get current user session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session || !session.user) {
        // User not logged in, remain in default state
        console.log("No active Supabase session found or error:", authError);
        setUserId(null);
        setIsLoading(false);
        return;
      }

      const currentUserId = session.user.id;
      setUserId(currentUserId);

      // 2. Fetch profile data from 'profiles' table using the user's ID
      // IMPORTANT: In your real app, uncomment the code below to use the real supabase client.
      
      /* const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();
      */
      
      // MOCK DATA FETCH START (Used for this Canvas environment)
      const mockFetchResult = { data: null, error: { code: 'PGRST116' } };
      const { data, error } = mockFetchResult;
      // MOCK DATA FETCH END
      
      
      // PGRST116 means 'No rows found', which is okay (new user)
      if (error && error.code !== 'PGRST116') { 
        console.error('Error fetching profile:', error);
      }
      
      if (data) {
        setProfile({
          fullName: data.full_name || session.user.email.split('@')[0],
          bio: data.bio || '',
          // --- FIX 1: Use avatar_url for loading ---
          pictureUrl: data.avatar_url || DEFAULT_AVATAR_URL, 
        });
      } else {
         // Use default/session data if no profile row exists yet
        setProfile(prev => ({
          ...prev,
          fullName: session.user.email ? session.user.email.split('@')[0] : 'New User',
        }));
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [supabase]);

  // 5. DATA SAVING FUNCTION
  const updateProfile = useCallback(async (newProfileData) => {
    if (!userId) {
      console.error("Cannot save: User is not authenticated.");
      return;
    }
    
    // Merge new data with current profile state
    const updatedState = { ...profile, ...newProfileData };

    // --- SUPABASE WRITE OPERATION ---
    const profileToSave = {
      id: userId, // CRITICAL: Link profile to the auth user ID
      full_name: updatedState.fullName,
      bio: updatedState.bio,
      // --- FIX 2: Use avatar_url for saving ---
      avatar_url: updatedState.pictureUrl, // Store Base64 or URL
    };
    
    /* // IMPORTANT: In your real app, uncomment the code below for the actual write operation
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileToSave, { 
        onConflict: 'id', 
        ignoreDuplicates: false, 
      })
      .select();
    
    if (error) {
      console.error('Error saving profile:', error);
      return;
    }
    */
    
    // MOCK WRITE SUCCESS
    const data = [profileToSave]; 
    // END MOCK WRITE

    // Update local state only if save was successful
    setProfile(updatedState);
    console.log('Profile saved successfully (Mocked):', data);

  }, [profile, userId, supabase]);

  // 6. SIGN OUT FUNCTION
  const signOut = useCallback(async () => {
    // --- SUPABASE SIGN OUT OPERATION ---
    // Uncomment this line in your actual project:
    // const { error } = await supabase.auth.signOut(); 
    
    const error = null; // Mock error variable
    
    if (error) {
      console.error('Sign out error:', error);
      return;
    }

    // Update local state to show signed out screen
    console.log('User signed out successfully.');
    setIsSignedOut(true);
  }, [supabase]);

  const value = useMemo(() => ({ profile, updateProfile, signOut, isSignedOut, isLoading, userId }), [profile, updateProfile, signOut, isSignedOut, isLoading, userId]);

  if (isSignedOut) {
    return <SignedOutScreen />;
  }
  
  // Show a loading screen while fetching initial data
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5 text-[#FF785A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading profile data...</span>
              </div>
          </div>
      );
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// --- Custom Components ---

// Component shown after successful sign out
const SignedOutScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
    <LogOut size={64} className="text-gray-400 mb-6" />
    <h1 className="text-3xl font-bold text-gray-800 mb-2">You Have Signed Out</h1>
    <p className="text-lg text-gray-500 max-w-md">
      Thank you for using our profile manager. You can safely close this window.
    </p>
    <button 
      onClick={() => window.location.reload()}
      className="btn-primary mt-8 inline-flex items-center gap-2"
    >
      Sign Back In (Reload)
    </button>
  </div>
);

// --- ProfileModal Component (For Editing) ---
const ProfileModal = ({ onClose }) => {
  const { profile, updateProfile } = useProfile();
  
  // Local states initialized with current profile data
  const [currentFullName, setCurrentFullName] = useState(profile.fullName || '');
  const [currentBio, setCurrentBio] = useState(profile.bio || '');
  // This state now holds either a URL or a Base64 string
  const [currentPictureUrl, setCurrentPictureUrl] = useState(profile.pictureUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  // Create a ref for the hidden file input
  const fileInputRef = React.useRef(null);

  // Function to handle file selection and convert to Base64
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Input sanitation: Check file size (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
          // In a real app, display a modal message here
          // Using console.error for now to respect the no-alert rule
          console.error("Image too large. Max 2MB allowed."); 
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the image source to the Base64 Data URL
        setCurrentPictureUrl(reader.result);
      };
      // Read the file as a data URL (Base64)
      reader.readAsDataURL(file);
    } else if (file) {
        console.error("Please select an image file.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Call the context function which handles the Supabase write
    await updateProfile({ 
      fullName: currentFullName,
      bio: currentBio, 
      pictureUrl: currentPictureUrl
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-start justify-center p-4 sm:p-8 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-xl my-8 rounded-xl shadow-2xl transform transition-all border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="user-fullname" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="user-fullname"
              type="text"
              value={currentFullName}
              onChange={(e) => setCurrentFullName(e.target.value)}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-[${PRIMARY_COLOR}] focus:border-[${PRIMARY_COLOR}] transition duration-150 text-gray-700`}
              placeholder="Your full legal name"
              maxLength={100}
            />
          </div>

          {/* Profile Picture Upload/Display Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className='flex items-center gap-4'>
              {/* Image Preview */}
              <div className="flex-shrink-0 relative">
                  <img
                      src={currentPictureUrl || DEFAULT_AVATAR_URL}
                      alt="Current Avatar"
                      className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-gray-200"
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }}
                  />
              </div>
              
              <div className='flex flex-col sm:flex-row gap-2'>
                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                {/* Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                    <ImageIcon size={18} />
                    Upload from Device
                </button>

                {/* Clear Button */}
                {currentPictureUrl !== DEFAULT_AVATAR_URL && (
                    <button
                        type="button"
                        onClick={() => setCurrentPictureUrl(DEFAULT_AVATAR_URL)}
                        className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                    >
                        <X size={16} />
                        Clear Photo
                    </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              *Note: Image is stored as a Base64 string in the database for simplicity. For large production images, you should upload to Supabase Storage and save the URL instead.
            </p>
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="user-bio" className="block text-sm font-medium text-gray-700 mb-2">
              Your Bio (Max 500 characters)
            </label>
            <textarea
              id="user-bio"
              rows={6}
              value={currentBio}
              onChange={(e) => setCurrentBio(e.target.value)}
              maxLength={500}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#FF785A] focus:border-[#FF785A] transition duration-150 resize-none text-gray-700"
              placeholder="Tell us a little about yourself, your hobbies, or your travel style..."
            ></textarea>
            <p className="text-right text-xs text-gray-500 mt-1">
              {currentBio.length} / 500
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition duration-150 ${
              isSaving
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-[#FF785A] text-white hover:bg-[#E46D54] shadow-md hover:shadow-lg'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- ProfileSidebar Component (Navigation) ---
const ProfileSidebar = ({ selected, onSelect }) => {
  const { signOut } = useProfile();
  
  const links = [
    { id: 'about', label: 'About me', icon: User },
    { id: 'past', label: 'Past trips', icon: Briefcase },
    { id: 'connections', label: 'Connections', icon: Users },
  ];

  return (
    <div className="airbnb-card p-4 lg:p-6 sticky top-0 md:top-20">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Profile Settings</h3>
      <nav className="space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelect(link.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition duration-150 
              ${selected === link.id
                ? 'bg-primary-light text-primary-active font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <link.icon size={20} />
            {link.label}
          </button>
        ))}
        
        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 p-3 mt-4 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-left font-medium transition duration-150"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </nav>
    </div>
  );
};

// --- ProfileContent Component (Inner page content) ---
const ProfileContent = () => {
  const { profile } = useProfile();
  const [tab, setTab] = useState('about');
  const [openEdit, setOpenEdit] = useState(false);

  // Helper function to render bio or placeholder
  const renderBioContent = () => {
    if (profile.bio) {
      return (
        <p className="text-base text-gray-700 mt-5 leading-relaxed max-w-lg whitespace-pre-line">
          {profile.bio}
        </p>
      );
    }
    return (
      <p className="text-sm text-gray-600 italic mt-5 leading-relaxed max-w-lg">
        Welcome! Add a short bio to help hosts and other guests get to know you.
      </p>
    );
  };

  const getPageTitle = () => {
    switch (tab) {
      case 'about': return 'About me';
      case 'past': return 'Past trips';
      case 'connections': return 'Connections';
      default: return '';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <ProfileSidebar selected={tab} onSelect={(t) => setTab(t)} />
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-800">
                {getPageTitle()}
              </h1>
              {tab === 'about' && (
                <button
                  onClick={() => setOpenEdit(true)}
                  className="inline-flex items-center gap-2 btn-primary"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>

            {/* ABOUT TAB */}
            {tab === 'about' && (
              <section className="grid lg:grid-cols-[2fr_1fr] gap-8">
                {/* Profile info card */}
                <div className="airbnb-card p-6 sm:p-10 flex flex-col items-center sm:items-start sm:gap-8 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                    {/* Large Avatar */}
                    <img
                        src={profile.pictureUrl || DEFAULT_AVATAR_URL}
                        alt={`${profile.fullName}'s avatar`}
                        className="w-24 h-24 rounded-full object-cover shadow-lg flex-shrink-0 border-4 border-white"
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }}
                    />

                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold capitalize text-gray-800">
                        {profile?.fullName ?? 'Guest'}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1">
                        <Globe size={14} /> Guest since 2024
                      </p>
                    </div>
                  </div>

                  {/* Bio Content */}
                  <div className="mt-6 pt-6 border-t border-gray-100 w-full">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">My Bio</h3>
                    {renderBioContent()}
                    {!profile.bio && (
                      <button
                          onClick={() => setOpenEdit(true)}
                          className="text-primary-active hover:text-[#E46D54] text-sm font-medium mt-3 transition duration-150"
                        >
                          Click here to add your bio
                        </button>
                    )}
                  </div>
                </div>

                {/* Complete profile card (now focused on the bio/picture) */}
                <aside className="airbnb-card p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xl mb-3 text-gray-800">Profile Completeness</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                      Make a great first impression! Update your profile picture and write a detailed bio.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      className="btn-primary w-full py-2.5 text-[15px]"
                      onClick={() => setOpenEdit(true)}
                    >
                      {profile.bio || profile.pictureUrl ? 'Edit Details' : 'Complete Profile'}
                    </button>
                  </div>
                </aside>
              </section>
            )}

            {/* OTHER TABS (Mock content) */}
            {tab === 'past' && (
              <section className="py-16 flex flex-col items-center text-center airbnb-card p-8">
                <Briefcase size={64} className="text-primary-active mb-6" />
                <p className="text-gray-500 mb-4 max-w-lg">
                  You'll find your past reservations here after you've taken your first trip on our platform.
                </p>
                <button className="btn-primary">Book a trip</button>
              </section>
            )}

            {tab === 'connections' && (
              <section className="py-8 airbnb-card p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Travel Companions</h3>
                <p className="text-gray-600">You currently have no connections to display.</p>
                <p className="text-sm text-gray-500 mt-2">Start by sharing your profile link to connect with friends!</p>
              </section>
            )}
          </main>
        </div>
      </div>

      {openEdit && <ProfileModal onClose={() => setOpenEdit(false)} />}
    </>
  );
}


// --- Main App Component (Wrapper for Provider) ---
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Tailwind & Custom CSS */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        :root { font-family: 'Inter', sans-serif; }
        
        .airbnb-card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }
        /* Custom Primary Color Classes */
        .text-primary-active { color: ${PRIMARY_COLOR}; }
        .bg-primary-light { background-color: #FFF5F4; }
        
        .btn-primary {
          background-color: ${PRIMARY_COLOR};
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: ${SECONDARY_COLOR};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <ProfileProvider>
        <ProfileContent />
      </ProfileProvider>
    </div>
  );
}

export default App;