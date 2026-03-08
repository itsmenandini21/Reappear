"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Download, Check, Map, HelpCircle, FileStack } from 'lucide-react';
// import Navbar from '@/components/Navbar'; // Uncomment if needed!
import './Help.css';

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const processSteps = [
    { title: "Notification Released", desc: "Exam cell releases the official notification for upcoming reappear exams on the portal." },
    { title: "Form Submission", desc: "Fill out the reappear subject details and generate the fee challan online." },
    { title: "Fee Payment", desc: "Pay the required fee at the SBI portal or bank counter and save the receipt." },
    { title: "HOD Approval", desc: "Submit the printed form and fee receipt to your department's clerk for HOD signature." },
    { title: "Admit Card Generation", desc: "Download your reappear admit card from the portal 3 days before the exam." }
  ];

  const faqs = [
    { q: "How many maximum reappears can I give in one semester?", a: "As per NIT Kurukshetra ordinance, a student can register for a maximum of 3 reappear subjects along with their regular semester subjects." },
    { q: "What happens if my fee payment fails but money is deducted?", a: "Do not pay again immediately. Wait for 24-48 hours. If the status doesn't update, contact the Exam Cell with your transaction reference number." },
    { q: "Can I carry forward a 1st-year reappear to my 3rd year?", a: "Yes, but it is highly advised to clear it as soon as possible. B.Tech degree must be completed within the maximum allowed duration (usually 8 years)." },
    { q: "Do I need to attend classes for a reappear subject?", a: "If you have an 'F' grade due to low marks, you only need to give the exam. If you have a shortage of attendance, you must re-register and attend classes." }
  ];

  const documents = [
    { title: "B.Tech Ordinance & Grading Rules", size: "2.4 MB PDF" },
    { title: "Standard Reappear Form (Offline)", size: "1.1 MB PDF" },
    { title: "Medical Leave Application Format", size: "840 KB PDF" }
  ];

  return (
    <>
      {/* <Navbar /> */}
      <div className="help-page-wrapper">
        
        <div className="help-header">
          <h1 className="help-title">Panic Relief & Support</h1>
          <p className="help-subtitle">Your complete guide to navigating the reappear process without the stress.</p>
        </div>

        {/* Section 1: The Process Timeline */}
        <section className="help-section">
          <h2 className="section-heading"><Map color="#ff2600" /> Reappear Process Lifecycle</h2>
          <div className="timeline-container">
            {processSteps.map((step, index) => (
              <div key={index} className="timeline-step">
                {/* Visual Dot */}
                <div className={`timeline-dot ${index < 2 ? 'completed' : ''}`}>
                  {index < 2 ? <Check size={14} /> : <div style={{width: '6px', height: '6px', background: '#ff2600', borderRadius: '50%'}} />}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: FAQ Accordions */}
        <section className="help-section">
          <h2 className="section-heading"><HelpCircle color="#ff2600" /> Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  {faq.q}
                  <ChevronDown className="faq-icon" size={20} />
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="faq-answer-content">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Document Vault */}
        <section className="help-section">
          <h2 className="section-heading"><FileStack color="#ff2600" /> Official Document Vault</h2>
          <div className="doc-grid">
            {documents.map((doc, index) => (
              <div key={index} className="doc-card">
                <div className="doc-info">
                  <FileText className="doc-icon" size={28} />
                  <div>
                    <h3 className="doc-title">{doc.title}</h3>
                    <p className="doc-size">{doc.size}</p>
                  </div>
                </div>
                <button className="download-btn">
                  <Download size={16} /> Download
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}