const User = require("../Models/userModel");
const Message = require("../Models/msgModel");
const catchAsync = require("../Utils/catchAsync");
const cloudinary = require("../Helpers/cloudinary");
const AppError = require("../Utils/appError");
const { getReceiverSocketId, io } = require("../Lib/socket");


exports.getUsersForSidebar = catchAsync ( async (req, res, next) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }}).select("-password");
        
        res.status(200).json({
            success: true,
            users: filteredUsers,
        })
    }catch(err){
        console.error(err.message);
        return next(new AppError("Internal Server Error", 500, res))
    }
})

exports.getMessages = catchAsync (async (req, res, next ) => {
    try{
        const { id:userToChatId } = req.params
        const myId = req.user._id;

        const messages = await Message.find({ 
            $or:[
                {senderId:myId, receiverId: userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })

        res.status(200).json({
            success: true,
            data: messages
        })

    }catch(err){
        console.error(err.message);
        return next(new AppError("Internal server error", 500, res))
    }
})

exports.sendMessage = catchAsync( async (req, res, next) => {
    try{
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.emit("newMessage", newMessage);
        }

        res.status(201).json({
            success: true,
            data: newMessage
        })
    }catch(err){
        console.log(err.message);
        return next(new AppError("Internal server error", 500, res))
    }
})

