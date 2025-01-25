// Simulated notebook data
let notebook = {
  name: "Epic Campaign",
  locations: [
    {
      name: "Dark Forest",
      encounters: [
        {
          name: "Goblin Ambush",
          content: "The goblins attack from the shadows.\nBeware their cunning tactics and poisoned arrows.",
          creatures: [
            {
  name: "Goblin Scout",
  hp: 12,
  ac: 13,
  ability_score_modifiers: {
    STR: -1,
    DEX: 2,
    CON: 1,
    INT: 0,
    WIS: -1,
    CHA: -2
  },
  features: [{ name: "Nimble Escape", description: "Can Disengage or Hide as a bonus action." }],
  actions: [{ name: "Scimitar", description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6+2) slashing damage." }],
  legendary_actions: []
            }
          ]
        }
      ]
    }
  ]
};

// DOM Elements
const locationsList = document.getElementById("locations-list");
const encounterName = document.getElementById("encounter-name");
const encounterContent = document.getElementById("encounter-content");
const creaturesList = document.getElementById("creatures-list");
const statblockContent = document.getElementById("statblock-content");
const addLocationBtn = document.getElementById("add-location");
const addLocationContainer = document.getElementById("add-location-container");
const newLocationName = document.getElementById("new-location-name");
const confirmAddLocationBtn = document.getElementById("confirm-add-location");
const loadYAMLBtn = document.getElementById("load-yaml");
const saveYAMLBtn = document.getElementById("save-yaml");

// Helper Functions
function populateLocations() {
  locationsList.innerHTML = "";
  const isEditMode = document.getElementById("edit-mode-toggle").checked;

  notebook.locations.forEach((location, locationIdx) => {
    const locationItem = document.createElement("li");
    locationItem.textContent = location.name;

    if (isEditMode) {
      // Add a draggable handle for the location
      const dragHandle = document.createElement("span");
      dragHandle.textContent = "≡";
      dragHandle.style.cursor = "grab";
      dragHandle.style.marginRight = "10px";
      dragHandle.draggable = true;

      // Drag event listeners for the location
      dragHandle.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("location-index", locationIdx); // Store index of dragged location
      });

      locationItem.prepend(dragHandle); // Add the drag handle to the location item

      // Add "+" and "-" buttons
      const addEncounterBtn = document.createElement("button");
      addEncounterBtn.textContent = "+";
      addEncounterBtn.style.marginLeft = "10px";
      addEncounterBtn.addEventListener("click", () => showAddEncounterField(locationIdx));
      locationItem.appendChild(addEncounterBtn);

      const removeButton = document.createElement("button");
      removeButton.textContent = "-";
      removeButton.style.marginLeft = "10px";
      removeButton.addEventListener("click", () => {
        notebook.locations.splice(locationIdx, 1);
        populateLocations();
        saveNotebooksToLocalStorage(); // Save after removing a creature

      });
      locationItem.appendChild(removeButton);
    }

    const encountersList = document.createElement("ul");

    location.encounters.forEach((encounter, encounterIdx) => {
      const encounterItem = document.createElement("li");
      encounterItem.textContent = encounter.name;

      if (isEditMode) {
        // Add a draggable handle for the encounter
        const dragHandle = document.createElement("span");
        dragHandle.textContent = "≡";
        dragHandle.style.cursor = "grab";
        dragHandle.style.marginRight = "10px";
        dragHandle.draggable = true;

        // Drag event listeners for the encounter
        dragHandle.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("encounter-index", encounterIdx); // Store index of dragged encounter
          e.dataTransfer.setData("location-index", locationIdx); // Store index of parent location
        });

        encounterItem.prepend(dragHandle); // Add the drag handle to the encounter item

        // Add "-" button
        const removeEncounterButton = document.createElement("button");
        removeEncounterButton.textContent = "-";
        removeEncounterButton.style.marginLeft = "10px";
        removeEncounterButton.addEventListener("click", () => {
          notebook.locations[locationIdx].encounters.splice(encounterIdx, 1);
          populateLocations();
          saveNotebooksToLocalStorage(); // Save after adding a location
              });
        encounterItem.appendChild(removeEncounterButton);
      }

      encounterItem.addEventListener("click", () => displayEncounter(encounter));
      encountersList.appendChild(encounterItem);
    });

    // Add drag and drop listeners for the location
    locationItem.addEventListener("dragover", (e) => e.preventDefault());
    locationItem.addEventListener("drop", (e) => {
      const draggedIndex = e.dataTransfer.getData("location-index");
      if (draggedIndex !== undefined) {
        const draggedLocation = notebook.locations.splice(draggedIndex, 1)[0];
        notebook.locations.splice(locationIdx, 0, draggedLocation);
        populateLocations(); // Refresh the list
      }
    });

    // Add drag and drop listeners for the encounters
    encountersList.addEventListener("dragover", (e) => e.preventDefault());
    encountersList.addEventListener("drop", (e) => {
      const draggedLocationIdx = e.dataTransfer.getData("location-index");
      const draggedEncounterIdx = e.dataTransfer.getData("encounter-index");
      if (
        draggedLocationIdx !== undefined &&
        draggedEncounterIdx !== undefined &&
        draggedLocationIdx == locationIdx
      ) {
        const draggedEncounter = notebook.locations[locationIdx].encounters.splice(draggedEncounterIdx, 1)[0];
        notebook.locations[locationIdx].encounters.splice(encountersList.children.length, 0, draggedEncounter);
        populateLocations(); // Refresh the list
      }
    });

    locationItem.appendChild(encountersList);
    locationsList.appendChild(locationItem);
  });
}




// Display Encounter Details
function displayEncounter(encounter) {
  activeEncounter = encounter; // Update the active encounter
  encounterName.textContent = encounter.name;

  // Render the content using Marked.js
  encounterContent.innerHTML = marked.parse(encounter.content);

  populateCreatures(encounter.creatures);

  const editButton = document.getElementById("edit-encounter");
  const confirmButton = document.getElementById("confirm-edit-encounter");
  const encounterEditTextArea = document.getElementById("encounter-edit-content");

  // Reset buttons visibility
  editButton.classList.remove("hidden");
  confirmButton.classList.add("hidden");
  encounterEditTextArea.classList.add("hidden");
  encounterContent.classList.remove("hidden");

  // Attach edit functionality
  editButton.onclick = () => enableMarkdownEditor(encounter);
}





function populateCreatures(creatures) {
  creaturesList.innerHTML = "";

  const creaturesLisDiv = document.getElementById("creatures-list-div");
  const statblockDiv = document.getElementById("statblock");
  const isEditMode = document.getElementById("edit-mode-toggle").checked; // Check if edit mode is on
  const addCreatureContainer = document.getElementById("add-creature-container");
  const newCreatureNameInput = document.getElementById("new-creature-name");
  const confirmAddCreatureBtn = document.getElementById("confirm-add-creature");

  // Check if there are any creatures to display
  if (creatures.length === 0 && !isEditMode) {
    creaturesLisDiv.style.display = "none"; // Completely hide the creatures list
    statblockDiv.style.display = "none"; // Completely hide the statblock
    addCreatureContainer.classList.add("hidden"); // Hide add creature container
    return;
  }

  // Show the creatures list and statblock
  creaturesLisDiv.style.display = "block";
  statblockDiv.style.display = "block";
  
  creatures.forEach((creature, creatureIdx) => {
    const creatureItem = document.createElement("li");
    creatureItem.textContent = creature.name;
    creatureItem.addEventListener("click", () => displayCreature(creature));


    if (isEditMode) {
    const removeButton = document.createElement("button");
	removeButton.textContent = "-";
	removeButton.classList.add("edit-mode");
    removeButton.style.marginLeft = "10px"; // Add spacing
    removeButton.addEventListener("click", () => {
      creatures.splice(creatureIdx, 1); // Remove the creature
      populateCreatures(creatures); // Refresh the list
      saveNotebooksToLocalStorage(); // Save after removing a creature

    });
	

    creatureItem.appendChild(removeButton); // Add the remove button to the creature
	}
    creaturesList.appendChild(creatureItem);

    // Create the "Roll Initiative" button
    const rollButton = document.createElement("button");
    rollButton.textContent = "Roll Initiative";
    rollButton.style.marginLeft = "10px"; // Add spacing between name and button
    rollButton.addEventListener("click", () => {
      addCreatureToInitiative(creature);
    });

    creatureItem.appendChild(rollButton); // Add button next to the creature name
  });

  if (isEditMode) {

    const addCreatureButton = document.createElement("button");
    addCreatureButton.textContent = "New Creature";
    addCreatureButton.style.cursor = "pointer";
    addCreatureButton.style.textAlign = "center";
  

    // Click event to add a new creature
    addCreatureButton.addEventListener("click", () => {
      addCreatureContainer.classList.remove("hidden"); // Show the container
      newCreatureNameInput.focus(); // Focus the input field
    });

    creaturesList.appendChild(addCreatureButton); // Add the button to the bottom of the list


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
        saveNotebooksToLocalStorage(); // Save after adding a location
    
        showNotification(`Creature "${newCreatureName}" added.`);
      } else {
        showNotification("Please enter a valid creature name.");
      }
    });
 
  }




}




// Add Location
addLocationBtn.addEventListener("click", () => {
  addLocationContainer.classList.remove("hidden");
});

confirmAddLocationBtn.addEventListener("click", () => {
  const newLocation = {
    name: newLocationName.value,
    encounters: []
  };
  notebook.locations.push(newLocation);
  newLocationName.value = "";
  addLocationContainer.classList.add("hidden");
  populateLocations();
  saveNotebooksToLocalStorage(); // Save after adding a location

});

// Load and Save YAML
loadYAMLBtn.addEventListener("click", () => {
  // Logic for loading YAML file will go here
});

saveYAMLBtn.addEventListener("click", () => {
  const yamlData = JSON.stringify(notebook, null, 2); // Placeholder for YAML export
  console.log(yamlData); // Replace with actual download logic
});

// Initial Population
populateLocations();

// Show Add Encounter Field
function showAddEncounterField(locationIdx) {
  const addEncounterContainer = document.createElement("div");
  addEncounterContainer.innerHTML = `
    <input type="text" placeholder="New Encounter Name" id="new-encounter-name-${locationIdx}">
    <button id="confirm-add-encounter-${locationIdx}">✔</button>
  `;
  locationsList.children[locationIdx].appendChild(addEncounterContainer);

  const confirmAddEncounterBtn = document.getElementById(`confirm-add-encounter-${locationIdx}`);
  confirmAddEncounterBtn.addEventListener("click", () => {
    const newEncounterName = document.getElementById(`new-encounter-name-${locationIdx}`).value;
    notebook.locations[locationIdx].encounters.push({
      name: newEncounterName,
      content: "New encounter content.",
      creatures: []
    });
    populateLocations();
    saveNotebooksToLocalStorage(); // Save after adding a location
  
  });
}


// Enable Markdown Editing for Encounter Content
function enableMarkdownEditor(encounter) {
  const editButton = document.getElementById("edit-encounter");
  const confirmButton = document.getElementById("confirm-edit-encounter");
  const encounterContentDiv = document.getElementById("encounter-content");
  const encounterEditTextArea = document.getElementById("encounter-edit-content");

  // Switch to edit mode
  editButton.classList.add("hidden");
  confirmButton.classList.remove("hidden");
  encounterContentDiv.classList.add("hidden");
  encounterEditTextArea.classList.remove("hidden");
  encounterEditTextArea.value = encounter.content;

  // Clear existing listeners to avoid stacking
  confirmButton.replaceWith(confirmButton.cloneNode(true));
  const newConfirmButton = document.getElementById("confirm-edit-encounter");

  // Handle confirming the edit
  newConfirmButton.addEventListener("click", () => {
    // Update the encounter content and render it with Marked.js
    encounter.content = encounterEditTextArea.value;
    encounterContentDiv.innerHTML = marked.parse(encounter.content);
    newConfirmButton.classList.add("hidden");
    editButton.classList.remove("hidden");
    encounterContentDiv.classList.remove("hidden");
    encounterEditTextArea.classList.add("hidden");
  });
}

// Load YAML functionality
document.getElementById("load-yaml").addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".yaml,.yml";

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      try {
        const parsedData = jsyaml.load(text);
        notebook = parsedData; // Update the notebook with loaded data
        populateLocations(); // Refresh the UI
        showNotification("Notebook loaded successfully!");
      } catch (e) {
        showNotification("Failed to load YAML!");
      }
    }
  });

  fileInput.click(); // Trigger the file input dialog
});


// Save YAML functionality
document.getElementById("save-yaml").addEventListener("click", () => {
  const yamlData = jsyaml.dump(notebook, { indent: 2 }); // Convert notebook to YAML
  const blob = new Blob([yamlData], { type: "application/x-yaml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "notebook.yaml"; // Default file name
  link.click(); // Trigger the download
  URL.revokeObjectURL(link.href); // Clean up the URL object
});



// DOM Elements
const initiativeTrackerGrid = document.getElementById("initiative-tracker-grid");
const addRowButton = document.getElementById("add-row");

// Create a default number of rows
const initialRows = 3;
initializeTracker(initialRows);

// Function to initialize the tracker with a default number of rows
function initializeTracker(rows) {
  for (let i = 0; i < rows; i++) {
    addRow();
  }
  // Attach event listeners for adding and removing rows
addRowButton.addEventListener("click", addRow);
}

// Function to add a new combatant row
function addRow(creature = null) {
  // Default values for manual row addition
  const defaultValues = {
    initiative: "",
    name: "",
    hp: "",
    ac: ""
  };

  // Use creature values if provided, otherwise use default values
  const creatureValues = creature
    ? {
        initiative: creature.initiative || "", // Populate initiative if provided
        name: creature.name || "",
        hp: creature.hp || "",
        ac: creature.ac || ""
      }
    : defaultValues;

  // Add a new row with the creature's data
  Object.values(creatureValues).forEach((value, index) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;

    // Add functionality to the HP column (3rd cell) to solve arithmetic expressions
    if (index === 2) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const expression = input.value.trim();
          try {
            // Use eval to evaluate the arithmetic expression
            const result = eval(expression);
            if (!isNaN(result)) {
              input.value = result; // Replace the expression with its result
            } else {
              throw new Error("Invalid expression");
            }
          } catch (err) {
            showNotification("Invalid arithmetic expression."); // Notify user of invalid input
          }
        }
      });
    }

    initiativeTrackerGrid.appendChild(input);
  });

  // Add the "Remove" button at the end of the row
  const removeButton = document.createElement("button");
  removeButton.textContent = "-";
  removeButton.style.cursor = "pointer";
  removeButton.style.textAlign = "center";

  // Remove the entire row when clicked
  removeButton.addEventListener("click", () => {
    removeCombatantRow(removeButton);
    populateLocations();
    saveNotebooksToLocalStorage(); // Save after adding a location

  });

  initiativeTrackerGrid.appendChild(removeButton);

  // Sort rows after adding the new creature
  sortTrackerRows();
}


function addCreatureToInitiative(creature) {
  // Calculate initiative roll
  const roll = Math.floor(Math.random() * 20) + 1; // Roll a d20
  const modifier = creature.ability_score_modifiers.DEX || 0; // DEX modifier
  const initiative = roll + modifier;

  // Show the initiative roll in the dice roller popup
  showPopup(`Initiative Roll: d20 (${roll}) + DEX (${modifier}) = ${initiative}`);

  // Pass the creature data to addRow
  addRow({
    name: creature.name,
    initiative: initiative,
    hp: creature.hp,
    ac: creature.ac
  });

  showNotification(`Added ${creature.name} to the initiative tracker.`);
}







// Function to remove a combatant row
function removeCombatantRow(button) {
  // Find the index of the row containing the clicked button
  const allCells = Array.from(initiativeTrackerGrid.children);
  const buttonIndex = allCells.indexOf(button);

  // Remove the entire row (6 elements: 5 inputs + 1 button)
  for (let i = 0; i < 5; i++) {
    allCells[buttonIndex - (4 - i)].remove();
  }
}


// Debounce timer
let sortTimeout;

// Function to sort rows by initiative (#) column
function sortTrackerRows() {
  // Get all rows as arrays of 6 inputs each
  
  
  const combatantCells = Array.from(initiativeTrackerGrid.children).slice(5); // Skip the first 6 header cells

  // Group combatant cells into rows of 6 (5 inputs + 1 button per row)
  const rows = [];
  for (let i = 0; i < combatantCells.length; i += 5) {
    rows.push(combatantCells.slice(i, i + 5));
  }


  // Sort rows by the value in the first cell (# column)
  rows.sort((a, b) => {
    const aValue = parseInt(a[0].value) || 0;
    const bValue = parseInt(b[0].value) || 0;
    return bValue - aValue; // Descending order
  });

  // Reattach sorted rows to the grid without disrupting focus
  const activeElement = document.activeElement; // Save the focused element
  rows.forEach((row) => {
    row.forEach((cell) => initiativeTrackerGrid.appendChild(cell));
  });
  activeElement.focus(); // Restore focus

// Debounced sorting when an input changes
initiativeTrackerGrid.addEventListener("input", (e) => {
  if (e.target.closest("input")) {
    clearTimeout(sortTimeout); // Clear previous timer
    sortTimeout = setTimeout(() => sortTrackerRows(), 300); // Debounce sorting
  }
});
}




function displayCreature(creature) {
  const statblockContent = document.getElementById("statblock-content");
  const editButton = document.getElementById("edit-statblock");
  const confirmButton = document.getElementById("confirm-statblock");
  const yamlEditor = document.getElementById("statblock-edit-content");

  // Helper function to make "+x to hit" and "xdy+z" clickable
  function processRollableText(text) {
    // Match "+x to hit" patterns
    text = text.replace(/\+(\d+)\s+to\s+hit/g, (match, p1) => {
      return `<span class="rollable-hit" data-modifier="${p1}" style="cursor: pointer; color: blue;">${match}</span>`;
    });

    // Match "xdy+z" patterns
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

  // Add event listeners for ability scores
  const clickableAbilities = statblockContent.querySelectorAll(".clickable-ability");
  clickableAbilities.forEach((ability) => {
    ability.addEventListener("click", () => rollAbility(ability.dataset.modifier, ability.textContent.split(":")[0]));
  });

  // Add event listeners for "+x to hit"
  const rollableHits = statblockContent.querySelectorAll(".rollable-hit");
  rollableHits.forEach((hit) => {
    hit.addEventListener("click", () => {
      const modifier = parseInt(hit.dataset.modifier);
      const roll = Math.floor(Math.random() * 20) + 1;
      showPopup(`To Hit Roll: ${roll} + ${modifier} = ${roll + modifier}`);
    });
  });

  // Add event listeners for "xdy+z"
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

  // Reset buttons and editor visibility
  editButton.classList.remove("hidden");
  confirmButton.classList.add("hidden");
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
      saveNotebooksToLocalStorage(); // Save after removing a creature

    } catch (e) {
      showNotification("Invalid YAML syntax!");
    }
  };
}

// Function to roll for an ability score
function rollAbility(modifier, abilityName) {
  const roll = Math.floor(Math.random() * 20) + 1; // Roll d20
  const total = roll + parseInt(modifier); // Add the modifier
  showPopup(`${abilityName} Roll: ${roll} + ${modifier} = ${total}`);
}

// Function to display a popup with the roll result
function showPopup(message) {
  const popup = document.createElement("div");
  popup.textContent = message;
  popup.className = "roll-popup";
  document.body.appendChild(popup);

  // Remove popup after 3 seconds
  setTimeout(() => {
    popup.remove();
  }, 3000);
}

function toggleEditMode(isEditMode) {
  const editButtons = document.querySelectorAll(".edit-mode");
  editButtons.forEach((button) => {
    button.style.display = isEditMode ? "inline-block" : "none";
  });
}
const editModeToggle = document.getElementById("edit-mode-toggle");
editModeToggle.addEventListener("change", (e) => {
  toggleEditMode(e.target.checked); // Enable or disable edit mode
});

// Initialize edit mode to match the default toggle state
toggleEditMode(editModeToggle.checked);

// Save notebook to localStorage
function saveNotebookToLocalStorage() {
  const notebookData = JSON.stringify(notebook);
  localStorage.setItem("notebook", notebookData);
  showNotification("Notebook saved successfully!");
}

// Load notebook from localStorage
function loadNotebookFromLocalStorage() {
  const notebookData = localStorage.getItem("notebook");
  if (notebookData) {
    try {
      notebook = JSON.parse(notebookData);
      populateLocations();
      showNotification("Notebook loaded successfully!");
    } catch (e) {
      showNotification("Failed to load notebook!");
    }
  } else {
    showNotification("No notebook found!");
  }
}

// Call the load function on page load
window.addEventListener("DOMContentLoaded", () => {
  loadNotebookFromLocalStorage();
});

document.getElementById("save-notebook").addEventListener("click", () => {
  saveNotebooksToLocalStorage();
});


const defaultNotebook = {
  name: "Default Notebook",
  locations: [
    {
      name: "Dark Forest",
      encounters: [
        {
          name: "Goblin Ambush",
          content: "The goblins attack from the shadows.\nBeware their cunning tactics and poisoned arrows.",
          creatures: [
            {
              name: "Goblin Scout",
              hp: 12,
              ac: 13,
              ability_score_modifiers: {
                STR: -1,
                DEX: 2,
                CON: 1,
                INT: 0,
                WIS: -1,
                CHA: -2
              },
              features: [
                {
                  name: "Nimble Escape",
                  description: "The goblin can take the Disengage or Hide action as a bonus action."
                }
              ],
              actions: [
                {
                  name: "Scimitar",
                  description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6+2) slashing damage."
                },
                {
                  name: "Shortbow",
                  description: "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6+2) piercing damage."
                }
              ],
              legendary_actions: []
            }
          ]
        }
      ]
    }
  ]
};

// Save all notebooks to localStorage
function saveNotebooksToLocalStorage() {
  const allNotebooks = JSON.parse(localStorage.getItem("allNotebooks")) || {};
  allNotebooks[notebook.name] = notebook; // Add or update the current notebook
  localStorage.setItem("allNotebooks", JSON.stringify(allNotebooks));
  showNotification("All notebooks saved successfully!");
}

// Load all notebooks from localStorage
function loadNotebooksFromLocalStorage() {
  return JSON.parse(localStorage.getItem("allNotebooks")) || {};
}

// Populate the notebook dropdown
function populateNotebookDropdown() {
  const notebookSelect = document.getElementById("notebook-select");
  const allNotebooks = loadNotebooksFromLocalStorage();

  // Clear the dropdown
  notebookSelect.innerHTML = "";

  // Add options for each saved notebook
  Object.keys(allNotebooks).forEach((notebookName) => {
    const option = document.createElement("option");
    option.value = notebookName;
    option.textContent = notebookName;
    notebookSelect.appendChild(option);
  });

  // Add the "Add Notebook" option
  const addOption = document.createElement("option");
  addOption.value = "add-new";
  addOption.textContent = "Add Notebook";
  addOption.style.fontStyle = "italic";
  notebookSelect.appendChild(addOption);
}

// Handle notebook selection
document.getElementById("notebook-select").addEventListener("change", (e) => {
  const selectedNotebook = e.target.value;

  if (selectedNotebook === "add-new") {
    // Show the modal to enter a new notebook name
    showModal({
      message: "Enter a name for the new notebook:",
      showInput: true,
      onConfirm: (newNotebookName) => {
        if (newNotebookName) {
          const allNotebooks = loadNotebooksFromLocalStorage();
          const newNotebook = { ...defaultNotebook, name: newNotebookName };
          allNotebooks[newNotebookName] = newNotebook;
          localStorage.setItem("allNotebooks", JSON.stringify(allNotebooks));
          notebook = newNotebook;
          populateLocations();
          populateNotebookDropdown();
          document.getElementById("notebook-select").value = newNotebookName;
          showNotification(`Notebook "${newNotebookName}" created.`);
        } else {
          showNotification("Notebook creation canceled.");
        }
      }
    });
  } else {
    const allNotebooks = loadNotebooksFromLocalStorage();
    notebook = allNotebooks[selectedNotebook];
    populateLocations();
  }
});



window.addEventListener("DOMContentLoaded", () => {
  const allNotebooks = loadNotebooksFromLocalStorage();

  if (Object.keys(allNotebooks).length > 0) {
    // Load the first notebook as the default
    const firstNotebookName = Object.keys(allNotebooks)[0];
    notebook = allNotebooks[firstNotebookName];
  } else {
    // Create the first notebook using the default template
    notebook = { ...defaultNotebook };
    saveNotebooksToLocalStorage();
  }

  populateLocations();
  populateNotebookDropdown();
});

document.getElementById("delete-notebook").addEventListener("click", () => {
  const notebookName = notebook.name;

  // Show the modal to confirm deletion
  showModal({
    message: `Are you sure you want to delete the notebook "${notebookName}"?`,
    onConfirm: () => {
      const allNotebooks = loadNotebooksFromLocalStorage();
      delete allNotebooks[notebookName];
      localStorage.setItem("allNotebooks", JSON.stringify(allNotebooks));

      const remainingNotebookNames = Object.keys(allNotebooks);
      if (remainingNotebookNames.length > 0) {
        notebook = allNotebooks[remainingNotebookNames[0]];
      } else {
        notebook = { ...defaultNotebook };
        saveNotebooksToLocalStorage();
      }

      populateLocations();
      populateNotebookDropdown();
      showNotification(`Notebook "${notebookName}" deleted.`);
    }
  });
});



function showNotification(message) {
  const notificationArea = document.getElementById("notification-area");

  // Create a notification message element
  const notification = document.createElement("div");
  notification.className = "notification-message";
  notification.textContent = message;

  // Add the notification to the notification area
  notificationArea.appendChild(notification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showModal({ message, showInput = false, onConfirm }) {
  const modalContainer = document.getElementById("modal-container");
  const modalMessage = document.getElementById("modal-message");
  const modalInput = document.getElementById("modal-input");
  const confirmButton = document.getElementById("modal-confirm");
  const cancelButton = document.getElementById("modal-cancel");

  modalMessage.textContent = message;
  modalInput.value = "";
  modalInput.classList.toggle("hidden", !showInput);

  modalContainer.classList.remove("hidden");

  // Confirm action
  const handleConfirm = () => {
    modalContainer.classList.add("hidden");
    const inputValue = showInput ? modalInput.value.trim() : null;
    if (onConfirm) onConfirm(inputValue);
    cleanup();
  };

  // Cancel action
  const handleCancel = () => {
    modalContainer.classList.add("hidden");
    cleanup();
  };

  // Cleanup event listeners
  const cleanup = () => {
    confirmButton.removeEventListener("click", handleConfirm);
    cancelButton.removeEventListener("click", handleCancel);
  };

  confirmButton.addEventListener("click", handleConfirm);
  cancelButton.addEventListener("click", handleCancel);
}

document.getElementById("rename-notebook").addEventListener("click", () => {
  const currentNotebookName = notebook.name;

  // Show the modal to enter a new name
  showModal({
    message: `Rename "${currentNotebookName}" to:`,
    showInput: true,
    onConfirm: (newNotebookName) => {
      if (newNotebookName && newNotebookName !== currentNotebookName) {
        const allNotebooks = loadNotebooksFromLocalStorage();

        // Check for duplicate names
        if (allNotebooks[newNotebookName]) {
          showNotification(`A notebook named "${newNotebookName}" already exists.`);
          return;
        }

        // Rename the notebook
        delete allNotebooks[currentNotebookName];
        notebook.name = newNotebookName;
        allNotebooks[newNotebookName] = notebook;
        localStorage.setItem("allNotebooks", JSON.stringify(allNotebooks));

        populateLocations();
        populateNotebookDropdown();
        document.getElementById("notebook-select").value = newNotebookName; // Update dropdown
        showNotification(`Notebook renamed to "${newNotebookName}".`);
      } else if (!newNotebookName) {
        showNotification("Rename canceled.");
      } else {
        showNotification("No changes made to the notebook name.");
      }
    }
  });
});

document.getElementById("edit-mode-toggle").addEventListener("change", () => {
  populateLocations(); // Refresh the locations list

  // Refresh creatures list only for the active encounter
  if (activeEncounter) {
    populateCreatures(activeEncounter.creatures);
  }
});


let activeEncounter = null; // Tracks the currently active encounter
