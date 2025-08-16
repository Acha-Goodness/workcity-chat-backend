const User = require("../Models/userModel");
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
        console.error(error.message);
        return next (new AppError("Internal Server Error", 500, res))
    }
})

