import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [meetups, setMeetups] = useState([]);      
  const [user, setUser] = useState(null);          
  const [isLoginView, setIsLoginView] = useState(true); 
  const [showLanding, setShowLanding] = useState(true); 

  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', profilePic: '' }); 
  const [newMeetupData, setNewMeetupData] = useState({ title: '', category: 'Study', location: '', time: '', description: '', tags: '' }); 
  
  // NEW: State specifically for holding the uploaded file
  const [coverImageFile, setCoverImageFile] = useState(null); 
  const [chatDrafts, setChatDrafts] = useState({});
  
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchMeetups();
    const savedUser = localStorage.getItem('campusUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []); 

  const fetchMeetups = () => {
    axios.get('https://campus-connect-backend-l3et.onrender.com/api/meetups')
      .then(response => setMeetups(response.data))
      .catch(error => console.error(error));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? '/api/login' : '/api/register'; 

    axios.post(`https://campus-connect-backend-l3et.onrender.com${endpoint}`, authForm)
      .then(response => {
        if (isLoginView) {
          setUser(response.data.user); 
          localStorage.setItem('campusUser', JSON.stringify(response.data.user));
        } else {
          alert("Registered! You can now log in.");
          setIsLoginView(true); 
        }
      })
      .catch(error => alert("Auth Error: Check your details."));
  };

  // NEW: Updated to handle FormData and file uploads
  const handleCreateMeetup = (e) => {
    e.preventDefault();
    
    // Pack all the data into a FormData box so it can handle the file
    const formData = new FormData();
    formData.append('title', newMeetupData.title);
    formData.append('category', newMeetupData.category);
    formData.append('location', newMeetupData.location);
    formData.append('time', newMeetupData.time);
    formData.append('description', newMeetupData.description);
    formData.append('tags', newMeetupData.tags);
    formData.append('creatorId', user.id);
    formData.append('creatorName', user.name);
    
    // Only append the file if they actually uploaded one
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    // Send the FormData to the backend
    axios.post('https://campus-connect-backend-l3et.onrender.com/api/meetups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        setNewMeetupData({ title: '', category: 'Study', location: '', time: '', description: '', tags: '' });
        setCoverImageFile(null); // Reset the file picker
        setIsFormExpanded(false); 
        fetchMeetups(); 
      })
      .catch(error => console.error(error));
  };

  const handleJoinMeetup = (id) => {
    axios.put(`https://campus-connect-backend-l3et.onrender.com/api/meetups/${id}/join`, { userId: user.id })
      .then(() => fetchMeetups()) 
      .catch(error => console.error(error));
  };

  const deleteAction = (id) => {
    if(window.confirm("Are you sure you want to delete this event?")) {
      axios.delete(`https://campus-connect-backend-l3et.onrender.com/api/meetups/${id}`)
        .then(() => fetchMeetups()) 
        .catch(error => console.error("Error deleting:", error));
    }
  };

  const sendChatMessage = (e, meetupId) => {
    e.preventDefault();
    const text = chatDrafts[meetupId]; 
    if (!text) return; 

    axios.post(`https://campus-connect-backend-l3et.onrender.com/api/meetups/${meetupId}/chat`, {
      user: user.name, 
      message: text    
    })
    .then(() => {
      setChatDrafts({ ...chatDrafts, [meetupId]: '' });
      fetchMeetups();
    })
    .catch(err => console.error(err));
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Gaming': return '#9b59b6'; 
      case 'Sports': return '#e67e22'; 
      case 'Food': return '#e74c3c';   
      case 'Study': return '#1db954';  
      default: return '#1db954';
    }
  };

  if (!user) {
    if (showLanding) {
      const upcomingPreview = meetups.slice(0, 3);
      return (
        <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center', borderBottom: '1px solid #222' }}>
            <h1 style={{ color: '#1db954', margin: 0, fontSize: '1.5rem', letterSpacing: '-1px' }}>Campus Connect</h1>
            <button 
              onClick={() => setShowLanding(false)} 
              style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 25px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
              Log In
            </button>
          </header>

          <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>
              Your Campus. <br/><span style={{ color: '#1db954' }}>Your People.</span> Your Plans.
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '40px', lineHeight: '1.6' }}>
              Drop the messy group chats. Join study groups, find gaming squads, or grab post-hackathon pizza with students right here at RUET.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                onClick={() => { setIsLoginView(false); setShowLanding(false); }} 
                style={{ backgroundColor: '#1db954', color: '#000', border: 'none', padding: '15px 35px', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(29, 185, 84, 0.4)' }}>
                Join the Community
              </button>
            </div>
          </div>

          {upcomingPreview.length > 0 && (
            <div style={{ padding: '60px 20px', backgroundColor: '#1a1a1a' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>Happening Soon</h2>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
                {upcomingPreview.map(meetup => (
                  <div key={meetup._id} style={{ backgroundColor: '#252525', padding: '20px', borderRadius: '12px', width: '300px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    <span style={{ backgroundColor: getCategoryColor(meetup.category), color: '#fff', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {meetup.category}
                    </span>
                    <h3 style={{ margin: '15px 0 10px 0', fontSize: '1.3rem' }}>{meetup.title}</h3>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span>📍 {meetup.location}</span>
                      <span>🕒 {meetup.time}</span>
                    </p>
                    <button 
                      onClick={() => setShowLanding(false)} 
                      style={{ width: '100%', backgroundColor: '#333', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '80px 20px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ maxWidth: '280px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏷️</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>Filter the Noise</h3>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>Easily filter the feed by Study, Sports, Gaming, and Food to find exactly what you're looking for.</p>
            </div>
            <div style={{ maxWidth: '280px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💬</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>Built-in Chat</h3>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>Every meetup gets its own dedicated chat space so you can coordinate plans without sharing phone numbers.</p>
            </div>
            <div style={{ maxWidth: '280px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎓</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>Student-Exclusive</h3>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>A focused, verified environment built exclusively for our university to find what's happening right now.</p>
            </div>
          </div>

          <footer style={{ textAlign: 'center', padding: '60px 20px 40px', backgroundColor: '#1a1a1a', borderTop: '1px solid #222' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Ready to make the most of this semester?</h2>
            <button 
              onClick={() => { setIsLoginView(false); setShowLanding(false); }} 
              style={{ backgroundColor: '#1db954', color: '#000', border: 'none', padding: '15px 35px', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '40px' }}>
              Create Your Account
            </button>
            <p style={{ color: '#555', fontSize: '0.85rem', margin: 0 }}>© 2026 Campus Connect • Built for RUET</p>
          </footer>
        </div>
      );
    }

    return (
       <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', flexDirection: 'column', position: 'relative' }}>
        
        <button 
          onClick={() => setShowLanding(true)} 
          style={{ position: 'absolute', top: '30px', left: '30px', backgroundColor: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          ← Back to Home
        </button>

        <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>{isLoginView ? 'Welcome Back' : 'Join Campus'}</h2>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLoginView && (
              <>
                <input type="text" placeholder="Your Name" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }} />
                <input type="text" placeholder="Profile Image URL (Optional)" value={authForm.profilePic} onChange={(e) => setAuthForm({...authForm, profilePic: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }} />
              </>
            )}
            <input type="email" placeholder="University Email" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }} />
            <input type="password" placeholder="Password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }} />
            <button type="submit" style={{ backgroundColor: '#1db954', color: '#000', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isLoginView ? 'Log In' : 'Sign Up'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </p>
        </div>
      </div>
    );
  }

  const joinedCount = meetups.filter(m => m.attendees && m.attendees.some(id => id.toString() === user.id.toString())).length;
  const hostedCount = meetups.filter(m => m.creatorId === user.id).length;
  const myUpcomingRSVPs = meetups.filter(m => m.attendees && m.attendees.some(id => id.toString() === user.id.toString())).slice(0, 3);
  
  const filteredMeetups = meetups.filter(m => {
    const safeTitle = m.title || "";
    const safeDescription = m.description || "";
    const safeTags = m.tags || "";
    const matchesSearch = safeTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          safeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          safeTags.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'All' || m.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', padding: '20px 20px', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.4) !important; }
        .nav-item { transition: background-color 0.2s ease, padding-left 0.2s ease; }
        .nav-item:hover { background-color: #333; padding-left: 15px !important; }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#1e1e1e', padding: '15px 30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0', letterSpacing: '-1px', color: '#1db954' }}>Campus Connect</h1>
          <button onClick={() => { setUser(null); localStorage.removeItem('campusUser'); setShowLanding(true); }} style={{ backgroundColor: '#333', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </header>

        <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: '1', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ backgroundColor: '#1e1e1e', padding: '30px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              {user.profilePic ? (
                <img src={user.profilePic} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 15px', display: 'block', border: '3px solid #1db954' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1db954', color: '#000', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{user.name}</h3>
              <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0 0 20px 0' }}>🎓 ECE Department</p>

              <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #333', paddingTop: '15px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{joinedCount}</h4>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined</p>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{hostedCount}</h4>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hosted</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem', color: '#ddd' }}>
                <li style={{ padding: '10px 15px', backgroundColor: 'rgba(29, 185, 84, 0.15)', color: '#1db954', borderLeft: '4px solid #1db954', borderRadius: '0 8px 8px 0', marginBottom: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🏠 Home Feed</li>
                <li className="nav-item" style={{ padding: '10px 15px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>🔍 Explore</li>
                <li className="nav-item" style={{ padding: '10px 15px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>💬 Direct Messages</li>
                <li className="nav-item" style={{ padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>⚙️ Settings</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '0.95rem' }}>📅 My Upcoming Hangouts</h4>
              {myUpcomingRSVPs.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#777', margin: 0 }}>Nothing planned yet.</p>
              ) : (
                myUpcomingRSVPs.map(rsvp => (
                  <div key={rsvp._id} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{rsvp.title}</span>
                    <span style={{ fontSize: '0.75rem', color: getCategoryColor(rsvp.category) }}>{rsvp.time} • {rsvp.location}</span>
                  </div>
                ))
              )}
            </div>

          </div>

          <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              {!isFormExpanded ? (
                <div 
                  onClick={() => setIsFormExpanded(true)}
                  style={{ backgroundColor: '#333', padding: '15px', borderRadius: '30px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>➕</span> What's the plan, {user.name.split(' ')[0]}?
                </div>
              ) : (
                <form onSubmit={handleCreateMeetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Host a Hangout</h3>
                  
                  {/* NEW: Updated to an actual File Input */}
                  <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '-5px' }}>Upload Cover Image:</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCoverImageFile(e.target.files[0])} 
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }} 
                  />

                  <input type="text" placeholder="Hangout Title..." autoFocus required value={newMeetupData.title} onChange={(e) => setNewMeetupData({...newMeetupData, title: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white', fontSize: '1rem', fontWeight: 'bold' }} />
                  <textarea placeholder="Description / Details" required value={newMeetupData.description} onChange={(e) => setNewMeetupData({...newMeetupData, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white', fontFamily: 'inherit', resize: 'vertical', minHeight: '60px' }} />
                  <input type="text" placeholder="Tags e.g. Hackathon, OOP, Pizza (Comma Separated)" value={newMeetupData.tags} onChange={(e) => setNewMeetupData({...newMeetupData, tags: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }} />
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select value={newMeetupData.category} onChange={(e) => setNewMeetupData({...newMeetupData, category: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }}>
                      <option value="Study">Study</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Sports">Sports</option>
                      <option value="Food">Food</option>
                    </select>
                    <input type="text" placeholder="Location" required value={newMeetupData.location} onChange={(e) => setNewMeetupData({...newMeetupData, location: e.target.value})} style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }} />
                  </div>
                  <input type="text" placeholder="Time (e.g. Today at 5:00 PM)" required value={newMeetupData.time} onChange={(e) => setNewMeetupData({...newMeetupData, time: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }} />
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button type="button" onClick={() => setIsFormExpanded(false)} style={{ flex: 1, backgroundColor: 'transparent', color: '#aaa', border: '1px solid #555', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ flex: 2, backgroundColor: '#1db954', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Post Meetup</button>
                  </div>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input type="text" placeholder="🔍 Search hangouts or tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '12px 15px', borderRadius: '30px', border: 'none', backgroundColor: '#1e1e1e', color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} style={{ flex: 1, padding: '12px 15px', borderRadius: '30px', border: 'none', backgroundColor: '#1e1e1e', color: 'white', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <option value="All">All Categories</option>
                <option value="Study">Study</option>
                <option value="Gaming">Gaming</option>
                <option value="Sports">Sports</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div>
              {filteredMeetups.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#1e1e1e', borderRadius: '12px' }}>
                   <span style={{ fontSize: '3rem' }}>🏜️</span>
                   <p style={{ color: '#aaa', marginTop: '15px', fontSize: '1.1rem' }}>No hangouts found.</p>
                 </div>
              ) : (
                filteredMeetups.map((meetup) => {
                  const attendeeStrings = meetup.attendees ? meetup.attendees.map(id => id.toString()) : [];
                  const isAttending = attendeeStrings.includes(user.id.toString());

                  return (
                  <div key={meetup._id} className="hover-card" style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    
                    {/* NEW: Added back the fallback image logic from the previous step! */}
                    <div style={{ width: '100%', height: '200px', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img 
                        src={meetup.coverImage || 'https://undraw.co/api/images?path=images/illustrations/group_hangout_v86q.svg'} 
                        alt="Event Cover" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ backgroundColor: getCategoryColor(meetup.category), color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px' }}>
                          {meetup.category}
                        </div>
                        {user.id === meetup.creatorId && (
                          <button onClick={() => deleteAction(meetup._id)} style={{ backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                        )}
                      </div>

                      <h2 style={{ fontSize: '1.5rem', margin: '0 0 5px 0' }}>{meetup.title}</h2>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#555', color: '#fff', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {meetup.creatorName ? meetup.creatorName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span style={{ color: getCategoryColor(meetup.category), fontSize: '0.85rem' }}>Hosted by {meetup.creatorName || 'Anonymous'}</span>
                      </div>

                      {meetup.tags && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                          {meetup.tags.split(',').map((tag, i) => tag.trim() && (
                            <span key={i} style={{ color: '#1db954', fontSize: '0.75rem', backgroundColor: 'rgba(29, 185, 84, 0.1)', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p style={{ color: '#ddd', marginBottom: '20px', lineHeight: '1.6' }}>{meetup.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', color: '#aaa', margin: '0 0 20px 0', fontSize: '0.85rem', backgroundColor: '#252525', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📍 <span style={{ color: '#fff' }}>{meetup.location}</span></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>🕒 <span style={{ color: '#fff' }}>{meetup.time}</span></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>👥 <span style={{ color: '#1db954', fontWeight: 'bold' }}>{meetup.attendees ? meetup.attendees.length : 0}</span> Attending</span>
                      </div>
                      
                      <button 
                        onClick={() => handleJoinMeetup(meetup._id)} 
                        style={{ backgroundColor: isAttending ? '#333' : '#ffffff', color: isAttending ? '#ffffff' : '#000000', border: isAttending ? '1px solid #555' : 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s ease', width: '100%' }}>
                        {isAttending ? 'Leave Meetup' : 'Join Meetup'}
                      </button>

                      <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>💬 Event Chat</h4>
                        
                        <div className="chat-scroll" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', paddingRight: '5px' }}>
                          {meetup.eventChat && meetup.eventChat.map((msg, index) => {
                             const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                             return (
                             <div key={index} style={{ marginBottom: '10px', backgroundColor: '#252525', padding: '10px 14px', borderRadius: '12px 12px 12px 0', width: 'fit-content', minWidth: '150px', maxWidth: '85%' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '15px' }}>
                                 <strong style={{ color: getCategoryColor(meetup.category), fontSize: '0.8rem' }}>{msg.user}</strong>
                                 <span style={{ fontSize: '0.65rem', color: '#777' }}>{timeString}</span>
                               </div>
                               <div style={{ color: '#eee', fontSize: '0.85rem', lineHeight: '1.4' }}>{msg.message}</div>
                             </div>
                          )})}
                          {(!meetup.eventChat || meetup.eventChat.length === 0) && <p style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic', margin: '10px 0' }}>No messages yet. Start the conversation!</p>}
                        </div>

                        <form onSubmit={(e) => sendChatMessage(e, meetup._id)} style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Type a message..." value={chatDrafts[meetup._id] || ''} onChange={(e) => setChatDrafts({...chatDrafts, [meetup._id]: e.target.value})} style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #444', backgroundColor: '#252525', color: 'white', fontSize: '0.85rem' }} />
                          <button type="submit" style={{ backgroundColor: getCategoryColor(meetup.category), color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Send</button>
                        </form>
                      </div>

                    </div>
                  </div>
                )})
              )}
            </div>
          </div>

          <div style={{ flex: '1', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#aaa' }}>📍 Rajshahi Campus</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>28°C</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#777' }}>Partly Cloudy</p>
              </div>
              <div style={{ fontSize: '3rem' }}>🌤️</div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '0.95rem' }}>🏆 Top Connectors</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img src="https://i.pravatar.cc/150?img=5" alt="Nawshin" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e67e22' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>Nawshin Tasnim</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>Hosted 12 events</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="https://i.pravatar.cc/150?img=9" alt="Anindita" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #9b59b6' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>Anindita Sarker Arni</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>Hosted 8 events</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '0.95rem', color: '#fff' }}>📌 Official Bulletin</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.2rem' }}>🍕</div>
                  <div>
                    <h5 style={{ margin: '0 0 3px 0', fontSize: '0.85rem', color: '#1db954' }}>Post-Hackathon Hangouts</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#ccc', lineHeight: '1.4' }}>The CSE Hackathon wraps up this Friday! Keep an eye on the feed for late-night gaming and pizza runs hosted by the dev teams.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.2rem' }}>🏛️</div>
                  <div>
                    <h5 style={{ margin: '0 0 3px 0', fontSize: '0.85rem', color: '#e67e22' }}>Mahasthangarh Weekend</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#ccc', lineHeight: '1.4' }}>The weather in Bogura is looking perfect this weekend. Host an 'Explore' hangout and grab a group to visit Mahasthangarh!</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.2rem' }}>📚</div>
                  <div>
                    <h5 style={{ margin: '0 0 3px 0', fontSize: '0.85rem', color: '#9b59b6' }}>DSA Midterm Prep</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#ccc', lineHeight: '1.4' }}>Data Structures & Algorithms midterms are approaching. Don't struggle alone—host a 'Study' hangout to tackle Linked Lists and Trees together.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;