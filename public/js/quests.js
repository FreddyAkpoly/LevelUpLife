window.addEventListener("load", () => {
  const date = new Date();
  let quest_id = new Date().getDate() + 90000;
  //let quest_id = 3;
  const formattedDate = date.toDateString();
  let todays_quest_type;
  document.getElementById("time").innerText = formattedDate;
  const pathParts = window.location.pathname.split('/');
  const userID = pathParts[pathParts.length - 1];

  document.getElementById("complete_quest").onclick = async function () {
    if (await get_quest_status(userID, quest_id)) {
      console.log("YOU'VE COMPLETED TODAYS QUEST");
    }
    else {
      const currentStat = await get_current_stat(userID, todays_quest_type);
      if (currentStat !== null) {
        complete_quest(userID, todays_quest_type, currentStat + 1);
        update_complete_quest(userID, quest_id);

      }
    }

  };

  document.getElementById("view_status").onclick = async function () {
    window.location.href = `/status`;
  };

  // document.getElementById("back_to_login").onclick = async function () {
  //   window.location.href = `/`;
  // };

  fetch(`/api/quests/${quest_id}`)
    .then(response => response.json())
    .then(data => {
      if (data) {
        document.getElementById("mission").innerText = data.description || "Unnamed Quest";
        todays_quest_type = data.quest_type ? data.quest_type : 'default';
      } else {
        document.getElementById("mission").innerText = "No quest found for today";
      }
    })
    .catch(error => {
      console.error("Error fetching quest:", error);
      document.getElementById("mission").innerText = "Failed to load quest";
    });

  const complete_quest = (userId, stat, new_value) => {
    fetch(`/api/status/${userId}/${stat}/${new_value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        [stat]: new_value
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
  };

  const get_current_stat = async (stat) => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      if (data != null) {
        console.log(data[0][stat]);
        return data[0][stat];
      } else {
        console.warn("User not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const get_quest_status = async (questID) => {
    try {
      const response = await fetch(`/api/quest_status/${questID}`);
      const data = await response.json();
      const quests = data.completed;
      console.log("Full quest_status object:", quests);

      if (quests) {
        console.log("Quest status on this date:", quests);
        return quests;
      } else {
        console.log("No quest data for this date.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching completed quests:", error);
      return null;
    }
  };

  const update_complete_quest = (quest_id) => {
    console.log(`Updating quest: userId=${userId}, quest_id=${quest_id}`);

    fetch(`/api/quest_status/complete_quest/${quest_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
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
  };

});
