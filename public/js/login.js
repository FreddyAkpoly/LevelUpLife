window.addEventListener("load", () => {
    document.getElementById("submit").onclick = async function () {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            return; // Stop execution
        }

        const success = await login(username, password);
        console.log("Login successful:", success);

        if (success) {
            const user_id = await get_user_id(username);
            window.location.href = `/quests/${user_id}`;
        } else {
        }
    };

    async function login(username, password) {
        console.log(`Logging in: username=${username}, password=${password}`);
        try {
            const response = await fetch(`/api/login/${username}/${password}`);
            const data = await response.json();
            return data === true; // Ensures a strict boolean
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }

    async function get_user_id(username) {
        try {
            const response = await fetch(`/api/login/${username}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Get user ID error:", error);
            return null;
        }
    }
});
