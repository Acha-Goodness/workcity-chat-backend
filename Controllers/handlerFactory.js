const catchAsync = require("../Utils/catchAsync");
const crypto = require("crypto");
const AppError = require("../Utils/appError");
const { sendJWTToken, correctPassword, createOTP } = require("../Utils/appFeatures");
const Email = require("../Utils/email");
const jwt = require("jsonwebtoken");

exports.verifyOTP = Model => catchAsync( async (req, res, next) => {
    
    const hashedOtp = crypto.createHash("sha256").update(req.body.otp).digest("hex");
    const doc = await Model.findOne({$and: [{otpToken: hashedOtp}, {otpExpires: {$gt: new Date()}}]});

    if(!doc) return next(new AppError("OTP is invalid or has expired", 401, res)) 
    
    doc.active = true;
    doc.otpToken = undefined;
    doc.otpExpires = undefined;
    await doc.save({ validateBeforeSave: false})

    sendJWTToken(doc, 201, res);
});

exports.login = Model => catchAsync( async (req, res, next) => {
    const { email, password } = req.body;

    // CHECK IF USER EXISTS AND PASSWORD IS CORRECT
    if(!email || !password) return next(new AppError("Please provide email and password", 401, res))

    const doc = await Model.findOne({email: email}).select("+password");
    if(!doc || !(await correctPassword(password, doc.password))){
        return next(new AppError("Incorrect email or password", 401, res))
    }

    // IF EVERYTHING IS OK, SEND TOKEN TO CLIENT
    sendJWTToken(doc, 201, res);
});

exports.logOut = () => catchAsync( async ( req, res, next ) => {
    console.log(res)
    res.clearCookie("jwt").json({
        status: "success",
        message : "Logged out successfully!"
    })
});

exports.updateProfile = Model => catchAsync( async (req, res, next) => {
    try{
        const { profilePic } = req.body;
        const userId = req.user._id;

        if(!profilePic) return next(new AppError("Profile pic is required"), 400, res);
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await Model.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json({
            success: true,
            data: updatedUser,
            message:"User profile updated successfully",
        })
    }catch(err){
        console.log("err");
        return next(new AppError("Internal server error", 500, res))
    }
})

exports.protect = Model => catchAsync( async (req, res, next) => {
    // GETTING TOKEN AND CHECK IF IT IS PRESENT
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token) return next(new AppError("You are not logged in! Please log in to get access", 401));

    // TOKEN VERIFICATION
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // CHECK IF USER STILL EXISTS
    const currentDoc = await Model.findById(decoded.id);
    if(!currentDoc){
        return next(new AppError("The user belonging to this token does no longer exist", 401))
    }

    // CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if(currentDoc.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User recently changed password! Please log in again.", 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentDoc;
    next();
});