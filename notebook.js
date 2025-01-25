// notebook.js

// Default notebook structure
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
  
  // Save the current notebook to localStorage
  function saveNotebookToLocalStorage() {
    const notebookData = JSON.stringify(notebook);
    localStorage.setItem("notebook", notebookData);
    showNotification("Notebook saved successfully!");
  }
  
  // Load the notebook from localStorage
  function loadNotebookFromLocalStorage() {
    const notebookData = localStorage.getItem("notebook");
    if (notebookData) {
      try {
        notebook = JSON.parse(notebookData);
        populateLocations(); // Refresh the locations UI
        showNotification("Notebook loaded successfully!");
      } catch (e) {
        showNotification("Failed to load notebook!");
      }
    } else {
      showNotification("No notebook found!");
    }
  }
  
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
  
  // Populate the notebook dropdown menu
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
  
  // Handle notebook selection from the dropdown
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
  
  // Rename the current notebook
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
  
  // Delete the current notebook
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
  
  // Initialize the notebook dropdown and load the first notebook
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
  
  // notebook.js

// Import YAML file and load its contents into the notebook
function importYAML() {
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
          saveNotebooksToLocalStorage(); // Save the updated notebook to localStorage
          showNotification("Notebook imported successfully!");
        } catch (e) {
          showNotification("Failed to import YAML. Please check the file format.");
        }
      }
    });
  
    fileInput.click(); // Trigger the file input dialog
  }
  
  // Export the current notebook as a YAML file
  function exportYAML() {
    const yamlData = jsyaml.dump(notebook, { indent: 2 }); // Convert notebook to YAML
    const blob = new Blob([yamlData], { type: "application/x-yaml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${notebook.name || "notebook"}.yaml`; // Default file name
    link.click(); // Trigger the download
    URL.revokeObjectURL(link.href); // Clean up the URL object
  }
  
  // Add event listeners for Import and Export YAML buttons
  document.getElementById("load-yaml").addEventListener("click", importYAML);
  document.getElementById("save-yaml").addEventListener("click", exportYAML);
  