"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Paperclip, MessageSquareText } from 'lucide-react';
import api from '@/lib/api'; 
import './Messages.css';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]); 
  const [messages, setMessages] = useState([]); 
  const [tempChat, setTempChat] = useState(null);
  const [isUserActive, setIsUserActive] = useState(true);
  const messagesEndRef = useRef(null);

  const [user, setUser] = useState(null);

  // 1. Initial Setup: Load User & Conversations
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadInbox(parsedUser.name);
    }
  }, []);

  const loadInbox = async (userName) => {
    try {
      const res = await api.get(`/messages/conversations/${userName}`);
      const formatted = res.data.map((c) => ({
        id: c.name, 
        name: c.name,
        avatar: c.name.includes("Bot") ? "🤖" : "👨‍🎓",
        status: "Online",
        unread: c.unread,
        lastMessage: c.lastMessage,
        time: c.time ? new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''
      }));
      setConversations(formatted);
    } catch (err) { console.error("Inbox load failed", err); }
  };

  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  useEffect(() => {
    if (initializedFromUrl) return;

    const incomingName = searchParams.get('name');
    if (incomingName) {
      const existing = conversations.find(c => c.name === incomingName);
      if (existing) {
        setActiveChatId(existing.id);
      } else {
        const newTemp = {
          id: incomingName, name: incomingName, avatar: "👤", status: "Online", unread: 0, lastMessage: "Start a conversation...", time: "Now"
        };
        setTempChat(newTemp);
        setActiveChatId(newTemp.id);
      }
      
      router.replace('/dashboard/messages');
      setInitializedFromUrl(true);
    }
  }, [searchParams, conversations, initializedFromUrl, router]);

  // 3. Real-time Message Fetching (Polling) - UPDATED FOR isUserActive
  useEffect(() => {
    if (activeChatId && user) {
      const fetchHistory = async () => {
        try {
          const res = await api.get(`/messages/history/${user.name}/${activeChatId}`);
          // Backend ab object bhej raha hai: { messages, isUserActive }
          setMessages(res.data.messages || []); 
          setIsUserActive(res.data.isUserActive ?? true);
        } catch (err) { console.error(err); }
      };
      fetchHistory();
      const interval = setInterval(fetchHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayList = tempChat 
    ? [tempChat, ...conversations.filter(c => c.name !== tempChat.name)]
    : conversations;

  const activeChat = displayList.find(c => c.id === activeChatId);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;
    if (!user) {
      alert("You need to be logged in to send messages!");
      return;
    }
    if (!activeChat) {
      alert("Please select a user to message from the sidebar.");
      return;
    }

    const currentText = newMessage.trim();
    setNewMessage('');

    const optimisticMsg = {
      sender: user.name,
      content: currentText,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    // Array safety check for optimistic update
    setMessages(prev => Array.isArray(prev) ? [...prev, optimisticMsg] : [optimisticMsg]);

    try {
      await api.post('/messages', {
        sender: user.name,
        receiver: activeChat.name,
        content: currentText,
        chatType: activeChat.name.includes("Bot") ? "admin" : "student"
      });
      
      if (tempChat) setTempChat(null);
      loadInbox(user.name);
      
      const res = await api.get(`/messages/history/${user.name}/${activeChatId}`);
      setMessages(res.data.messages || []);
      setIsUserActive(res.data.isUserActive ?? true);
    } catch (err) {
      console.error("Message send failed", err);
      alert("Failed to send message: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="messages-page-wrapper">
      <div className="chat-container">
        
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <input type="text" className="chat-search" placeholder="Search chats..." />
          </div>
          
          <div className="conversations-list">
            {displayList.map(chat => (
              <div 
                key={chat.id} 
                className={`conversation-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="convo-avatar">{chat.avatar}</div>
                <div className="convo-info">
                  <div className="convo-name-time">
                    <h4 className="convo-name">{chat.name}</h4>
                    <span className="convo-time">{chat.time}</span>
                  </div>
                  <p className={`convo-preview ${chat.unread > 0 ? 'unread-bold' : ''}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeChat ? (
          <div className="chat-window">
            <div className="chat-header">
              <div className="convo-avatar">{activeChat.avatar}</div>
              <div className="chat-header-info">
                <h3>{activeChat.name}</h3>
              </div>
            </div>

            <div className="messages-area">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.sender === user?.name ? 'message-sent' : 'message-received'}`}>
                  {msg.content}
                  <div className="msg-footer" style={{ fontSize: '10px', textAlign: 'right', opacity: 0.7 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {msg.sender === user?.name && <span style={{ color: msg.isRead ? '#4fc3f7' : '#999' }}> ✓✓</span>}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* --- UPDATED INPUT AREA WITH CONDITION --- */}
            {isUserActive ? (
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <button type="button" className="icon-btn"><Paperclip size={24} /></button>
                <input 
                  type="text" 
                  className="message-input" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button type="submit" className="send-btn">
                  <Send size={20} />
                </button>
              </form>
            ) : (
              <div className="user-unavailable-banner" style={{
                padding: '15px',
                textAlign: 'center',
                backgroundColor: '#fff3f3',
                color: '#d32f2f',
                fontSize: '14px',
                borderTop: '1px solid #ffcdd2',
                fontWeight: '500'
              }}>
                ⚠️ This user is no longer available. You can't send new messages.
              </div>
            )}
          </div>
        ) : (
          <div className="no-chat-selected">
            <MessageSquareText size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>Select a conversation to start messaging</h3>
          </div>
        )}

      </div>
    </div>
  );
}