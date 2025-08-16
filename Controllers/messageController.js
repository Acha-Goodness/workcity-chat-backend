const User = require("../Models/userModel");
const Message = require("../Models/msgModel");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appFeatures");

exports.getUsersForSidebar = catchAsync ( async (res, req, next) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }}).select("-password");

        res.status(200).json({
            success: true,
            users: filteredUsers,
        })
    }catch(err){
        console.error(err.message);
        return next (new AppError("Internal Server Error", 500, res))
    }
})

exports.getMessages = catchAsync (async (res, req, next ) => {
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

