window.addEventListener("load", () => {
    document.getElementById("submit").onclick = async function () {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            return; // Stop execution
        }

        const username_available = await check_username(username);
        if (username_available) {
            const add_user = await register(username, password);
        }
        else{
            console.log("username taken");
        }
    };

    async function check_username(username) {
        const check_if_username_available = await fetch(`/api/register/${username}`);
        const username_is_available = await check_if_username_available.json();
        return username_is_available;
    }

    async function register(username, password) {
        fetch(`/api/register/${username}/${password}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password_hash: password
            })
        })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
            })
            .catch(error => {
                console.error('Error during PUT request:', error);
            });

    }

    async function get_user_id(username) {

    }
});
