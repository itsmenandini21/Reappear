"use client";
import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import "./frontPage.css";

export default function FrontPage() {
  return (
    <div className="front-wrapper">
      {/* NAVIGATION BAR */}
      <nav className="front-nav">
        <div className="front-container">
          <div className="front-logo-section">
            <span className="nit-icon">🏛️</span>
            <div className="front-brand-text">
              <span className="nit-name">NIT Kurukshetra</span>
              <span className="portal-name">Reappear Hub</span>
            </div>
          </div>
          <div className="front-nav-links">
            <Link href="/login" className="front-btn-text">Login</Link>
            <Link href="/register" className="front-btn-filled">Join Portal</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="front-hero">
        <div className="front-hero-content">
          <div className="nit-badge">NIT KKR Official Academic Support</div>
          <h1 className="front-title">
            Master Your Backlogs <br />
            <span className="accent-red">With Confidence.</span>
          </h1>
          <p className="front-subtitle">
            The premier digital destination for NIT Kurukshetra students. 
            Automate your reappear forms, download PYQs, and find study partners in one click.
          </p>
        </div>

        {/* GLASS PREVIEW BOX */}
        <div className="front-hero-visual">
          <div className="glass-preview-card">
            <div className="glass-top">
              <div className="dot-red"></div>
              <div className="dot-amber"></div>
              <div className="dot-green"></div>
            </div>
            <div className="glass-inner">
              <div className="skeleton-header"></div>
              <div className="skeleton-row"></div>
              <div className="skeleton-grid">
                <div className="skeleton-square"></div>
                <div className="skeleton-square"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* INFO SECTION */}
      <section id="info" className="front-features">
        <div className="front-feat-card">
          <div className="icon-circle">📝</div>
          <h3>Smart Forms</h3>
          <p>Get notified as soon as NITK releases reappear forms. No more missing deadlines.</p>
        </div>
        <div className="front-feat-card">
          <div className="icon-circle">📚</div>
          <h3>PYQ Library</h3>
          <p>A curated collection of previous year questions specifically for reappear exams.</p>
        </div>
        <div className="front-feat-card">
          <div className="icon-circle">🤝</div>
          <h3>Peer Study</h3>
          <p>Don't study alone. Connect with students who share the same backlog subjects.</p>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}