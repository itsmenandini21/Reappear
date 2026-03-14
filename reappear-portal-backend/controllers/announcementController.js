import Announcement from '../models/announcement.js';

export const createAnnouncement = async (req, res) => {
  try {
    const { title, category, content, expiryDate } = req.body;
    const newNotice = new Announcement({ title, category, content, expiryDate });
    await newNotice.save();
    res.status(201).json({ message: "Announcement Published Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating announcement", error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    // Latest announcements pehle dikhane ke liye sort kiya hai
    const notices = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};