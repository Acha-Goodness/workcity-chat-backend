const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.createOTP = async ( operator ) => {
    const OTP = crypto.randomBytes(2).toString("hex");
    operator.otpToken = crypto.createHash("sha256").update(OTP).digest("hex");

    operator.otpExpires = Date.now() + 10 * 60 * 1000;
    return OTP
};

const jwtAuthToken = (operator) => {
    const {_id, name, email, role } = operator;
    return jwt.sign({ _id, name, email, role}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.sendJWTToken = ( operator, statusCode, res ) => {
    const JWTToken = jwtAuthToken(operator);

    // Cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" // send only over HTTPS in production
    };

    res.cookie("jwt", JWTToken, cookieOptions);

    operator.password = undefined;

    res.status(statusCode).json({
        status: "success",
        JWTToken: JWTToken,
        message: "Login successful",
        user:operator
    })
};

exports.correctPassword = async function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword, userPassword)
}