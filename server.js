const mongoose = require("mongoose");
const dotenv = require("dotenv");

// HANDLING UNCAUGHT EXCEPTION
process.on("uncaughtException", err => {
    console.log("UNCAUGHT EXCEPTION! Shutting down..");
    console.log(err);
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config({path: "./config.env"});
const app = require("./app");

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB)
.then(con => {
    console.log("DB CONNECTION SUCCESSFUL")
}).catch(err => {
    console.error(err);
})

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}...`)
});

// HANDLING UNHANDLED REJECTION
process.on("unhandledRejection", err => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err);
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});