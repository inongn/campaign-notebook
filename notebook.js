// Notebook Management

// Default Notebook Structure
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

// Load all notebooks from localStorage or create a default one
function loadAllNotebooks() {
  const notebooks = loadFromLocalStorage("notebooks");
  if (notebooks && Object.keys(notebooks).length > 0) {
    setActiveNotebook(Object.keys(notebooks)[0]); // Load the first notebook
    updateNotebookDropdown(); // Refresh the dropdown
    populateLocations(); // Update the UI to reflect the active notebook

  } else {
    createDefaultNotebook();
  }
}

// Save all notebooks to localStorage
function saveAllNotebooks() {
  const notebooks = loadFromLocalStorage("notebooks") || {};
  notebooks[notebook.id] = notebook;
  saveToLocalStorage("notebooks", notebooks);
  showNotification("All notebooks saved successfully."); // ui-helpers.js
}

// Set the active notebook by its ID
function setActiveNotebook(notebookId) {
  const notebooks = loadFromLocalStorage("notebooks");
  if (notebooks && notebooks[notebookId]) {
    notebook = notebooks[notebookId];
    populateLocations(); // Update the UI to reflect the active notebook
    populateEncounter(notebook.locations[0].encounters[0]);

  } else {
    createDefaultNotebook(); // If no valid notebook found, create a default one
  }
}

// Create and save a default notebook
function createDefaultNotebook(notebookName = defaultNotebook.name) {
  const notebooks = loadFromLocalStorage("notebooks") || {};
  const newNotebookId = generateUUID(); // shared.js

  const newNotebook = {
    id: newNotebookId,
    name: notebookName,
    locations: [...defaultNotebook.locations], // Clone default locations
  };

  notebooks[newNotebookId] = newNotebook;
  saveToLocalStorage("notebooks", notebooks); // shared.js

  showNotification(`Notebook "${notebookName}" created successfully.`); // ui-helpers.js
  setActiveNotebook(newNotebookId); // Set the new notebook as active
  updateNotebookDropdown(); // Refresh the dropdown

}

// Rename the current notebook
function renameNotebook(notebookId, newName) {
  const notebooks = loadFromLocalStorage("notebooks");
  if (!notebooks) return;

  if (Object.values(notebooks).some((n) => n.name === newName)) {
    showNotification("Notebook name already exists."); // ui-helpers.js
    return;
  }

  notebooks[notebookId].name = newName;
  saveToLocalStorage("notebooks", notebooks); // shared.js
  showNotification(`Notebook renamed to "${newName}".`); // ui-helpers.js
  updateNotebookDropdown(); // Refresh the dropdown
}

// Delete the current notebook
function deleteNotebook(notebookId) {
  const notebooks = loadFromLocalStorage("notebooks");
  if (!notebooks || !notebooks[notebookId]) return;

  delete notebooks[notebookId];
  saveToLocalStorage("notebooks", notebooks); // shared.js

  showNotification("Notebook deleted successfully."); // ui-helpers.js

  if (Object.keys(notebooks).length > 0) {
    setActiveNotebook(Object.keys(notebooks)[0]); // Load another notebook
  } else {
    createDefaultNotebook(); // Create a new default notebook if none remain
  }

  updateNotebookDropdown(); // Refresh the dropdown
}


// Update the dropdown with notebook names
function updateNotebookDropdown() {
  const notebooks = loadFromLocalStorage("notebooks");
  const dropdown = document.getElementById("notebook-select");
  dropdown.innerHTML = ""; // Clear existing options

  if (notebooks) {
    for (const [id, notebook] of Object.entries(notebooks)) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = notebook.name;
      dropdown.appendChild(option);
    }
  }

    // Add the "Add Notebook" option
    const addOption = document.createElement("option");
    addOption.value = "add-new";
    addOption.textContent = "Add Notebook";
    addOption.style.fontStyle = "italic";
    dropdown.appendChild(addOption);

  // Set the dropdown to the current notebook if available
  dropdown.value = notebook?.id || "";
}

// Export the current notebook as a YAML file
function exportYAML() {
  if (!notebook) {
    showNotification("No active notebook to export."); // ui-helpers.js
    return;
  }

  try {
    const yamlData = jsyaml.dump(notebook); // Convert the notebook to YAML (js-yaml required)
    const blob = new Blob([yamlData], { type: "text/yaml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${notebook.name.replace(/\s+/g, "_").toLowerCase()}.yaml`;
    link.click();

    showNotification(`Notebook "${notebook.name}" exported successfully.`); // ui-helpers.js
  } catch (error) {
    console.error("Error exporting notebook as YAML:", error);
    showNotification("Failed to export notebook. Please try again."); // ui-helpers.js
  }
}

// Import a YAML file and load its contents as a new notebook
function importYAML() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".yaml,.yml";

  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
      showNotification("No file selected."); // ui-helpers.js
      return;
    }

    try {
      const fileContent = await file.text();
      const importedNotebook = jsyaml.load(fileContent); // Convert YAML to JSON (js-yaml required)

      if (!validateNotebook(importedNotebook)) {
        showNotification("Invalid notebook format."); // ui-helpers.js
        return;
      }

      const notebooks = loadFromLocalStorage("notebooks") || {};
      const newNotebookId = generateUUID(); // shared.js

      importedNotebook.id = newNotebookId; // Assign a unique ID to the new notebook
      notebooks[newNotebookId] = importedNotebook;
      saveToLocalStorage("notebooks", notebooks); // shared.js

      showNotification(`Notebook "${importedNotebook.name}" imported successfully.`); // ui-helpers.js
      updateNotebookDropdown(); // Refresh the dropdown
      setActiveNotebook(newNotebookId); // Set the imported notebook as active
    } catch (error) {
      console.error("Error importing YAML file:", error);
      showNotification("Failed to import notebook. Please ensure the file is valid."); // ui-helpers.js
    }
  });

  input.click();
}

// Helper: Validate the structure of an imported notebook
function validateNotebook(notebookData) {
  return (
    typeof notebookData === "object" &&
    notebookData.name &&
    Array.isArray(notebookData.locations) &&
    notebookData.locations.every(
      (location) =>
        typeof location.name === "string" &&
        Array.isArray(location.encounters)
    )
  );
}

