"use client";
import { useState } from 'react';
import api from '@/lib/api'; // Ensure path is correct
import './updates.css';

const NoticeForm = () => {
  const [notice, setNotice] = useState({
    title: '',
    category: 'Urgent',
    content: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', notice);
      alert("📢 Announcement Published Successfully!");
      setNotice({ title: '', category: 'Urgent', content: '', expiryDate: '' });
    } catch (error) {
      alert("Error publishing: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notice-container fade-in">
      <div className="notice-flex">
        <div className="notice-form-section">
          <div className="form-header">
            <h3>Create New Announcement</h3>
          </div>

          <form onSubmit={handleSubmit} className="actual-form">
            <div className="input-group">
              <label>Title</label>
              <input 
                type="text" 
                placeholder="e.g. Reappear Registration Open - June 2026"
                name="title"
                value={notice.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Category</label>
                <select name="category" value={notice.category} onChange={handleChange}>
                  <option value="Urgent">🚨 Urgent</option>
                  <option value="Academic">📅 Academic</option>
                  <option value="Fees">💰 Fee Related</option>
                  <option value="General">ℹ️ General Info</option>
                </select>
              </div>
              <div className="input-group">
                <label>Display Until</label>
                <input 
                  type="date" 
                  name="expiryDate"
                  value={notice.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Detailed Message</label>
              <textarea 
                rows="5" 
                placeholder="Type the full details here..."
                name="content"
                value={notice.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="publish-btn" disabled={loading}>
              {loading ? "Broadcasting..." : "🚀 Broadcast Announcement"}
            </button>
          </form>
        </div>

        <div className="notice-preview-section">
          <h4>Live Preview (Student View)</h4>
          <div className={`preview-card ${notice.category.toLowerCase()}`}>
            <div className="preview-tag">{notice.category}</div>
            <h5>{notice.title || "Your Headline Here..."}</h5>
            <p>{notice.content || "Content details will appear here as you type."}</p>
            <div className="preview-footer">
              <span>📅 {new Date().toLocaleDateString()}</span>
              <span>NIT KKR Registrar Office</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeForm;