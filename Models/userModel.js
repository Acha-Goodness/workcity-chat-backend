const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter your name"]
    },
    email:{
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    role:{
        type: String,
        default: "user"
    },
    password:{
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    passwordConfirm:{
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            // THIS ONLY WORKS ON CREATE AND SAVE
            validator: function(el){
                return el === this.password
            },
            message: "password are not the same!"
        }
    },
    profile: {
        type: String,
        default: ""
    },
    active:{
        type: Boolean,
        default: false,
        select: false
    },
    passwordChangedAt: Date,
    otpToken: String,
    otpExpires: Date,
});

// ENCRYPTING/HASHING USERS PASSWORD
userSchema.pre("save", async function(next){
    // checking if password was modified
    if(!this.isModified("password")) return next();

    // if true then encrypt password
    this.password = await bcrypt.hash(this.password, 12);

    // delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;