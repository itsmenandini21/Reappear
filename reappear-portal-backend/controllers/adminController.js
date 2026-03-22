import User from '../models/user.js';
import Application from '../models/Application.js';
import ReappearRecord from '../models/reappearRecord.js';
import Announcement from '../models/announcement.js';

export const getOverviewStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalApplications = await Application.countDocuments();
    const pendingReappears = await ReappearRecord.countDocuments({ isCleared: false });
    const totalNotices = await Announcement.countDocuments();

    res.status(200).json({
      totalStudents,
      totalApplications,
      pendingReappears,
      totalNotices
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({ message: "Server error fetching overview stats" });
  }
};
