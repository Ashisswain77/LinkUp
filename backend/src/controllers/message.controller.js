import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { Id: userToChatId } = res.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userToChatId },
                { sender: userToChatId, receiver: myId }
            ]
        })
        res.status(200).json(messages);

    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessages = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { Id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadedImage = await cloudinary.uploader.upload(image);
            imageUrl = uploadedImage.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        await newMessage.save();

        // todo: realtime functionality => socket.io

        res.status(200).json(newMessage);
        
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};