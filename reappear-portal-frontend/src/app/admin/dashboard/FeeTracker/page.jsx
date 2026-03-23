"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import "./feeTracker.css";

const emptySections = {
  pending: [],
  approved: [],
  rejected: []
};

export default function FeeTracker() {
  const [applications, setApplications] = useState(emptySections);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications/admin/fee-tracker");
      setApplications({
        pending: response.data.pending || [],
        approved: response.data.approved || [],
        rejected: response.data.rejected || []
      });
    } catch (error) {
      console.error("Failed to fetch fee tracker data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await api.patch(`/applications/admin/fee-tracker/${applicationId}`, { status });
      await fetchApplications();
    } catch (error) {
      console.error(`Failed to ${status} application:`, error);
      alert(error.response?.data?.message || "Unable to update fee form status right now.");
    } finally {
      setUpdatingId("");
    }
  };

  const getReceiptUrl = (receiptUrl) => {
    if (!receiptUrl) return "";
    if (/^https?:\/\//i.test(receiptUrl)) return receiptUrl;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
    return `${backendOrigin}${receiptUrl.startsWith("/") ? receiptUrl : `/${receiptUrl}`}`;
  };

  const renderCard = (application, isPending = false) => {
    const isOpen = activeId === application.id;
    const isBusy = updatingId === application.id;

    const resolvedReceiptUrl = getReceiptUrl(application.receiptUrl);

    return (
      <article
        key={application.id}
        className={`ft-student-card ${isOpen ? "expanded" : ""}`}
        onClick={() => setActiveId(isOpen ? "" : application.id)}
        onMouseEnter={() => setActiveId(application.id)}
        onMouseLeave={() => setActiveId("")}
      >
        <div className="ft-card-header">
          <div>
            <span className="ft-student-name">{application.student.name}</span>
            <span className="ft-student-roll">
              {application.student.rollNumber} • {application.subject.code}
            </span>
          </div>

          <div className={`ft-status-pill ${application.status}`}>
            {application.status}
          </div>
        </div>

        <div className="ft-card-subtitle">
          <span>{application.subject.name}</span>
          <span>{application.student.branch || "Branch N/A"}</span>
        </div>

        <div className="ft-hover-panel">
          <div className="ft-detail-grid">
            <div className="ft-detail-box">
              <span className="ft-detail-label">Transaction ID</span>
              <span className="ft-detail-value">{application.transactionId}</span>
            </div>
            <div className="ft-detail-box">
              <span className="ft-detail-label">Semester</span>
              <span className="ft-detail-value">{application.subject.semester || application.student.currentSemester || "N/A"}</span>
            </div>
            <div className="ft-detail-box">
              <span className="ft-detail-label">Submitted</span>
              <span className="ft-detail-value">{new Date(application.submittedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="ft-action-row">
            <button
              type="button"
              className="ft-view-btn"
              onClick={(event) => {
                event.stopPropagation();
                window.open(resolvedReceiptUrl, "_blank", "noopener,noreferrer");
              }}
              disabled={!resolvedReceiptUrl}
            >
              View Receipt
            </button>

            {isPending && (
              <>
                <button
                  type="button"
                  className="ft-approve-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    updateStatus(application.id, "approved");
                  }}
                  disabled={isBusy}
                >
                  {isBusy ? "Updating..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="ft-reject-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    updateStatus(application.id, "rejected");
                  }}
                  disabled={isBusy}
                >
                  {isBusy ? "Updating..." : "Disapprove"}
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderSection = (title, items, emptyText, isPending = false) => (
    <section className="ft-section">
      <div className="ft-section-header">
        <div>
          <h2>{title}</h2>
          <p>{emptyText}</p>
        </div>
        <span className="ft-count-badge">{items.length}</span>
      </div>

      {items.length ? (
        <div className="ft-vertical-list">
          {items.map((application) => renderCard(application, isPending))}
        </div>
      ) : (
        <div className="ft-empty-card">No students in this section right now.</div>
      )}
    </section>
  );

  if (loading) {
    return (
      <div className="ft-main-wrapper">
        <div className="ft-loading-card">Loading fee submissions...</div>
      </div>
    );
  }

  return (
    <div className="ft-main-wrapper">
      <div className="ft-hero">
        <div>
          <span className="ft-eyebrow">Admin Fee Tracker</span>
          <h1>Review fee receipts before the form is fully accepted</h1>
          <p>Hover on a student card to inspect the transaction ID, open the receipt, and approve or disapprove pending submissions.</p>
        </div>
      </div>

      <div className="ft-sections">
        {renderSection("Pending Forms", applications.pending, "These submissions still need admin review.", true)}
        {renderSection("Approved Forms", applications.approved, "Approved students move here automatically after validation.")}
        {renderSection("Disapproved Forms", applications.rejected, "Rejected submissions stay here for audit while the student gets an email.")}
      </div>
    </div>
  );
}
