"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api'; // Use your axios instance
import './Navbar.css';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState([]);

  // Get current user from storage
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (!user) return;
    
    const fetchUnread = async () => {
      try {
        // Fetch recent conversations to get the unread count and who sent them
        const res = await api.get(`/messages/conversations/${user.name}`);
        const convos = res.data || [];
        
        let totalUnread = 0;
        const recentUnreadChats = [];
        
        convos.forEach(chat => {
          if (chat.unread > 0) {
            totalUnread += chat.unread;
            recentUnreadChats.push(chat);
          }
        });

        setUnreadCount(totalUnread);
        setRecentChats(recentUnreadChats.slice(0, 5)); // show up to 5 users with unread messages
      } catch (err) { console.error("Error fetching navbar messages:", err); }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="navbar-container">
      <div className="logo-container" onClick={() => router.push('/dashboard')}>
        <h1 className="nav-brand">NIT Kurukshetra</h1>
      </div>

      <div className="nav-right-side">
        <div className="nav-links">
          {['Home', 'Help', 'Contacts'].map(label => (
            <button key={label} className="nav-item" onClick={() => router.push(`/${label.toLowerCase()}`)}>{label}</button>
          ))}
        </div>

        <div className="message-wrapper">
          <button className="message-btn" onClick={() => setShowMessages(!showMessages)}>
            <MessageSquareText size={20} />
            {unreadCount > 0 && <span className="message-badge">{unreadCount}</span>}
          </button>

          <AnimatePresence>
            {showMessages && (
              <motion.div className="messages-dropdown">
                <div className="dropdown-header">
                  <h3>Recent Messages</h3>
                  <button className="new-chat-btn" onClick={() => router.push('/dashboard/messages')}>View All</button>
                </div>
                <div className="messages-list">
                    {recentChats.length > 0 ? (
                      recentChats.map((chat) => (
                        <div key={chat.name} className="message-item" onClick={() => {
                          setShowMessages(false);
                          router.push(`/dashboard/messages?name=${encodeURIComponent(chat.name)}`);
                        }}>
                          <div className="message-content text-left">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{chat.name}</h4>
                              {chat.unread > 0 && (
                                <span style={{ backgroundColor: '#ff3b3b', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                                  {chat.unread}
                                </span>
                              )}
                            </div>
                            <p className="unread-bold-text" style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {chat.lastMessage || "New message"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="message-item" onClick={() => router.push('/dashboard/messages')}>
                          <div className="message-content">
                              <p>No new messages</p>
                          </div>
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}