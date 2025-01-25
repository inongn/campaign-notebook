// creatures.js

// Populate the creature list in the UI
function populateCreatures(creatures) {
    const creaturesList = document.getElementById("creatures-list");
    creaturesList.innerHTML = "";
  
    const creaturesListDiv = document.getElementById("creatures-list-div");
    const statblockDiv = document.getElementById("statblock");
    const isEditMode = document.getElementById("edit-mode-toggle").checked; // Check if edit mode is on
    const addCreatureContainer = document.getElementById("add-creature-container");
    const newCreatureNameInput = document.getElementById("new-creature-name");
    const confirmAddCreatureBtn = document.getElementById("confirm-add-creature");
  
    // Hide the list and statblock if no creatures are present and edit mode is off
    if (creatures.length === 0 && !isEditMode) {
      creaturesListDiv.style.display = "none";
      statblockDiv.style.display = "none";
      addCreatureContainer.classList.add("hidden");
      return;
    }
  
    // Show the list and statblock
    creaturesListDiv.style.display = "block";
    statblockDiv.style.display = "block";
  
    creatures.forEach((creature, creatureIdx) => {
      const creatureItem = document.createElement("li");
      creatureItem.textContent = creature.name;
      creatureItem.addEventListener("click", () => displayCreature(creature));
  
      if (isEditMode) {
        // Add a remove button for each creature
        const removeButton = document.createElement("i");
        removeButton.classList.add("fas", "fa-trash", "edit-mode");
        removeButton.style.color = "red";
        removeButton.style.marginLeft = "10px";
        removeButton.style.cursor = "pointer";
        
        removeButton.addEventListener("click", () => {
          creatures.splice(creatureIdx, 1); // Remove the creature
          populateCreatures(creatures); // Refresh the list
          saveNotebooksToLocalStorage(); // Save changes
        });
        creatureItem.appendChild(removeButton);
      }
  
      // Add a "Roll Initiative" button
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
  
    if (isEditMode) {
      // Add "New Creature" button
      const addCreatureButton = document.createElement("i");
      addCreatureButton.classList.add("fas", "fa-plus");
      addCreatureButton.style.color = "green";
      addCreatureButton.style.cursor = "pointer";
      addCreatureButton.style.textAlign = "center";
      addCreatureButton.style.marginLeft = "10px";
      
      addCreatureButton.addEventListener("click", () => {
        addCreatureContainer.classList.remove("hidden"); // Show the container
        newCreatureNameInput.focus(); // Focus the input field
      });
  
      creaturesList.appendChild(addCreatureButton);
  
      confirmAddCreatureBtn.addEventListener("click", () => {
        const newCreatureName = newCreatureNameInput.value.trim();
        if (newCreatureName) {
          creatures.push({
            name: newCreatureName,
            hp: 10, // Default HP
            ac: 10, // Default AC
            ability_score_modifiers: {
              STR: 0,
              DEX: 0,
              CON: 0,
              INT: 0,
              WIS: 0,
              CHA: 0
            },
            features: [],
            actions: [],
            legendary_actions: []
          });
          newCreatureNameInput.value = ""; // Clear the input
          addCreatureContainer.classList.add("hidden"); // Hide the container
          populateCreatures(creatures); // Refresh the list
          saveNotebooksToLocalStorage(); // Save changes
          showNotification(`Creature "${newCreatureName}" added.`);
        } else {
          showNotification("Please enter a valid creature name.");
        }
      });
    }
  }
  
  // Add a creature to the initiative tracker
  function addCreatureToInitiative(creature) {
    console.log("Hello");
    const roll = Math.floor(Math.random() * 20) + 1; // Roll a d20
    const modifier = creature.ability_score_modifiers.DEX || 0; // DEX modifier
    const initiative = roll + modifier;
  
    // Show the initiative roll in the dice roller popup
    showPopup(`Initiative Roll: d20 (${roll}) + DEX (${modifier}) = ${initiative}`);
  
    // Add the creature to the tracker
    addRow({
      name: creature.name,
      initiative: initiative,
      hp: creature.hp,
      ac: creature.ac
    });
  
    showNotification(`Added ${creature.name} to the initiative tracker.`);
  }
  
  // Display a creature's statblock
  function displayCreature(creature) {
    const statblockContent = document.getElementById("statblock-content");
    const editButton = document.getElementById("edit-statblock");
    const confirmButton = document.getElementById("confirm-statblock");
    const yamlEditor = document.getElementById("statblock-edit-content");
  
    // Helper function to make "+x to hit" and "xdy+z" clickable
    function processRollableText(text) {
      text = text.replace(/\+(\d+)\s+to\s+hit/g, (match, p1) => {
        return `<span class="rollable-hit" data-modifier="${p1}" style="cursor: pointer; color: blue;">${match}</span>`;
      });
  
      text = text.replace(/(\d+)d(\d+)([+-]\d+)?/g, (match, x, y, z) => {
        return `<span class="rollable-damage" data-roll="${x}d${y}${z || ""}" style="cursor: pointer; color: green;">${match}</span>`;
      });
  
      return text;
    }
  
    // Display the statblock
    statblockContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4>${creature.name}</h4>
        <p><strong>HP:</strong> ${creature.hp} | <strong>AC:</strong> ${creature.ac}</p>
      </div>
      <div>
        <p>${Object.entries(creature.ability_score_modifiers)
          .map(
            ([key, value]) =>
              `<span class="clickable-ability" data-modifier="${value}" style="cursor: pointer; color: blue;">${key}: ${
                value >= 0 ? "+" : ""
              }${value}</span>`
          )
          .join(" | ")}</p>
      </div>
      <h5>Features</h5>
      <ul>${creature.features
        .map((f) => `<li>${processRollableText(`<strong>${f.name}:</strong> ${f.description}`)}</li>`)
        .join("")}</ul>
      <h5>Actions</h5>
      <ul>${creature.actions
        .map((a) => `<li>${processRollableText(`<strong>${a.name}:</strong> ${a.description}`)}</li>`)
        .join("")}</ul>
      ${
        creature.legendary_actions.length > 0
          ? `<h5>Legendary Actions</h5>
             <ul>${creature.legendary_actions
               .map((la) => `<li>${processRollableText(`<strong>${la.name}:</strong> ${la.description}`)}</li>`)
               .join("")}</ul>`
          : ""
      }
    `;
  
    // Add event listeners for clickable rolls
    const clickableAbilities = statblockContent.querySelectorAll(".clickable-ability");
    clickableAbilities.forEach((ability) => {
      ability.addEventListener("click", () => rollAbility(ability.dataset.modifier, ability.textContent.split(":")[0]));
    });
  
    const rollableHits = statblockContent.querySelectorAll(".rollable-hit");
    rollableHits.forEach((hit) => {
      hit.addEventListener("click", () => {
        const modifier = parseInt(hit.dataset.modifier);
        const roll = Math.floor(Math.random() * 20) + 1;
        showPopup(`To Hit Roll: ${roll} + ${modifier} = ${roll + modifier}`);
      });
    });
  
    const rollableDamages = statblockContent.querySelectorAll(".rollable-damage");
    rollableDamages.forEach((damage) => {
      damage.addEventListener("click", () => {
        const [x, y, z] = damage.dataset.roll.match(/(\d+)d(\d+)([+-]\d+)?/).slice(1);
        const rolls = Array.from({ length: parseInt(x) }, () => Math.floor(Math.random() * parseInt(y)) + 1);
        const sum = rolls.reduce((a, b) => a + b, 0);
        const modifier = parseInt(z) || 0;
        showPopup(`${x}d${y}${z || ""} Roll: [${rolls.join(", ")}] + ${modifier} = ${sum + modifier}`);
      });
    });
  
    // Set up editing functionality
    editButton.classList.remove("hidden");
    editButton.innerHTML = '<i class="fas fa-pencil-alt" style="color: gray; cursor: pointer;"></i>';
    confirmButton.classList.add("hidden");
    confirmButton.innerHTML = '<i class="fas fa-check" style="color: green; cursor: pointer;"></i>';
    yamlEditor.classList.add("hidden");
    statblockContent.classList.remove("hidden");
  
    editButton.onclick = () => {
      yamlEditor.value = jsyaml.dump(creature, { indent: 2 });
  
      editButton.classList.add("hidden");
      confirmButton.classList.remove("hidden");
      statblockContent.classList.add("hidden");
      yamlEditor.classList.remove("hidden");
    };
  
    confirmButton.onclick = () => {
      try {
        const updatedCreature = jsyaml.load(yamlEditor.value);
        Object.assign(creature, updatedCreature);
        displayCreature(creature);
        saveNotebooksToLocalStorage(); // Save changes
      } catch (e) {
        showNotification("Invalid YAML syntax!");
      }
    };
  }
  
  // Roll for an ability score
  function rollAbility(modifier, abilityName) {
    const roll = Math.floor(Math.random() * 20) + 1; // Roll d20
    const total = roll + parseInt(modifier); // Add the modifier
    showPopup(`${abilityName} Roll: ${roll} + ${modifier} = ${total}`);
  }
  