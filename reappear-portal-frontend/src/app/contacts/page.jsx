"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, AlertOctagon, Building2, UserCircle, Clock } from 'lucide-react';
import './Contacts.css';

export default function Contacts() {
  
  // Structured Directory Data
  const emergencyContact = {
    name: "Tech Support & Helpdesk",
    role: "Portal & Server Issues",
    phone: "+91 1744 233 208",
    email: "helpdesk@nitkkr.ac.in",
    location: "Computer Centre, CCN",
    hours: "24/7 Support Portal"
  };

  const examCell = [
    {
      name: "Controller of Examinations",
      role: "Admit Cards & Results",
      phone: "+91 1744 233 227",
      email: "coe@nitkkr.ac.in",
      location: "Admin Block, Ground Floor",
    },
    {
      name: "Fee Section (Accounts)",
      role: "Payment Failures & Receipts",
      phone: "+91 1744 233 224",
      email: "accounts@nitkkr.ac.in",
      location: "Admin Block, Room 102",
    }
  ];

  const departments = [
    {
      name: "Information Technology",
      role: "HOD & Dept. Clerk",
      phone: "+91 1744 233 531",
      email: "hodit@nitkkr.ac.in",
      location: "IT Block, 1st Floor",
    },
    {
      name: "Computer Engineering",
      role: "HOD & Dept. Clerk",
      phone: "+91 1744 233 478",
      email: "hodce@nitkkr.ac.in",
      location: "Computer Block, 2nd Floor",
    },
    {
      name: "Electronics & Comm.",
      role: "HOD & Dept. Clerk",
      phone: "+91 1744 233 425",
      email: "hodece@nitkkr.ac.in",
      location: "ECE Block, Ground Floor",
    }
  ];

  // Helper component to render standard contact cards
  const ContactCard = ({ data, isUrgent = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`contact-card ${isUrgent ? 'urgent' : ''}`}
    >
      <div className="card-header">
        <div className="icon-box">
          {isUrgent ? <AlertOctagon size={24} /> : <UserCircle size={24} />}
        </div>
        <div>
          <h3 className="contact-name">{data.name}</h3>
          <p className="contact-role">{data.role}</p>
        </div>
      </div>

      <div className="contact-details">
        <div className="detail-line">
          <Phone className="detail-icon" size={16} />
          <span>{data.phone}</span>
        </div>
        <div className="detail-line">
          <Mail className="detail-icon" size={16} />
          <span>{data.email}</span>
        </div>
        <div className="detail-line">
          <MapPin className="detail-icon" size={16} />
          <span>{data.location}</span>
        </div>
        {data.hours && (
          <div className="detail-line">
            <Clock className="detail-icon" size={16} />
            <span>{data.hours}</span>
          </div>
        )}
      </div>

      <button className="contact-action-btn">
        {isUrgent ? 'Raise Ticket' : 'Send Email'}
      </button>
    </motion.div>
  );

  return (
    <div className="contacts-page-wrapper">
      
      <div className="contacts-header">
        <h1 className="contacts-title">University Directory</h1>
        <p className="contacts-subtitle">Find the right administrative contact to resolve your queries instantly.</p>
      </div>

      {/* 1. Emergency Tech Support */}
      <div className="contact-category">
        <h2 className="category-title">
          <AlertOctagon color="#ff2600" /> Urgent Portal Support
        </h2>
        <div className="contacts-grid" style={{ gridTemplateColumns: '1fr' }}>
          <ContactCard data={emergencyContact} isUrgent={true} />
        </div>
      </div>

      {/* 2. Exam Cell & Accounts */}
      <div className="contact-category">
        <h2 className="category-title">
          <Building2 color="#ff2600" /> Controller of Examinations
        </h2>
        <div className="contacts-grid">
          {examCell.map((contact, index) => (
            <ContactCard key={index} data={contact} />
          ))}
        </div>
      </div>

      {/* 3. Department Nodes */}
      <div className="contact-category">
        <h2 className="category-title">
          <MapPin color="#ff2600" /> Academic Departments
        </h2>
        <div className="contacts-grid">
          {departments.map((contact, index) => (
            <ContactCard key={index} data={contact} />
          ))}
        </div>
      </div>

    </div>
  );
}