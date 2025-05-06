document.addEventListener("DOMContentLoaded", initializeInitiativeTracker);

function initializeInitiativeTracker() {
  for (let i = 0; i < 4; i++) {
      addCombatantRow();
  }

  document.getElementById("add-combatant-row-button").addEventListener("click", function () {
      addCombatantRow();
  });

  document.getElementById("next-combatant-button").addEventListener("click", function () {
      NextCombatant();
  });

  // Load saved party members or create default rows
  const savedPartyMembers = JSON.parse(localStorage.getItem("partyMembers")) || [];
  if (savedPartyMembers.length > 0) {
      savedPartyMembers.forEach(member => {
          addPartyMemberRow(member.initiative, member.name, member.hp, member.ac);
      });
  } else {
      for (let i = 0; i < 4; i++) {
          addPartyMemberRow();
      }
  }
}


function addPartyMemberRow(initiative = "", name = "", hp = "", ac = "") {
  const partySection = document.getElementById("party-member-section");

  const newRow = document.createElement("div");
  newRow.classList.add("party-member-row");

  const inputs = [initiative, name, hp, ac];
  inputs.forEach((value, index) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = value;
      input.addEventListener("blur", function () {
          evaluateExpression(input);
          savePartyMembersToLocalStorage(); // Save when a field loses focus
      });
      newRow.appendChild(input);
  });

  const rollButton = document.createElement("button");
  rollButton.classList.add("icon-btn");
  rollButton.innerHTML = '<i class="fas fa-dice-d20"></i>';
  rollButton.addEventListener("click", function () {
      rollPartyMemberInitiative(this);
  });
  newRow.appendChild(rollButton);

  // Add click event to update statblock when a party member is clicked
  newRow.addEventListener("click", function () {
      const partyMemberName = newRow.getElementsByTagName("input")[1].value.trim(); // Get name input
      updateStatblockDisplay(partyMemberName);
  });

  partySection.appendChild(newRow);
}

function rollPartyMemberInitiative(rollButton) {
  const row = rollButton.parentElement;
  const inputs = row.getElementsByTagName("input");

  const initiative = inputs[0].value;
  const name = inputs[1].value;
  const hp = inputs[2].value;
  const ac = inputs[3].value;

  // Add a combatant row with the values from the party member row
  addCombatantRow(initiative, name, hp, ac);

  // Mark the row as linked to a party member
  row.dataset.linkedCombatant = name;

  // Hide the party member row
  row.style.display = "none";

  // Check if all party member rows are hidden
  const allHidden = [...document.querySelectorAll(".party-member-row")].every(row => row.style.display === "none");
  if (allHidden) {
      document.getElementById("party-member-section").style.display = "none";
  }
}

function savePartyMembersToLocalStorage() {
  const partyRows = document.querySelectorAll(".party-member-row");
  const partyData = [];

  partyRows.forEach(row => {
      const inputs = row.getElementsByTagName("input");
      const rowData = {
          initiative: inputs[0].value,
          name: inputs[1].value,
          hp: inputs[2].value,
          ac: inputs[3].value
      };
      partyData.push(rowData);
  });

  localStorage.setItem("partyMembers", JSON.stringify(partyData));
}



function addCombatantRow(initiative = "", name = "", hp = "", ac = "") {
  const trackerContent = document.getElementById("initiative-tracker-content");
  let finalInitiative = "";

  if (initiative !== "")
    { 
  // Remove any row that has an empty input field
  const existingRows = trackerContent.getElementsByClassName("initiative-tracker-combatant-row");
  for (let i = existingRows.length - 1; i >= 0; i--) {
    const inputs = existingRows[i].getElementsByTagName("input");
    if ([...inputs].every(input => input.value.trim() === "")) {
      trackerContent.removeChild(existingRows[i]);
      break;
    }
  }
  
    for (let i = 0; i < existingRows.length; i++) {
      const existingNameInput = existingRows[i].getElementsByTagName("input")[1]; // Getting the 'name' input field
      if (existingNameInput && existingNameInput.value === name) { // Checking if name matches
        finalInitiative = existingRows[i].getElementsByTagName("input")[0].value; // Use the same initiative
        break;
      }
      else{

  // Calculate initiative value
  const randomRoll = Math.floor(Math.random() * 20) + 1; // Random number between 1 and 20
  finalInitiative = initiative ? randomRoll + parseInt(initiative, 10) : randomRoll;
  const message = `1d20${initiative >= 0 ? '+' : ''}${initiative}: ${finalInitiative}`; // Replace this line
  showSnackbar(message);
      }
    }
  
  }

  // Create a new combatant row
  const newRow = document.createElement("div");
  newRow.classList.add("initiative-tracker-combatant-row");

  // Create and append input fields
  const inputs = [finalInitiative, name, hp, ac];
  inputs.forEach((value, index) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.addEventListener("blur", function () {
      evaluateExpression(input);
      sortCombatantRows(); // Trigger sorting after input loses focus
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        input.blur(); // Deselect input on Enter key press
      }
    });
    newRow.appendChild(input);
  });

  // Add delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("icon-btn");
  deleteButton.innerHTML = '<i class="fas fa-x"></i>';
  deleteButton.addEventListener("click", function () {
      deleteCombatantRow(newRow);
  });
  newRow.appendChild(deleteButton);

  newRow.addEventListener("click", function () {
    updateStatblockDisplay(name);
});

  // Append the new row to the tracker content
  trackerContent.appendChild(newRow);
  sortCombatantRows();
}

function deleteCombatantRow(row) {
  const nameInput = row.getElementsByTagName("input")[1]; // Get the name field
  const name = nameInput ? nameInput.value : "";

  // Check if this combatant originated from a party member row
  const partyRows = document.querySelectorAll(".party-member-row");
  for (let partyRow of partyRows) {
      if (partyRow.dataset.linkedCombatant === name) {
          // Unhide the party member row
          partyRow.style.display = "grid";
          document.getElementById("party-member-section").style.display = "block";

          // Update HP field in party member row
          const partyInputs = partyRow.getElementsByTagName("input");
          partyInputs[2].value = row.getElementsByTagName("input")[2].value;

          // Remove linkage
          delete partyRow.dataset.linkedCombatant;
          break;
      }
  }


  // Remove the combatant row
  row.parentElement.removeChild(row);
  sortCombatantRows();
}


function evaluateExpression(input) {
  try {
      const result = new Function('return ' + input.value)();
      if (!isNaN(result)) {
          input.value = result;
      }
  } catch (e) {
      // Ignore errors and keep the input as is
  }
}

function sortCombatantRows() {
  const trackerContent = document.getElementById("initiative-tracker-content");
  const rows = Array.from(trackerContent.getElementsByClassName("initiative-tracker-combatant-row"));

  rows.sort((a, b) => {
      const initiativeA = parseInt(a.getElementsByTagName("input")[0].value) || 0;
      const initiativeB = parseInt(b.getElementsByTagName("input")[0].value) || 0;
      return initiativeB - initiativeA; // Sort descending (highest first)
  });

  rows.forEach(row => trackerContent.appendChild(row));
}

function NextCombatant() {
  const combatantRows = document.querySelectorAll(".initiative-tracker-combatant-row");
  if (combatantRows.length === 0) return;

  let activeRow = document.querySelector(".initiative-tracker-combatant-row.active-row");
  let newActiveRow;
  
  if (activeRow) {
      activeRow.classList.remove("active-row");
      newActiveRow = activeRow.nextElementSibling || combatantRows[0]; // Move to the next row, or loop back to the first
  } else {
      newActiveRow = combatantRows[0]; // Default to the first combatant if none is active
  }

  newActiveRow.classList.add("active-row");

  // Get the combatant name from the second column (assuming structure remains the same)
  const newActiveName = newActiveRow.getElementsByTagName("input")[1].value;

  // Update the statblock display with the active combatant
  updateStatblockDisplay(newActiveName);
}


function rerollCombatants() {
  // Select all combatant rows
  const combatantRows = document.querySelectorAll('.initiative-tracker-combatant-row');

  combatantRows.forEach(row => {
      // Find the first input element inside the row
      const firstInput = row.querySelector('input');

      // Check if the input exists and is not empty
      if (firstInput && firstInput.value.trim() !== '') {
          // Generate a random number between 1 and 20
          const randomNumber = Math.floor(Math.random() * 20) + 1;

          // Assign the random number to the input field
          firstInput.value = randomNumber;
      }
  });
  sortCombatantRows();
}

async function updateStatblockDisplay(combatantName) {
  if (!combatantName) return;

  // Fetch the list of party members from the DOM
  const partyRows = document.querySelectorAll(".party-member-row input:nth-child(2)"); // Second input is the name
  const partyMemberNames = Array.from(partyRows).map(input => input.value.trim()).filter(name => name);
  let content = "";


  if (customMonsters.includes(combatantName)) {
      content = localStorage.getItem(`${combatantName}.md`) || "No content available.";
  } else {
      try {
          const response = await fetch(`campaign-notebook/Monsters/${combatantName}.md`);
          if (!response.ok) throw new Error();
          content = await response.text();
      } catch (error) {
          content = "Error loading monster content.";
      }
  }

  // Parse Markdown into HTML using `marked.js`
  document.getElementById("statblock-content").innerHTML = processHtmlContent(marked.parse(content), content);
}
5
