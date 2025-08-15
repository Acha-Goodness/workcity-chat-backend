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