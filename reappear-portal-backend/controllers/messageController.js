import Message from '../models/Message.js';

// @desc    Get chat history between a specific user and the Exam Cell
// @route   GET /api/messages/:userIdentifier
export const getChatHistory = async (req, res) => {
    try {
        const { userIdentifier } = req.params; // e.g., 'Harsh Indoria' or a Roll Number

        // Find all messages where the user is either the sender OR the receiver with the Exam Cell
        const messages = await Message.find({
            $or: [
                { sender: userIdentifier, receiver: 'Exam Cell' },
                { sender: 'Exam Cell', receiver: userIdentifier }
            ]
        }).sort({ timestamp: 1 }); // Sorts by your custom 'timestamp' field (oldest first)

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat history", error: error.message });
    }
};

// @desc    Send a new message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
    try {
        // Matches the exact keys from your schema
        const { sender, receiver, content, chatType } = req.body;
        
        const newMessage = await Message.create({
            sender,
            receiver,
            content,
            chatType 
        });
        
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: "Failed to send message", error: error.message });
    }
};

// @desc    Get a list of all users who have an active chat with the Exam Cell
// @route   GET /api/messages/admin/conversations
export const getAdminConversations = async (req, res) => {
    try {
        // Find everyone who sent a message TO the Exam Cell
        const senders = await Message.distinct('sender', { receiver: 'Exam Cell' });
        // Find everyone the Exam Cell sent a message TO
        const receivers = await Message.distinct('receiver', { sender: 'Exam Cell' });

        // Combine the lists, remove duplicates, and remove 'Exam Cell' itself
        const activeUsers = [...new Set([...senders, ...receivers])].filter(user => user !== 'Exam Cell');
            
        res.status(200).json(activeUsers);
    } catch (error) {
        res.status(500).json({ message: "Failed to load admin inbox", error: error.message });
    }
};