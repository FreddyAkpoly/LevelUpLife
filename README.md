# 📘 Project: LevelUpLife

This is a personal productivity web application inspired by [LevelUpLife](https://leveluplife.onrender.com), which recently went offline. The goal is to recreate and improve upon its core functionality with proper security practices and modern technologies.

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript
- **Database**: MySQL

---

## 📂 Backend Structure

### `server.js`

Handles the core server logic and routes.

---

## 🔐 User Authentication (To-Do)

Currently, user data is retrieved using an `id` parameter in the URL. This is insecure, as anyone can modify the URL to access and modify other users’ data.

### ❌ Current (Insecure) Behavior

```js
// Example: site.com/user/3
// This URL reveals and modifies user 3's data, regardless of who is logged in.
```

### ✅ To-Do: Secure Authentication with Sessions

Implement user sessions so that:

- Only logged-in users can access their own data.
- The server tracks users via sessions, not URL parameters.

---

## ❓ Understanding `express-session`

```js
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));
```

### Explanation:

| Option             | Description |
|--------------------|-------------|
| `secret`           | A string used to sign the session ID cookie. Keep this secret and strong in production. |
| `resave`           | `false` means session won’t be saved back to the store unless modified. |
| `saveUninitialized`| `false` means don't create sessions for unauthenticated users. |
| `cookie.secure`    | If `true`, cookies are only sent over HTTPS. Set to `true` in production with HTTPS. |

---

## ✅ Best Practice Goals

- Use sessions to track authenticated users.
- Avoid exposing sensitive data through URLs.
- Store user IDs and auth states in the session.

---

## 📌 Next Steps

1. Implement login/logout logic with sessions.
2. Restrict access to user data by session.
3. Encrypt passwords using `bcrypt`.

---
