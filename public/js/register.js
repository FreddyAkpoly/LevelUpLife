window.addEventListener("load", () => {
    document.getElementById("submit").onclick = async function () {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            return;
        }

        const username_available = await check_username(username);
        if (username_available) {
            const user_created = await register(username, password);
           if(user_created){
            window.location.href = `/login`
           }
        }
        else{
          
        }
    };

    async function check_username(username) {
        const check_if_username_available = await fetch(`/api/register/${username}`);
        const username_is_available = await check_if_username_available.json();
        return username_is_available;
    }

    async function register(username, password) {
        try {
            const response = await fetch(`/api/register/${username}/${password}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password_hash: password
                })
            });
            console.log('Response status:', response.status);
            if (!response.ok) {
                console.error('Registration failed:', response.statusText);
                return false;
            }
            const data = await response.json();
            console.log('Response data:', data);
            return true; 
        } catch (error) {
            console.error('Error during PUT request:', error);
            return false;
        }
    }    

});
