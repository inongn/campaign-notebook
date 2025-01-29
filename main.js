// Main Initialization
window.addEventListener("DOMContentLoaded", initializeApp);
let undoStack = [];
let redoStack = [];

function initializeApp() {
  // Handles overall app setup on page load
  loadAllNotebooks(); // notebook.js
  initializeTracker(); // initiative-tracker.js
  bindGlobalEventListeners(); // main.js
}

function bindGlobalEventListeners() {
  // Sets up event listeners for global actions


  // Edit mode toggle
  document.getElementById("edit-mode-toggle").addEventListener("change", (e) => {
    toggleEditMode(e.target.checked); // ui-helpers.js
  });

  // Notebook selection dropdown
  document.getElementById("notebook-select").addEventListener("change", (e) => {
    const selectedValue = e.target.value;
  
    if (selectedValue === "add-new") {
      showModal({
        message: "Enter a name for the new notebook:",
        showInput: true,
        onConfirm: (newName) => {
          if (!newName) {
            showNotification("Notebook name cannot be empty."); // ui-helpers.js
            return;
          }
          createDefaultNotebook(newName); // Pass the provided name to create the notebook
        },
      });
    } else {
      setActiveNotebook(selectedValue); // Switch to the selected notebook
    }
  });
  

  // Rename notebook button
  document.getElementById("rename-notebook").addEventListener("click", () => {
    showModal({ //ui-helpers.js
      message: "Enter new notebook name:",
      showInput: true,
      onConfirm: (newName) => renameNotebook(notebook.id, newName), // notebook.js
    });
  });

  // Delete notebook button
  document.getElementById("delete-notebook").addEventListener("click", () => {
    showModal({ //ui-helpers.js
      message: "Are you sure you want to delete this notebook?",
      onConfirm: () => deleteNotebook(notebook.id), // notebook.js
    });
  });

  // YAML Import button
  document.getElementById("load-yaml").addEventListener("click", importYAML); // notebook.js

  // YAML Export button
  document.getElementById("save-yaml").addEventListener("click", exportYAML); // notebook.js

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.key === "y") {
      e.preventDefault();
      redo();
    }
  });
}

// Save the current state to the undo stack
function saveState() {
  undoStack.push(structuredClone(notebook)); // Save a deep copy of the notebook
  redoStack = []; // Clear redo stack on new change
}

// Undo the last action
function undo() {
  if (undoStack.length > 0) {
    redoStack.push(structuredClone(notebook)); // Save current state to redo stack
    notebook = undoStack.pop(); // Restore the last state
    refreshUI();
    showNotification("Undo performed.");
  } else {
    showNotification("Nothing to undo.");
  }
}

// Redo the last undone action
function redo() {
  if (redoStack.length > 0) {
    undoStack.push(JSON.stringify(notebook)); // Save current state to undo stack
    notebook = JSON.parse(redoStack.pop()); // Restore the next state
    refreshUI(); // Update the UI to reflect the restored state
    showNotification("Redo performed.");
  } else {
    showNotification("Nothing to redo.");
  }
}

document.addEventListener("keydown", (e) => {
  // Check for "Ctrl+E"
  if (e.ctrlKey && e.key.toLowerCase() === "e") {
    e.preventDefault(); // Prevent the default browser behavior

    const editModeToggle = document.getElementById("edit-mode-toggle");
    if (editModeToggle) {
      editModeToggle.checked = !editModeToggle.checked; // Toggle the checkbox state
      toggleEditMode(editModeToggle.checked); // Call the toggleEditMode function
    }
  }
});
