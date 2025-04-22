window.addEventListener("load", () => {
  const date = new Date();
  
  const formattedDate = date.toDateString();
  let todays_quest_type;
  document.getElementById("time").innerText = formattedDate;
  

  document.getElementById("complete_quest").onclick = async function () {
    if (await get_quest_status()) {
      console.log("YOU'VE COMPLETED TODAYS QUEST");
    }
    else {
      const currentStat = await get_current_stat(todays_quest_type);
      if (currentStat !== null) {
        complete_quest(todays_quest_type, currentStat + 1);
        update_complete_quest();
        updateXPBar(10, 300);
      }
    }

  };

  document.getElementById("view_status").onclick = async function () {
    window.location.href = `/status`;
  };

  fetch(`/api/quests`)
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

    fetch(`/api/username`)
    .then(response => response.json())
    .then(data => {
      if (data) {
        document.getElementById("username").innerText = "Welcome " + data[0].username || "Unnamed user";
      } else {
        document.getElementById("mission").innerText = "No username found";
      }
    })
    .catch(error => {
      console.error("Error fetching username:", error);
    
    });

  const complete_quest = (stat, new_value) => {
    fetch(`/api/status/${stat}/${new_value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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

  const get_quest_status = async () => {
    try {
      const response = await fetch(`/api/quest_status`);
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

  const update_complete_quest = () => {
 
    fetch('/api/quest_status/complete_quest', {
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

  function updateXPBar(currentXP, maxXP) {
  const fill = document.querySelector('.xp-bar-fill');
  const label = document.querySelector('.xp-label');
  const percent = Math.min((currentXP / maxXP) * 100, 100);
  
  fill.style.width = percent + '%';
  label.textContent = `${currentXP} XP / ${maxXP} XP`;
}




});
