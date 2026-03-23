"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api'; // Ensure path is correct
import toast from 'react-hot-toast';
import './updates.css';

const NoticeForm = () => {
  const [notice, setNotice] = useState({
    title: '',
    category: 'Urgent',
    content: '',
    expiryDate: '',
    subject: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchNotices();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/announcements');
      setNotices(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  function handleChange(e) {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/announcements/${editId}`, notice);
        toast.success("📢 Announcement Updated Successfully!", { position: 'top-center' });
        setEditId(null);
      } else {
        await api.post('/announcements', notice);
        toast.success("📢 Announcement Published Successfully!", { position: 'top-center' });
      }
      setNotice({ title: '', category: 'Urgent', content: '', expiryDate: '', subject: '', deadline: '' });
      fetchNotices();
    } catch (error) {
      toast.error("Error saving: " + (error.response?.data?.message || error.message), { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n) => {
    setEditId(n._id);
    setNotice({
      title: n.title,
      category: n.category,
      content: n.content,
      expiryDate: n.expiryDate ? n.expiryDate.substring(0, 10) : '',
      subject: n.subject ? (n.subject._id || n.subject) : '',
      deadline: n.deadline ? n.deadline.substring(0, 10) : ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchNotices();
      toast.success("📢 Announcement Removed Successfully!", { position: 'top-center' });
    } catch (error) {
      toast.error("Error deleting: " + (error.response?.data?.message || error.message), { position: 'top-center' });
    }
  };

  return (
    <div className="notice-container fade-in">
      <div className="notice-flex">
        <div className="notice-form-section">
          <div className="form-header">
            <h3>{editId ? "Edit Announcement" : "Create New Announcement"}</h3>
            {editId && (
              <button 
                type="button" 
                className="cancel-edit-btn"
                onClick={() => {
                  setEditId(null);
                  setNotice({ title: '', category: 'Urgent', content: '', expiryDate: '', subject: '', deadline: '' });
                }}
              >
                Cancel Edit
              </button>
            )}
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

            {notice.category === 'Academic' && (
              <div className="input-row">
                <div className="input-group">
                  <label>Subject (Optional)</label>
                  <select name="subject" value={notice.subject} onChange={handleChange}>
                    <option value="">-- Select Subject --</option>
                    {subjects.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subjectName} ({sub.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Deadline</label>
                  <input 
                    type="date" 
                    name="deadline"
                    value={notice.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

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
              {loading ? (editId ? "Updating..." : "Broadcasting...") : (editId ? "🔄 Update Announcement" : "🚀 Broadcast Announcement")}
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

      <div className="recent-notices-section">
        <h3>Recent Announcements</h3>
        {notices.length === 0 ? (
          <p className="no-notices">No announcements found.</p>
        ) : (
          <div className="recent-notices-list">
            {notices.map((n) => (
              <div key={n._id} className="recent-notice-card">
                <div className="recent-notice-content">
                  <span className={`recent-notice-tag ${n.category.toLowerCase()}`}>{n.category}</span>
                  <h4>{n.title}</h4>
                  <p>{n.content}</p>
                </div>
                <div className="recent-notice-actions">
                  <button onClick={() => handleEdit(n)} className="action-btn edit">✎ Edit</button>
                  <button onClick={() => handleDelete(n._id)} className="action-btn delete">🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeForm;