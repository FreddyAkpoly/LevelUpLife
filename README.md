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

## 🖥️ Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-grey?logoColor=white)


## 🗄️ Database
![TiDB](https://img.shields.io/badge/TiDB-FF3E00?logo=mysql&logoColor=white) *(MySQL-compatible)*

## 🔐 Auth
![Express Session](https://img.shields.io/badge/express--session-000000?logo=express&logoColor=white)
![Cookies](https://img.shields.io/badge/Encrypted%20Cookies-8A2BE2?logo=cookiecutter&logoColor=white)


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
