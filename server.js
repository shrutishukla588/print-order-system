const express = require("express");
const app = express();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("PrintToHome backend is running 🚀");
});

// Temporary orders route
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