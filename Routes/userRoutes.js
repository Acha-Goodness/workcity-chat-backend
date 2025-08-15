const express = require("express");
const { userSignUp, userVerifyOTP, userLogin, userForgetPassword, userResetPassword, userLogout, userCheckAuth } = require("../Controllers/userController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/userVerifyOTP", userVerifyOTP);
router.post("/userLogin", userLogin);
// router.post("/userForgotPassword", userForgetPassword);
// router.post("/userResetPassword", userResetPassword);
// router.post("/logout", userLogout);
// router.get("/check-auth", userCheckAuth);

module.exports = router;