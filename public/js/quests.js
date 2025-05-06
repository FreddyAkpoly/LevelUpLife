window.addEventListener("load", () => {
  const date = new Date();

  const formattedDate = date.toDateString();
  let todays_quest_type;
  document.getElementById("time").innerText = formattedDate;

  // Initialize status modal
  const statusModal = document.getElementById('status-modal');
  const notificationModal = document.getElementById('notification-modal');

  const viewStatusBtn = document.getElementById('view_status');
  const closeBtn = document.querySelector('.close-btn');
  const notificationCloseBtn = document.querySelector('.notification-close-btn');

  // Show status modal
  viewStatusBtn.addEventListener('click', () => {
    // First set display to flex
    statusModal.style.display = 'flex';
    // Force a reflow to ensure the display change takes effect
    statusModal.offsetHeight;
    // Then remove hidden class to trigger animation
    requestAnimationFrame(() => {
      statusModal.classList.remove('hidden');
    });
    updateStatus();
  });

  // Close status modal
  closeBtn.addEventListener('click', () => {
    statusModal.classList.add('hidden');
    // Wait for transition to complete before hiding
    setTimeout(() => {
      statusModal.style.display = 'none';
    }, 500); // Match the CSS transition duration
  });

    // Close status modal
    notificationCloseBtn.addEventListener('click', () => {
      notificationModal.classList.add('hidden');
      // Wait for transition to complete before hiding
      setTimeout(() => {
        notificationModal.style.display = 'none';
      }, 500); // Match the CSS transition duration
    });

  // Close modal when clicking outside
  statusModal.addEventListener('click', (e) => {
    if (e.target === statusModal) {
      statusModal.classList.add('hidden');
      // Wait for transition to complete before hiding
      setTimeout(() => {
        statusModal.style.display = 'none';
      }, 500); // Match the CSS transition duration
    }
  });

  notificationModal.addEventListener('click', (e) => {
    if (e.target === notificationModal) {
      notificationModal.classList.add('hidden');
      // Wait for transition to complete before hiding
      setTimeout(() => {
        notificationModal.style.display = 'none';
      }, 500); // Match the CSS transition duration
    }
  });

  // Update status function
  async function updateStatus() {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      if (data && data.length > 0) {
        const user = data[0];
        const stats = ["Creativity", "Health", "Food", "Mental", "Social"];

        stats.forEach(stat => {
          const value = user[stat];
          document.getElementById(`${stat}_value`).textContent = `${value}%`;
          document.getElementById(`${stat}_bar`).style.width = `${value}%`;
        });
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }

  setTimeout(() => {
    notificationModal.classList.add('hidden');
    setTimeout(() => {
      notificationModal.style.display = 'none';
    }, 300); // Allow time for transition if you have one
  }, 3000); // Closes after 3 seconds (3000ms)
  

  document.getElementById("complete_quest").onclick = async function () {
    const modalBody = document.querySelector("#notification-modal .modal-body");
  
    if (await get_quest_status()) {
      modalBody.textContent = "You've already completed today's quest.";
    } else {
      const currentStat = await get_current_stat(todays_quest_type);
      if (currentStat !== null) {
        complete_quest(todays_quest_type, currentStat + 1);
        update_complete_quest();
        if (!statusModal.classList.contains('hidden')) {
          updateStatus();
        }
      }
      modalBody.textContent = "You've completed today's quest!";
    }
  
    notificationModal.style.display = 'flex';
    notificationModal.offsetHeight;
    requestAnimationFrame(() => {
      notificationModal.classList.remove('hidden');
    });
  
    // Auto-close after 3 seconds
    setTimeout(() => {
      notificationModal.classList.add('hidden');
      setTimeout(() => {
        notificationModal.style.display = 'none';
      }, 300); // delay allows transition to complete if present
    }, 3000);
  };
  
  

  document.getElementById("view_status").onclick = async function () {
    statusModal.classList.remove('hidden');
    updateStatus();
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

  //   function updateXPBar(currentXP, maxXP) {
  //   const fill = document.querySelector('.xp-bar-fill');
  //   const label = document.querySelector('.xp-label');
  //   const percent = Math.min((currentXP / maxXP) * 100, 100);

  //   fill.style.width = percent + '%';
  //   label.textContent = `${currentXP} XP / ${maxXP} XP`;
  // }




});
