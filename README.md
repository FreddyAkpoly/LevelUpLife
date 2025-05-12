# 🌱 Level Up Life – Gamified Goal Tracker

A full-stack web app inspired by [LevelUpLife.com](https://realityquest-4dc7abdad920.herokuapp.com) that gamifies personal development. Users earn experience points (XP), level up, and track real-life progress through completed tasks and goals.

---

## 🚀 Features

- ✅ Account registration and secure session-based login  
- 📘 Task logging with XP rewards and leveling system  
- 📊 Real-time dashboard to view XP, level, and progress  
- 🔐 Session authentication with secure access control  
- ⚡ Responsive front-end built with vanilla JavaScript, HTML, and CSS  
- 🌐 RESTful API with structured SQL queries and cloud-based data storage  

---

## 🧰 Tech Stack

**Frontend:**
- HTML
- CSS
- JavaScript (Vanilla)

**Backend:**
- Node.js
- Express

**Database:**
- TiDB Cloud (MySQL-compatible distributed SQL)

**Auth:**
- Express-session with encrypted cookies

---

## 🗂 Project Structure

```
/server
  ├── server.js            # Entry point for backend
  ├── routes/              # All API routes
  ├── models/              # SQL queries and logic
  └── middleware/          # Auth and session control

/public
  ├── index.html
  ├── dashboard.html
  └── styles.css

/scripts
  └── main.js              # Frontend logic and fetch calls
```

---

## 📌 Key Endpoints

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| GET    | `/dashboard`         | Returns user stats & activities    |
| POST   | `/login`             | Logs user in via session cookies   |
| POST   | `/register`          | Creates a new user account         |
| POST   | `/task/complete`     | Awards XP for completed task       |
| GET    | `/logout`            | Logs out and destroys session      |

---

## 🔐 Authentication Flow

- Session-based login via `express-session`
- Secure cookies for maintaining login state
- Protected routes for all dashboard and XP features

---

 **Visit:** `[http://leveluplife.onrender.com/](https://realityquest-4dc7abdad920.herokuapp.com)`

---

## 🧠 Future Plans

- Add daily/weekly quests
- Implement achievements and badges
- Track long-term streaks and milestones
- Polish UI with a modern front-end framework (React/Vue)

---

## 👤 Author

**Freddy Akpoly**  
Developer  
---
