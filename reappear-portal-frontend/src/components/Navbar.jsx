"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMessages, setShowMessages] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, sender: "Exam Cell Bot", avatar: "🤖", text: "Your reappear fee receipt has been generated successfully.", time: "10:30 AM", unread: true },
    { id: 2, sender: "Prof. A. Sharma", avatar: "👨‍🏫", text: "Are you free to discuss your OS assignment?", time: "Yesterday", unread: true },
    { id: 3, sender: "Karan Verma", avatar: "👨‍🎓", text: "Thanks for the PYQ pdf bro!", time: "Tuesday", unread: false }
  ]);

  const unreadCount = messages.filter(m => m.unread).length;

  const markAllRead = () => {
    setMessages(messages.map(m => ({ ...m, unread: false })));
  };

  const navLinks = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Help', path: '/help' },
    { label: 'Contacts', path: '/contacts' }
  ];

  return (
    <nav className="navbar-container">

      {/* 1. Left Side: Simple Logo */}
      <div className="logo-container" onClick={() => router.push('/dashboard')}>
        <h1 className="nav-brand">NIT Kurukshetra</h1>
      </div>

      {/* 2. Right Side: Links + Chat Icon */}
      <div className="nav-right-side">

        {/* The Text Links */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className={`nav-item ${pathname === link.path ? 'active' : ''}`}
              onClick={() => router.push(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* The Message Center */}
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
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="messages-dropdown"
              >
                <div className="dropdown-header">
                  <h3>Chats</h3>
                  <button className="new-chat-btn" onClick={markAllRead}>
                    Mark read
                  </button>
                </div>

                <div className="messages-list">
                  {messages.length > 0 ? (
                    messages.map(msg => (
                      <div key={msg.id} className="message-item" onClick={() => {
                        setShowMessages(false); // Close dropdown
                        router.push('/dashboard/messages'); // Route to the full page!
                      }}>
                        <div className="sender-avatar">{msg.avatar}</div>
                        <div className="message-content">
                          <h4 className="message-sender">
                            {msg.sender}
                            <span className="message-time">{msg.time}</span>
                          </h4>
                          <p className={`message-preview ${msg.unread ? 'unread-text' : ''}`}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No messages yet!</div>
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