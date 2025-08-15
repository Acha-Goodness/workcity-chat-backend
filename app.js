const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());

// IMPLEMENT CORS
const corsOptions = {
  origin: ["http://localhost:5173", "https://yourfrontend.com"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(cookieParser());

// CHECKING FOR CURRENT ENVIROMENT
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
    console.log("My application is currently on", process.env.NODE_ENV)
}

// ENDPOINT ROUTING BY MOUNTING e.g Mounting the router
app.use("/api/v1/users", userRouter);


module.exports = app;