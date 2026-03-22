"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import api from '@/lib/api';
import './Navbar.css';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState([]);

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
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
        setRecentChats(recentUnreadChats.slice(0, 5));
      } catch (err) {
        console.warn("Could not fetch navbar messages:", err?.message);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="navbar-container">

      {/* LEFT: LOGO + TITLE */}
      <div
        className="logo-container"
        onClick={() => router.push('/dashboard')}
      >
        <Image
          src="/assets/nit-logo.png"
          alt="NIT Logo"
          width={42}
          height={42}
          className="nav-logo"
        />

        <h1 className="nav-brand">NIT Kurukshetra</h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right-side">

        {/* NAV LINKS */}
        <div className="nav-links">
          {['Home', 'Help', 'Contacts'].map(label => (
            <button
              key={label}
              className="nav-item"
              onClick={() => router.push(`/${label.toLowerCase()}`)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* MESSAGES */}
        <div className="message-wrapper">
          <button
            className="message-btn"
            onClick={() => setShowMessages(!showMessages)}
          >
            <MessageSquareText size={20} />
            {unreadCount > 0 && (
              <span className="message-badge">{unreadCount}</span>
            )}
          </button>

          <AnimatePresence>
            {showMessages && (
              <motion.div
                className="messages-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="dropdown-header">
                  <h3>Recent Messages</h3>
                  <button
                    className="new-chat-btn"
                    onClick={() => router.push('/dashboard/messages')}
                  >
                    View All
                  </button>
                </div>

                <div className="messages-list">
                  {recentChats.length > 0 ? (
                    recentChats.map((chat) => (
                      <div
                        key={chat.name}
                        className="message-item"
                        onClick={() => {
                          setShowMessages(false);
                          router.push(`/dashboard/messages?name=${encodeURIComponent(chat.name)}`);
                        }}
                      >
                        <div className="message-content">
                          <div className="message-top">
                            <h4>{chat.name}</h4>
                            {chat.unread > 0 && (
                              <span className="mini-badge">
                                {chat.unread}
                              </span>
                            )}
                          </div>

                          <p className="unread-bold-text">
                            {chat.lastMessage || "New message"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="message-item"
                      onClick={() => router.push('/dashboard/messages')}
                    >
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