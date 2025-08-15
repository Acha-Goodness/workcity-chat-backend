const User = require("../Models/userModel");
const AppError = require("../Utils/appFeatures");
const { createOTP } = require("../Utils/appFeatures");
const catchAsync = require("../Utils/catchAsync");
const Email = require("../Utils/email");


exports.userSignUp = catchAsync( async (req, res, next) => {
    const { userName, email, password, confirmPassword } = req.body;

    const checkUser = await User.findOne({ email });
    if(checkUser) return next(new AppError("This email has already been used, Please use a different email", 400, res));

    let newUser;
    try{
          newUser = await User.create({
            name : userName, 
            email, 
            password, 
            passwordConfirm : confirmPassword
        });

        const OTPToken = await createOTP(newUser);
        await newUser.save({ validateBeforeSave: false });

    
        await new Email(newUser, OTPToken).sendOTPEmail();

        res.status(200).json({
            status:"success",
            message: "OTP sent to email"
        })
    }catch(err){
         if (newUser) {
            newUser.otpToken = undefined;
            newUser.otpExpires = undefined;
            await newUser.save({ validateBeforeSave: false });
        }

        // Check for Mongoose validation error
        if(err.name === "ValidationError"){
            // Extract the passwordConfirm error message if present
            const errors = Object.values(err.errors).map(el => el.message);
            return next(new AppError(errors.join('. '), 500, res))
        }

        // Hnadle other errors
        res.status(500).json({
            status:"error",
            message: err.message
        });
    }
})