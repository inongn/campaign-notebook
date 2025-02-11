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
    if ([...inputs].some(input => input.value.trim() === "")) {
      trackerContent.removeChild(existingRows[i]);
      break;
    }
  }

  // Calculate initiative value
  const randomRoll = Math.floor(Math.random() * 20) + 1; // Random number between 1 and 20
  finalInitiative = initiative ? randomRoll + parseInt(initiative, 10) : randomRoll;
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
    trackerContent.removeChild(newRow);
    sortCombatantRows(); // Re-sort after deletion
  });
  newRow.appendChild(deleteButton);

  // Append the new row to the tracker content
  trackerContent.appendChild(newRow);
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

function NextCombatant(){
  const rows = Array.from(document.getElementsByClassName("initiative-tracker-combatant-row"));
  const activeIndex = rows.findIndex(row => row.classList.contains("active-row"));

  if (activeIndex === -1) {
      // No active row, set the first row as active
      if (rows.length > 0) {
          rows[0].classList.add("active-row");
      }
  } else {
      // Remove active class from current row
      rows[activeIndex].classList.remove("active-row");
      // Move to the next row or wrap back to the first
      const nextIndex = (activeIndex + 1) % rows.length;
      rows[nextIndex].classList.add("active-row");
  }
}