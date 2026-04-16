const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
app.use(express.json());

let orders = []; // ✅ FIX 1

// PRICE FUNCTION
function calculatePrice(pages) {
    return pages * 2;
}

// SHOPS
const shops = [
    { id: 1, name: "Shop A", lat: 17.3850, lng: 78.4867 },
    { id: 2, name: "Shop B", lat: 17.4500, lng: 78.3800 }
];

// DISTANCE FUNCTION
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findNearestShop(userLat, userLng) {
    let nearest = null;
    let min = Infinity;

    shops.forEach(shop => {
        const dist = getDistance(userLat, userLng, shop.lat, shop.lng);
        if (dist < min) {
            min = dist;
            nearest = shop;
        }
    });

    return nearest;
}

// HOME
app.get("/", (req, res) => {
    res.send("PrintToHome backend is running 🚀");
});

// STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// CREATE UPLOAD FOLDER
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// UPLOAD
app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ message: "Uploaded", file: req.file });
});

// ORDERS (FIXED)
app.get("/orders", (req, res) => {
    res.json(orders);
});

// PAGE COUNT (FIXED)
app.post("/page-count", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);

        const pages = pdfData.numpages;
        const price = calculatePrice(pages);

        res.json({
            pages,
            pricePerPage: 2,
            totalPrice: price
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ASSIGN SHOP
app.post("/assign-shop", (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Location required" });
    }

    const shop = findNearestShop(parseFloat(lat), parseFloat(lng));

    res.json({
        message: "Nearest shop assigned",
        shop
    });
});

// CREATE ORDER
app.post("/create-order", upload.single("file"), async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!req.file) return res.status(400).json({ error: "File required" });
        if (!lat || !lng) return res.status(400).json({ error: "Location required" });

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);

        const pages = pdfData.numpages;
        const totalPrice = calculatePrice(pages);

        const shop = findNearestShop(parseFloat(lat), parseFloat(lng));

        const order = {
            id: orders.length + 1,
            filename: req.file.filename,
            pages,
            totalPrice,
            shop,
            status: "Pending"
        };

        orders.push(order);

        res.json({
            message: "Order created successfully",
            order
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});