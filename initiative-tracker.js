// initiative-tracker.js

// DOM Elements
const initiativeTrackerGrid = document.getElementById("initiative-tracker-grid");
const addRowButton = document.getElementById("add-row");


// Create the "active combatant" button in the header row
const activeCombatantButton = document.createElement("button");
activeCombatantButton.classList.add("icon-btn", "tracker-btn");
activeCombatantButton.innerHTML = `<i class="fas fa-forward-step"></i>`;
initiativeTrackerGrid.prepend(activeCombatantButton); // Add it to the beginning of the grid

// Initialize active combatant index
let activeCombatantIndex = -1;

// Add click event listener for the active combatant button
activeCombatantButton.addEventListener("click", () => {
  highlightActiveCombatant();
});


// Initialize the tracker with a default number of rows
function initializeTracker(rows=1) {
  for (let i = 0; i < rows; i++) {
    addRow();
  }

  // Attach event listeners for adding rows
  addRowButton.addEventListener("click", () => addRow());
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
        initiative: creature.initiative || "",
        name: creature.name || "",
        hp: creature.hp || "",
        ac: creature.ac || ""
      }
    : defaultValues;

  // Remove an empty row if a creature is provided
  if (creature) {
    const rows = Array.from(initiativeTrackerGrid.children).slice(5); // Skip header cells
    for (let i = 0; i < rows.length; i += 5) { // Iterate over rows (5 cells per row)
      const row = rows.slice(i, i + 5);
      const isEmpty = row.slice(0, 4).every((cell) => cell.value.trim() === "");
      if (isEmpty) {
        row.forEach((cell) => cell.remove()); // Remove the row
        break; // Only remove the first empty row
      }
    }
  }

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
            // Evaluate the arithmetic expression
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
  removeButton.classList.add("icon-btn", "trash"); // Add the "trash" style
  removeButton.innerHTML = `<i class="fas fa-trash"></i>`;
  
  // Remove the entire row when clicked
  removeButton.addEventListener("click", () => {
    removeCombatantRow(removeButton);
  });

  initiativeTrackerGrid.appendChild(removeButton);

  // Sort rows after adding the new creature
  sortTrackerRows();
}


// Function to remove a combatant row
function removeCombatantRow(button) {
  // Find the index of the row containing the clicked button
  const allCells = Array.from(initiativeTrackerGrid.children);
  const buttonIndex = allCells.indexOf(button);

  // Remove the entire row (5 elements: 4 inputs + 1 button)
  for (let i = 0; i < 5; i++) {
    allCells[buttonIndex - (4 - i)].remove();
  }
}

// Function to sort rows by initiative (#) column
function sortTrackerRows() {
  const combatantCells = Array.from(initiativeTrackerGrid.children).slice(5); // Skip header cells

  // Group combatant cells into rows of 5 (4 inputs + 1 button per row)
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
}

// Debounce timer for sorting
let sortTimeout;

// Attach sorting on input changes
initiativeTrackerGrid.addEventListener("input", (e) => {
  if (e.target.closest("input")) {
    clearTimeout(sortTimeout); // Clear previous timer
    sortTimeout = setTimeout(() => sortTrackerRows(), 300); // Debounce sorting
  }
});

function highlightActiveCombatant() {
  const rows = Array.from(initiativeTrackerGrid.children).slice(5); // Skip header cells
  const combatantRows = [];

  // Group rows into sets of 5 (4 inputs + 1 button per combatant)
  for (let i = 0; i < rows.length; i += 5) {
    combatantRows.push(rows.slice(i, i + 5));
  }

  // Remove highlight from all rows
  combatantRows.forEach((row) => {
    row.forEach((cell) => {
      cell.style.backgroundColor = ""; // Reset background color
    });
  });

  // Move to the next combatant
  activeCombatantIndex = (activeCombatantIndex + 1) % combatantRows.length;

  // Highlight the current combatant row
  combatantRows[activeCombatantIndex].forEach((cell) => {
    cell.style.backgroundColor = "#F3F3F3";
  });
}
