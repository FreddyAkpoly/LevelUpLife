window.addEventListener("load", () => {
    document.getElementById("submit").onclick = async function () {

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            return; 
        }

        const success = await login(username, password);

        if (success) {
            createSession(username, password);
            window.location.href = `/`;
        } else {
        }
    };

    async function login(username, password) {
        try {
            const response = await fetch(`/api/login/${username}/${password}`);
            const data = await response.json();
            return data === true; 
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }

    async function createSession(username, password) {
        try {
            fetch(`/api/auth/${username}/${password}`, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                }
              });
        } catch (error) {
            return null;
        }
    }
});
