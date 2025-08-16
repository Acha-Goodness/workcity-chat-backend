const express = require("express");
const { userSignUp, userVerifyOTP, userLogin, userForgetPassword, userResetPassword, userLogout, userCheckAuth, userProtector } = require("../Controllers/userController");
const { updateProfile } = require("../Controllers/handlerFactory");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/userVerifyOTP", userVerifyOTP);
router.post("/userLogin", userLogin);
router.post("/logout", userLogout);
router.put("/update-profile", userProtector, updateProfile)
// router.post("/userForgotPassword", userForgetPassword);
// router.post("/userResetPassword", userResetPassword);

// router.get("/check-auth", userCheckAuth);

module.exports = router;