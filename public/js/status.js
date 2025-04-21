window.addEventListener("load", () => {
  const pathParts = window.location.pathname.split('/');
  const userID = pathParts[pathParts.length - 1];

  document.getElementById("view_quests").onclick = async function () {
    window.location.href = `/`;
  };

  fetch('/api/status')
    .then(response => response.json())
    .then(data => {
      console.log("Received User data:", data);
      if (data.length != null) {
        const user = data[0];

        const setStat = (stat) => {

          document.getElementById(`${stat}_bar`).style.width = `${user[stat]}%`;
          document.getElementById(`${stat}_value`).textContent = `${user[stat]}%`;

        };

        ["Creativity", "Health", "Food", "Mental", "Social"].forEach(setStat);
      }
    })
    .catch(error => {
      console.error("Error fetching user:", error);
    });
});
