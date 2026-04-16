const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.json());

// HOME ROUTE
app.get("/", (req, res) => {
    res.send("PrintToHome backend is running 🚀");
});

// STORAGE CONFIG FOR FILES
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// CREATE UPLOAD FOLDER SAFELY
const fs = require("fs");
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// UPLOAD API
app.post("/upload", upload.single("file"), (req, res) => {
    try {
        res.json({
            message: "File uploaded successfully",
            file: req.file
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SAMPLE ORDERS ROUTE
app.get("/orders", (req, res) => {
    res.json([
        {
            id: 1,
            name: "Sample Order",
            pages: 10,
            status: "Processing"
        }
    ]);
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});