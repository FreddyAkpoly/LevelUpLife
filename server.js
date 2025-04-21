const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
require('dotenv').config();
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60
    }
}));

const questsRoutes = require("./public/routes/quests");
const statusRoutes = require("./public/routes/stats");
const userRoutes = require("./public/routes/users");
const authRoutes = require("./public/routes/auth");

app.use("/", questsRoutes);
app.use("/api/quests", questsRoutes);
app.use("/api/quest_status", questsRoutes);
app.use("/api/quest_status/complete_quest", questsRoutes);

app.use("/", statusRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/status/:stat/:new_value", statusRoutes);

app.use("/", userRoutes);
app.use("/login", userRoutes);
app.use("/register", userRoutes);
app.use("/api/login/:username/:password", userRoutes);
app.use("/api/register/:username/:password", userRoutes);
app.use("/api/register/:username", userRoutes);
app.use("/api/username", userRoutes);

app.use("/", authRoutes);
app.use("/api/auth/:username/:password", authRoutes);
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});
