import Message from '../models/Message.js';
import User from '../models/user.js'; 

export const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, content, chatType } = req.body;
        if (!sender || !receiver || !content) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newMessage = await Message.create({
            sender,
            receiver,
            content,
            chatType: chatType || 'student'
        });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: "Failed to send message", error: error.message });
    }
};


export const getChatHistory = async (req, res) => {
    try {
        const { user1, user2 } = req.params; 


        const otherUser = await User.findOne({ name: user2 });

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 });

        await Message.updateMany(
            { sender: user2, receiver: user1, isRead: false },
            { $set: { isRead: true } }
        );

    
        res.status(200).json({
            messages: messages,
            isUserActive: !!otherUser 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat history", error: error.message });
    }
};


export const getUnreadStats = async (req, res) => {
    try {
        const { userName } = req.params;
        const unreadCount = await Message.countDocuments({ 
            receiver: userName, 
            isRead: false 
        });
        res.status(200).json({ total: unreadCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getActiveConversations = async (req, res) => {
    try {
        const { userName } = req.params;
        const sentTo = await Message.distinct('receiver', { sender: userName });
        const receivedFrom = await Message.distinct('sender', { receiver: userName });
        let allContacts = [...new Set([...sentTo, ...receivedFrom])];

        allContacts = allContacts.filter(c => c !== "Exam Cell Bot");

        if (allContacts.length === 0) {
            return res.status(200).json([]);
        }

        const conversations = await Promise.all(allContacts.map(async (contact) => {
            const lastMsg = await Message.findOne({
                $or: [
                    { sender: userName, receiver: contact },
                    { sender: contact, receiver: userName }
                ]
            }).sort({ timestamp: -1 });

            const unreadCount = await Message.countDocuments({
                sender: contact,
                receiver: userName,
                isRead: false
            });

            return {
                name: contact,
                lastMessage: lastMsg ? lastMsg.content : "Start your first chat!",
                time: lastMsg ? lastMsg.timestamp : new Date(),
                unread: unreadCount
            };
        }));

        conversations.sort((a, b) => b.time - a.time);
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Failed to load conversations", error: error.message });
    }
};