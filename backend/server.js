const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const mysqlpool = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const eventRoutes=require("./routes/eventRoutes")
const eventParticipationRouter =require("./routes/eventParticipationRoutes")
const eventScoresRoutes=require("./routes/eventScoresRoutes")
const notificationRoutes=require("./routes/notificationRoutes")
const studentRoutes=require('./routes/studentRoutes')
const teamRoutes = require('./routes/teamRoutes');
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api',eventParticipationRouter)
app.use('/api/v1/hostels', require("./routes/hostel"));
app.use('/api/eventScores',eventScoresRoutes)
app.use('/api/notification',notificationRoutes)
app.use('/api/students/',studentRoutes)
app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => res.send("API is running ....."));

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

