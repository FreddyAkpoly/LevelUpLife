window.addEventListener("load", () => {
   
    createSession();
    async function createSession() {
        try {
            fetch('/api/auth', {
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
