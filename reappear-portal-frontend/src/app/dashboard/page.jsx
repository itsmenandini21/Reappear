"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Folder from "@/components/Folder";
import AnimatedList from "@/components/AnimatedList";
import api from "@/lib/api";
import "./dashboard.css";

const dashboardData = [
  { id: "subjects", title: "Reappear Form", path: "/dashboard/subjects" },
  { id: "dates", title: "Exams", path: "/dashboard/exams" },
  { id: "faculty", title: "Faculty Info", path: "/dashboard/faculty" },
  { id: "peers", title: "Connect Peers", path: "/dashboard/peers" },
  { id: "pyq", title: "PYQs", path: "/dashboard/pyq" },
  { id: "estimator", title: "Difficulty Estimator", path: "/dashboard/estimator" },
];

export default function Dashboard() {
  const folderColor = "#ff2600";
  const router = useRouter();

  const [announcements, setAnnouncements] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔥 Fetch announcements
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await api.get("/announcements");

        const formatted = response.data.map((n, i) => {
  const category = n.category.toLowerCase();

  return (
    <div key={i} className="notice-card">
      <div className="notice-header">
        <span className={`notice-tag ${category}`}>
          {n.category.toUpperCase()}
        </span>

        <span className="notice-title">{n.title}</span>
      </div>

      <p className="notice-content">{n.content}</p>

      {/* 🔥 SHOW BUTTON ONLY FOR FEES */}
      {category === "fees" && (
        <button
          className="notice-action"
          onClick={() => router.push("/dashboard/subjects")}
        >
          Check Now →
        </button>
      )}
    </div>
  );
});

        setAnnouncements(formatted);
      } catch (error) {
        console.error("Error fetching announcements:", error?.message);

        setAnnouncements([
          <div key="err" className="notice-card">
            Could not load announcements
          </div>,
        ]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchNotices();
  }, [router]);

  // 🔥 Cursor lighting
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar />

      {/* 🔥 ANNOUNCEMENTS */}
      <div className="announcement-section">
        <h2 className="announcement-title">Latest Announcements</h2>

        {isLoaded && (
          <AnimatedList
            items={announcements}
            showGradients={true}
            displayScrollbar={true}
          />
        )}
      </div>

      {/* 🔥 DASHBOARD CARDS */}
      <div className="dashboard-grid">
        {dashboardData.map((item) => (
          <div
            key={item.id}
            className="folder-card"
            onClick={() => router.push(item.path)}
          >
            <div className="folder-wrapper">
              <Folder color={folderColor} size={2.8} />
            </div>

            <h3 className="card-title">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}