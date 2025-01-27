// Main Initialization
window.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  // Handles overall app setup on page load
  loadAllNotebooks(); // notebook.js
  initializeTracker(); // initiative-tracker.js
  bindGlobalEventListeners(); // main.js
}

function bindGlobalEventListeners() {
  // Sets up event listeners for global actions

  // Save notebook button
  document.getElementById("save-notebook").addEventListener("click", () => {
    saveAllNotebooks(); // notebook.js
  });

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
}
