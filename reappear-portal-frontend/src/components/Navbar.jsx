"use client"
import React from 'react';
import GradientText from './GradientText';
import PillNav from './PillNav';
import nitLogo from '../../public/assets/nit-logo.png'; 
import './Navbar.css';

export default function Navbar() {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Profile', href: '/profile' },
    { label: 'Help', href: '/help' },
    { label: 'Contacts', href: '/contacts' }
  ];

  return (
    <nav className="navbar-container">
      {/* Left Side: Animated Text */}
      <div className="logo-container">
        <GradientText 
          colors={["#ff2600", "#ff9300", "#ff2600"]} 
          animationSpeed={8} 
          showBorder={false}
        >
          NIT Kurukshetra
        </GradientText>
      </div>

      {/* Right Side: The GSAP Animated PillNav */}
      <PillNav
        logo={nitLogo}
        logoAlt="NIT Logo"
        items={navItems}
        activeHref="/"
        ease="power2.easeOut"
        baseColor="#ff2600" /* The animation circle color (Theme Red) */
        pillColor="rgba(255, 255, 255, 0.5)" /* Slightly transparent white for the pill background */
        hoveredPillTextColor="#ffffff" /* Text turns white when hovered */
        pillTextColor="#333333" /* Dark gray text by default */
        theme="color"
        initialLoadAnimation={true}
      />
    </nav>
  );
}