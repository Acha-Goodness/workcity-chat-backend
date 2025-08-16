
const express = require("express");
const { userProtector } = require("../Controllers/userController");
const { getUsersForSidebar } = require("../Controllers/messageController");


const router = express.Router();

router.get("/users", userProtector, getUsersForSidebar );
router.get("/:id", userProtector, getMessages);

export default router;