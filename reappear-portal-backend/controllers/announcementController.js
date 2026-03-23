import Announcement from '../models/announcement.js';

export const createAnnouncement = async (req, res) => {
  try {
    const { title, category, content, expiryDate, subject, deadline } = req.body;
    
    // Prevent Mongoose CastErrors by converting "" to undefined
    const noticeData = { title, category, content };
    if (expiryDate) noticeData.expiryDate = expiryDate;
    if (subject) noticeData.subject = subject;
    if (deadline) noticeData.deadline = deadline;

    const newNotice = new Announcement(noticeData);
    await newNotice.save();
    res.status(201).json({ message: "Announcement Published Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating announcement", error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    // Latest announcements pehle dikhane ke liye sort kiya hai
    const notices = await Announcement.find().populate('subject', 'subjectName subjectCode').sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { title, category, content, expiryDate, subject, deadline } = req.body;
    
    // Prevent Mongoose CastErrors for updates
    const updateData = { title, category, content };
    updateData.expiryDate = expiryDate || null;
    updateData.subject = subject || null;
    updateData.deadline = deadline || null;

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement updated successfully!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating announcement", error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting announcement", error: error.message });
  }
};