window.addEventListener("load", () => {
  const date = new Date();
  let QuestDate = new Date().getDate() - 1;
  const formattedDate = date.toDateString();
  let todays_quest_type;
  document.getElementById("time").innerText = formattedDate;
const pathParts = window.location.pathname.split('/');
const userID = pathParts[pathParts.length - 1];

  document.getElementById("complete_quest").onclick = async function () {
    if(await get_quest_status(userID)){
      console.log("YOU'VE COMPLETED TODAYS QUEST");
    }
    else{
      const currentCreativity = await get_creativity_stat(userID - 1, todays_quest_type);
    if (currentCreativity !== null) {
      complete_quest(userID,todays_quest_type, currentCreativity + 1);
      update_complete_quest(userID,QuestDate+1);

    }
    }
    
  };

  document.getElementById("view_status").onclick = async function () {
    window.location.href = `/status/${userID}`;
  };

  document.getElementById("back_to_login").onclick = async function () {
    window.location.href = `/`;
  };


  fetch('/api/quests')
    .then(response => response.json())
    .then(data => {
      //console.log("Received quest data:", data);
      if (data.length > 0 && data[QuestDate]) {
        document.getElementById("mission").innerText = data[QuestDate].quest_description || "Unnamed Quest";
        todays_quest_type = data[QuestDate].quest_type.toLowerCase();
      } else {
        document.getElementById("mission").innerText = "No quests found";
      }
    })
    .catch(error => {
      console.error("Error fetching quests:", error);
      document.getElementById("mission").innerText = "Failed to load quest";
    });

  fetch('/api/quests')
    .then(response => response.json())
    .then(data => {
      //console.log("Received quest data:", data);

      if (data.length > 0 && data[QuestDate]) {
        document.getElementById("mission_type").innerText = `${data[QuestDate].quest_type}:` || "Unnamed Type";
      } else {
        document.getElementById("mission_type").innerText = "No quests found";
      }
    })
    .catch(error => {
      console.error("Error fetching quest type:", error);
      document.getElementById("mission_type").innerText = "Failed to load quest type";
    });


  const complete_quest = (userId, stat, new_value) => {
    fetch(`/api/status/${stat}`, {
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

  const get_creativity_stat = async (userId, stat) => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      if (data.length > 0 && data[userId]) {
        console.log(data[userId][stat]);
        return data[userId][stat];
      } else {
        console.warn("User not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const get_quest_status = async (userID) => {
    try {
      const response = await fetch(`/api/quest_status/${userID}`);
      const data = await response.json();
      const quests = data.quest_status;
      console.log("Full quest_status object:", quests);
  
      const dayKey = (QuestDate + 1).toString();
      if (quests && quests[dayKey] !== undefined) {
        console.log("Quest status on this date:", quests[dayKey]);
        return quests[dayKey];
      } else {
        console.log("No quest data for this date.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching completed quests:", error);
      return null;
    }
  };  

  const update_complete_quest = (userId, day) => {
    console.log(`Updating quest: userId=${userId}, day=${day}`);
    
    fetch(`/api/quest_status/complete_quest/${userId}/${day}`, {
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
