"use client";
import { useState } from 'react';
import './updates.css';

const NoticeForm = () => {
  const [notice, setNotice] = useState({
    title: '',
    category: 'Urgent',
    content: '',
    expiryDate: ''
  });
  function handleChange(e) {
    setNotice({...notice,[e.target.name]:e.target.value})
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Publishing Notice:", notice);
    alert("📢 Announcement Published Successfully!");
    setNotice({ title: '', category: 'Urgent', content: '', expiryDate: '' });
  };

  return (
    <div className="notice-container fade-in">
      <div className="notice-flex">
        
        {/* LEFT: FORM SIDE */}
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
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Category</label>
                <select 
                  name="category"
                  onChange={handleChange}
                >
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
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="publish-btn">🚀 Broadcast Announcement</button>
          </form>
        </div>

        {/* RIGHT: LIVE PREVIEW SIDE */}
        <div className="notice-preview-section">
          <h4>Live Preview (Student View)</h4>
          <div className={`preview-card ${notice.category.toLowerCase()}`}>
            <div className="preview-tag">{notice.category}</div>
            <h5>{notice.title || "Your Headline Here..."}</h5>
            <p>{notice.content || "Content"}</p>
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