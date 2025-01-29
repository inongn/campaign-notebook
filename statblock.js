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
  
    const abilityScoresHTML = creature.ability_scores
      ? `<table style="width: 100%; text-align: center; margin-top: 10px; margin-bottom:10px;">
           <tr><th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th></tr>
           <tr>${Object.entries(creature.ability_scores)
             .map(
               ([key, value]) =>
                 `<td class="rollable-ability" data-modifier="${creature.ability_score_modifiers[key]}" style="cursor: pointer; color: blue;">
                   ${value} (${creature.ability_score_modifiers[key] >= 0 ? "+" : ""}${creature.ability_score_modifiers[key]})
                 </td>`
             )
             .join("")}</tr>
         </table>`
      : "";
  
    const featuresHTML = creature.features
      ? creature.features
          .map((f) => `<li>${processRollableText(`<strong>${f.name}:</strong> ${f.description}`)}</li>`)
          .join("")
      : "";
  
    const actionSectionsHTML = Object.entries(creature)
      .filter(([key]) => key.toLowerCase().includes("action") && Array.isArray(creature[key]) && creature[key].length > 0)
      .map(
        ([key, actions]) => `
          <h5>${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</h5>
          <ul>${actions
            .map((action) => `<li>${processRollableText(`<strong>${action.name}:</strong> ${action.description}`)}</li>`)
            .join("")}</ul>
        `
      )
      .join("");
  
    const skillsHTML = creature.skills
      ? `<li><strong>Skills:</strong> ${Object.entries(creature.skills)
          .map(
            ([skill, modifier]) =>
              `<span class="rollable-skill" data-modifier="${modifier}" style="cursor: pointer; color: blue;">${skill} ${
                modifier >= 0 ? "+" : ""
              }${modifier}</span>`
          )
          .join(", ")}</li>`
      : "";
  
    const sensesHTML = creature.senses ? `<li><strong>Senses:</strong> ${creature.senses.join(", ")}</li>` : "";
  
    const languagesHTML = creature.languages ? `<li><strong>Languages:</strong> ${creature.languages.join(", ")}</li>` : "";
  
    const challengeRatingHTML = creature.challenge_rating
      ? `<li><strong>Challenge:</strong> ${creature.challenge_rating}</li>`
      : "";
  
    const traitsHTML =
      skillsHTML || sensesHTML || languagesHTML || challengeRatingHTML
        ? `<ul>
            ${skillsHTML}
            ${sensesHTML}
            ${languagesHTML}
            ${challengeRatingHTML}
           </ul>`
        : "";
  
    const sizeTypeAlignmentHTML = [creature.size, creature.type, creature.alignment].filter(Boolean).length
      ? `<p>${[creature.size, creature.type, creature.alignment].filter(Boolean).join(", ")}</p>`
      : "";
  
    return `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4>${creature.name}</h4>
        <p><strong>HP:</strong> ${creature.hp} | <strong>AC:</strong> ${creature.ac}${
      creature.initiative !== undefined ? ` | <strong>Initiative:</strong> ${creature.initiative}` : ""
    }</p>
      </div>
      ${sizeTypeAlignmentHTML}
      ${abilityScoresHTML}
      ${traitsHTML}
      <h5>Features</h5>
      <ul>${featuresHTML}</ul>
      ${actionSectionsHTML}
    `;
  }
  
  
  
  
function addStatblockEventListeners() {
  const statblockContent = document.getElementById("statblock-content");

  // Add event listeners for rollable abilities
  const rollableAbilities = statblockContent.querySelectorAll(".rollable-ability");
  rollableAbilities.forEach((ability) => {
    ability.addEventListener("click", () => {
      const modifier = parseInt(ability.dataset.modifier);
      const roll = Math.floor(Math.random() * 20) + 1;
      const abilityName = ability.textContent.split(":")[0].trim(); // Extract ability name
      const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`; // Format modifier

      showPopup(`Ability Roll: d20 (${roll}) ${modifierText} = ${roll + modifier}`);
    });
  });

  // Add event listeners for rollable skills
  const rollableSkills = statblockContent.querySelectorAll(".rollable-skill");
  rollableSkills.forEach((skill) => {
    skill.addEventListener("click", () => {
      const modifier = parseInt(skill.dataset.modifier);
      const roll = Math.floor(Math.random() * 20) + 1;
      const skillName = skill.textContent.split(" ")[0]; // Extract skill name
      const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`; // Format modifier

      showPopup(`Skill Roll (${skillName}): d20 (${roll}) ${modifierText} = ${roll + modifier}`);
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

  const rollableHits = statblockContent.querySelectorAll(".rollable-hit");
  rollableHits.forEach((hit) => {
    hit.addEventListener("click", () => {
      const modifier = parseInt(hit.dataset.modifier);
      const roll = Math.floor(Math.random() * 20) + 1;
      showPopup(`To Hit Roll: ${roll} + ${modifier} = ${roll + modifier}`);
    });
  });

}

  
  
      
      
function setupEditButtons(editButton, confirmButton, yamlEditor, statblockContent, creature, encounter) {
  editButton.classList.remove("hidden");
  confirmButton.classList.add("hidden");
  yamlEditor.classList.add("hidden");
  statblockContent.classList.remove("hidden");

  editButton.onclick = () => enterEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature);
  confirmButton.onclick = () => {
    try {
      // Parse the YAML and replace the creature object completely
      const updatedCreature = jsyaml.load(yamlEditor.value);
  
      // Replace the entire creature object to remove old or missing properties
      Object.keys(creature).forEach((key) => delete creature[key]); // Clear existing keys
      Object.assign(creature, updatedCreature);
  
      // Refresh the statblock display
      populateStatblock(creature);
      saveAllNotebooks(); // Save changes
    } catch (e) {
      showNotification("Invalid YAML syntax!");
    }
  };
  }

function enterEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature) {
  yamlEditor.value = jsyaml.dump(creature, { indent: 2 });

  editButton.classList.add("hidden");
  confirmButton.classList.remove("hidden");
  statblockContent.classList.add("hidden");
  yamlEditor.classList.remove("hidden");
}

function confirmEditMode(editButton, confirmButton, yamlEditor, statblockContent, creature, encounter) {
  saveState();

  try {
    const updatedCreature = jsyaml.load(yamlEditor.value);

    // Debugging step: Log the parsed object to verify it matches expectations

    if (!isValidCreature(updatedCreature)) {
      throw new Error("Parsed object does not match expected structure.");
    }

    // Update the creature object
    Object.assign(creature, updatedCreature);

    // Re-populate the statblock to reflect changes
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
  if (
    typeof creature !== "object" ||
    typeof creature.name !== "string" ||
    typeof creature.hp !== "number" ||
    typeof creature.ac !== "number" ||
    typeof creature.ability_score_modifiers !== "object" ||
    !Array.isArray(creature.features)
  ) {
    return false;
  }

  // Validate ability scores if provided
  if (
    creature.ability_scores &&
    Object.values(creature.ability_scores).some((score) => typeof score !== "number")
  ) {
    return false;
  }

  // Validate optional fields
  if (
    creature.skills &&
    Object.values(creature.skills).some((modifier) => typeof modifier !== "number")
  ) {
    return false;
  }

  if (
    creature.senses &&
    !Array.isArray(creature.senses)
  ) {
    return false;
  }

  if (
    creature.languages &&
    !Array.isArray(creature.languages)
  ) {
    return false;
  }

  if (
    creature.challenge_rating &&
    typeof creature.challenge_rating !== "string"
  ) {
    return false;
  }

  if (
    creature.initiative &&
    typeof creature.initiative !== "number"
  ) {
    return false;
  }

  // Validate dynamic action subsections
  const isValidActionSection = (actions) =>
    Array.isArray(actions) &&
    actions.every(
      (action) =>
        typeof action.name === "string" && typeof action.description === "string"
    );

  for (const key in creature) {
    if (key.toLowerCase().includes("action")) {
      if (!isValidActionSection(creature[key])) {
        return false;
      }
    }
  }

  return true;
}

function rollAbility(modifier, abilityName) {
  const roll = Math.floor(Math.random() * 20) + 1; // Roll d20
  const parsedModifier = parseInt(modifier); // Ensure modifier is an integer
  const total = roll + parsedModifier; // Calculate the total

  // Construct the modifier part of the message correctly (handle negatives)
  const modifierText = parsedModifier >= 0 ? `+${parsedModifier}` : `${parsedModifier}`;

  // Show the roll result with the ability name
  showPopup(`${abilityName} Roll: d20 (${roll}) ${modifierText} = ${total}`);
}
