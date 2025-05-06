const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysqlpool = require("./config/db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/hostels',require("./routes/hostel"))

app.get('/', (req, res) => res.send("API is running ....."));

app.get('/test', async (req, res) => {
    try {
        const [rows] = await mysqlpool.query("SELECT 1");
        res.json({ message: "This is a test route!", db: rows });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err });
    }
});

// Start server after confirming DB connection
mysqlpool.query("SELECT 1").then(() => {
    console.log("MySQL DB is connected .....");

    const PORT = process.env.PORT || 5050;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Database connection failed:", error);
});
