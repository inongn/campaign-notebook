function populateStatblock(creature, encounter) {
    const isEditMode = document.getElementById("edit-mode-toggle").checked;
    const statblockContent = document.getElementById("statblock-content");
    const editButton = document.getElementById("edit-statblock");
    const confirmButton = document.getElementById("confirm-statblock");
    const yamlEditor = document.getElementById("statblock-edit-content");
  
    statblockContent.innerHTML = generateStatblockHTML(creature);
    addStatblockEventListeners(statblockContent);
    setupEditButtons(editButton,confirmButton,yamlEditor,statblockContent,creature, encounter)
    toggleEditMode(isEditMode);
  }
  
  
  function generateStatblockHTML(creature) {
    const processRollableText = (text) => {
      return text
        .replace(/\+(\d+)\s+to\s+hit/g, (match, p1) => `<span class="rollable-hit" data-modifier="${p1}" style="cursor: pointer; color: blue;">${match}</span>`)
        .replace(/(\d+)d(\d+)([+-]\d+)?/g, (match, x, y, z) => `<span class="rollable-damage" data-roll="${x}d${y}${z || ""}" style="cursor: pointer; color: green;">${match}</span>`);
    };
  
    const abilityScoresHTML = Object.entries(creature.ability_score_modifiers)
      .map(([key, value]) => `<span class="clickable-ability" data-modifier="${value}" style="cursor: pointer; color: blue;">${key}: ${value >= 0 ? "+" : ""}${value}</span>`)
      .join(" | ");
  
    const featuresHTML = creature.features
      .map((f) => `<li>${processRollableText(`<strong>${f.name}:</strong> ${f.description}`)}</li>`)
      .join("");
  
    const actionsHTML = creature.actions
      .map((a) => `<li>${processRollableText(`<strong>${a.name}:</strong> ${a.description}`)}</li>`)
      .join("");
  
    const legendaryActionsHTML = creature.legendary_actions.length > 0
      ? `<h5>Legendary Actions</h5>
         <ul>${creature.legendary_actions
           .map((la) => `<li>${processRollableText(`<strong>${la.name}:</strong> ${la.description}`)}</li>`)
           .join("")}</ul>`
      : "";
  
    return `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4>${creature.name}</h4>
        <p><strong>HP:</strong> ${creature.hp} | <strong>AC:</strong> ${creature.ac}</p>
      </div>
      <div><p>${abilityScoresHTML}</p></div>
      <h5>Features</h5>
      <ul>${featuresHTML}</ul>
      <h5>Actions</h5>
      <ul>${actionsHTML}</ul>
      ${legendaryActionsHTML}
    `;
  }
  
  function addStatblockEventListeners(statblockContent) {
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
  }
  
    // Roll for an ability score
    function rollAbility(modifier, abilityName) {
        const roll = Math.floor(Math.random() * 20) + 1; // Roll d20
        const total = roll + parseInt(modifier); // Add the modifier
        showPopup(`${abilityName} Roll: ${roll} + ${modifier} = ${total}`);
      }
      
      
function setupEditButtons(editButton, confirmButton, yamlEditor, statblockContent, creature, encounter) {
  editButton.classList.remove("hidden");
  confirmButton.classList.add("hidden");
  yamlEditor.classList.add("hidden");
  statblockContent.classList.remove("hidden");

  editButton.onclick = () => enterEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature);
  confirmButton.onclick = () => confirmEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature, encounter);
}

function enterEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature) {
  yamlEditor.value = jsyaml.dump(creature, { indent: 2 });

  editButton.classList.add("hidden");
  confirmButton.classList.remove("hidden");
  statblockContent.classList.add("hidden");
  yamlEditor.classList.remove("hidden");
}

function confirmEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature, encounter) {
  try {
    const updatedCreature = jsyaml.load(yamlEditor.value);

    // Debugging step: Log the parsed object to verify it matches expectations

    if (!isValidCreature(updatedCreature)) {
      throw new Error("Parsed object does not match expected structure.");
    }

    // Update the creature object
    Object.assign(creature, updatedCreature);

    // Re-populate the statblock to reflect changes
    console.log(encounter);
    console.log(creature);
    saveAllNotebooks(); // notebook.js
    populateEncounter(encounter);
    populateCreatures(encounter);
    populateStatblock(creature, encounter);

    // Debugging step: Log success
  } catch (e) {
    showNotification("Invalid YAML syntax!");
  }
}

function isValidCreature(creature) {
    return (
      typeof creature === "object" &&
      typeof creature.name === "string" &&
      typeof creature.hp === "number" &&
      typeof creature.ac === "number" &&
      typeof creature.ability_score_modifiers === "object" &&
      Array.isArray(creature.features) &&
      Array.isArray(creature.actions) &&
      Array.isArray(creature.legendary_actions)
    );
  }
  