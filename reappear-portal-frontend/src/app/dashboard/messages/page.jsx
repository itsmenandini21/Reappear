"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // <-- NEW: To read the URL
import { Send, Paperclip, MessageSquareText } from 'lucide-react';
import './Messages.css';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Exam Cell Bot",
      avatar: "🤖",
      type: "admin",
      status: "Online",
      unread: 0,
      messages: [
        { id: 101, text: "Your reappear fee receipt has been generated successfully.", sender: "them", time: "10:30 AM" },
        { id: 102, text: "Thank you, I will download it now.", sender: "me", time: "10:35 AM" }
      ]
    },
    {
      id: 2,
      name: "Karan Verma",
      avatar: "👨‍🎓",
      type: "student",
      status: "Online",
      unread: 0,
      messages: [
        { id: 301, text: "Thanks for the PYQ pdf bro!", sender: "them", time: "Tuesday" },
        { id: 302, text: "No problem, good luck with the prep.", sender: "me", time: "Tuesday" }
      ]
    }
  ]);

  // NEW: This effect runs when the page loads to check the URL
  useEffect(() => {
    const incomingName = searchParams.get('name');
    const incomingType = searchParams.get('type') || 'student';
    const incomingAvatar = searchParams.get('avatar') || '👤';

    if (incomingName) {
      setConversations(prev => {
        // 1. Check if we already have a chat with this person
        const existingChat = prev.find(c => c.name === incomingName);
        
        if (existingChat) {
          // If yes, just make it the active chat
          setActiveChatId(existingChat.id);
          return prev;
        } else {
          // 2. If no, create a brand new chat for them!
          const newId = Date.now();
          setActiveChatId(newId);
          return [{
            id: newId,
            name: incomingName,
            avatar: incomingAvatar,
            type: incomingType,
            status: 'Online',
            unread: 0,
            messages: [] // Starts empty!
          }, ...prev];
        }
      });
    } else if (!activeChatId) {
       // If no URL params, just open the first chat by default
       setActiveChatId(1);
    }
  }, [searchParams]);

  const activeChat = conversations.find(c => c.id === activeChatId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    const updatedConversations = conversations.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, { 
            id: Date.now(), 
            text: newMessage, 
            sender: "me", 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
          }]
        };
      }
      return chat;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };

  const markAsRead = (id) => {
    setActiveChatId(id);
    setConversations(conversations.map(chat => 
      chat.id === id ? { ...chat, unread: 0 } : chat
    ));
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
            {conversations.map(chat => {
              const lastMessage = chat.messages[chat.messages.length - 1];
              return (
                <div 
                  key={chat.id} 
                  className={`conversation-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => markAsRead(chat.id)}
                >
                  <div className="convo-avatar">{chat.avatar}</div>
                  <div className="convo-info">
                    <div className="convo-name-time">
                      <h4 className="convo-name">{chat.name}</h4>
                      <span className="convo-time">{lastMessage ? lastMessage.time : 'New'}</span>
                    </div>
                    <p className={`convo-preview ${chat.unread > 0 ? 'unread-bold' : ''}`}>
                      {lastMessage ? lastMessage.text : 'Start a conversation...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {activeChat ? (
          <div className="chat-window">
            <div className="chat-header">
              <div className="convo-avatar">{activeChat.avatar}</div>
              <div className="chat-header-info">
                <h3>{activeChat.name}</h3>
                <p style={{ color: activeChat.status === 'Online' ? '#28a745' : '#999' }}>
                  {activeChat.status}
                </p>
              </div>
            </div>

            <div className="messages-area">
              {activeChat.messages.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#999' }}>
                  Say hello to {activeChat.name}! 👋
                </div>
              ) : (
                activeChat.messages.map(msg => (
                  <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`}>
                    {msg.text}
                    <span className="message-time-small">{msg.time}</span>
                  </div>
                ))
              )}
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <Paperclip size={24} />
              </button>
              <input 
                type="text" 
                className="message-input" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-btn">
                <Send size={20} />
              </button>
            </form>
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