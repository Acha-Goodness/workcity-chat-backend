
const express = require("express");
const { userProtector } = require("../Controllers/userController");
const { getUsersForSidebar, getMessages, sendMessage } = require("../Controllers/messageController");

const router = express.Router();

router.get("/users", userProtector, getUsersForSidebar);
router.get("/:id", userProtector, getMessages);
router.post("/send/:id", userProtector, sendMessage);

module.exports = router;
sendMessage