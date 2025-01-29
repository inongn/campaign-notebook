// Creature Management
// Populate the creature list in the UI
function populateCreatures(encounter) {
  
  const creatures = encounter.creatures; // Operate on the creatures of the specific encounter
  const creaturesList = document.getElementById("creatures-list");
  creaturesList.innerHTML = "";

  const creaturesListDiv = document.getElementById("creatures-list-div");
  const statblockDiv = document.getElementById("statblock");
  const isEditMode = document.getElementById("edit-mode-toggle").checked;

  // Hide list and statblock if no creatures and edit mode is off
  if (creatures.length === 0 && !isEditMode) {
    creaturesListDiv.style.display = "none";
    statblockDiv.style.display = "none";
    return;
  }

  
  // Show list and statblock
  creaturesListDiv.style.display = "block";
  statblockDiv.style.display = "block";

  creatures.forEach((creature, creatureIdx) => {
    const creatureItem = document.createElement("li");
    creatureItem.textContent = creature.name;
    creatureItem.addEventListener("click", () => populateStatblock(creature, encounter));

      const removeButton = document.createElement("i");
      removeButton.classList.add("fas", "fa-trash", "edit-mode");
      removeButton.style.color = "red";
      removeButton.style.marginLeft = "10px";
      removeButton.style.cursor = "pointer";

      removeButton.addEventListener("click", () => deleteCreature(creature, encounter, creatureIdx));
      creatureItem.appendChild(removeButton);

    // Add "Roll Initiative" button
    const rollButton = document.createElement("i");
    rollButton.classList.add("fas", "fa-dice-d20");
    rollButton.style.color = "blue";
    rollButton.style.marginLeft = "10px";
    rollButton.style.cursor = "pointer";

    rollButton.addEventListener("click", () => {
      addCreatureToInitiative(creature);
    });

    creatureItem.appendChild(rollButton);
    creaturesList.appendChild(creatureItem);
  });

    // Add "New Creature" button
    const addCreatureButton = document.createElement("i");
    addCreatureButton.classList.add("fas", "fa-plus", "edit-mode", "hidden");
    addCreatureButton.style.color = "green";
    addCreatureButton.style.cursor = "pointer";
    addCreatureButton.style.textAlign = "center";
    addCreatureButton.style.marginLeft = "10px";

    addCreatureButton.addEventListener("click", () => showAddCreatureField(encounter));
    creaturesList.appendChild(addCreatureButton);    
    toggleEditMode(isEditMode);

  }

  function showAddCreatureField(encounter) {
    saveState();

    const creaturesList = document.getElementById("creatures-list");
    const addCreatureContainer = document.createElement("div");
    addCreatureContainer.innerHTML = `
      <input type="text" placeholder="New Creature Name" id="new-creature-name">
  <button id="confirm-add-creature" class="icon-btn check">
  <i class="fas fa-check"></i>
  </button>
    `;
    creaturesList.appendChild(addCreatureContainer);
  
    const confirmAddCreatureBtn = document.getElementById(`confirm-add-creature`);
    confirmAddCreatureBtn.addEventListener("click", () => {
      const newCreatureName = document.getElementById(`new-creature-name`).value;

      creaturePos = encounter.creatures.push({
        name: newCreatureName,
        hp: 10, // Default HP
        ac: 10, // Default AC
        initiative: 0,
        ability_scores:{
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        },
        ability_score_modifiers: {
          STR: 0,
          DEX: 0,
          CON: 0,
          INT: 0,
          WIS: 0,
          CHA: 0,
        },
        features: [],
        actions: [],
    });
      saveAllNotebooks(); // notebook.js
      populateCreatures(encounter);
      populateStatblock(encounter.creatures[creaturePos-1], encounter);
      showNotification(`Creature "${newCreatureName}" added successfully.`); // ui-helpers.js
  
    });
  }

// Delete a location and its associated encounters
function deleteCreature(creature, encounter, creatureIdx) {
  saveState();

  encounter.creatures.splice(creatureIdx, 1); // Remove the location
  saveAllNotebooks(); // notebook.js
  populateLocations(); // Refresh the UI with the updated locations
  populateCreatures(encounter);
  showNotification(`Creature "${creature.name}" deleted successfully.`); // ui-helpers.js
}

function addCreatureToInitiative(creature) {
  saveState();

  const roll = Math.floor(Math.random() * 20) + 1; // Roll a d20
  const modifier = creature.initiative || 0; // DEX modifier
  const initiative = roll + modifier;

  // Show the initiative roll in the dice roller popup
  showPopup(`Initiative Roll: d20 (${roll}) + (${modifier}) = ${initiative}`);

  // Add the creature to the tracker
  addRow({
    name: creature.name,
    initiative: initiative,
    hp: creature.hp,
    ac: creature.ac
  });

  showNotification(`Added ${creature.name} to the initiative tracker.`);
}

