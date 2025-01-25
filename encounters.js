// encounters.js

// Display the encounter details
function displayEncounter(encounter) {
    activeEncounter = encounter; // Update the active encounter
    const encounterName = document.getElementById("encounter-name");
    const encounterContent = document.getElementById("encounter-content");
    const editButton = document.getElementById("edit-encounter");
    const confirmButton = document.getElementById("confirm-edit-encounter");
    const encounterEditTextArea = document.getElementById("encounter-edit-content");
  
    // Set the encounter name
    encounterName.textContent = encounter.name;
  
    // Render the content using Marked.js
    encounterContent.innerHTML = marked.parse(encounter.content);
  
    // Populate the creatures for this encounter
    populateCreatures(encounter.creatures);
  
    // Automatically load the first creature into the statblock
    if (encounter.creatures.length > 0) {
      displayCreature(encounter.creatures[0]);
    }
  
    // Reset buttons visibility
    editButton.classList.remove("hidden");
    confirmButton.classList.add("hidden");
    encounterEditTextArea.classList.add("hidden");
    encounterContent.classList.remove("hidden");
  
    // Attach edit functionality
    editButton.onclick = () => enableMarkdownEditor(encounter);
  }
  
  
  // Enable markdown editing for encounter content
// Enable markdown editing for encounter content
// Enable markdown editing for encounter content
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
  
    // Add keyboard shortcuts for markdown formatting (if not already added)
    if (!encounterEditTextArea.dataset.listenerAdded) {
      encounterEditTextArea.dataset.listenerAdded = true; // Mark as added
      encounterEditTextArea.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "b") {
          e.preventDefault(); // Prevent the default behavior
          wrapSelectedText(encounterEditTextArea, "**"); // Add ** for bold
        } else if (e.ctrlKey && e.key === "i") {
          e.preventDefault(); // Prevent the default behavior
          wrapSelectedText(encounterEditTextArea, "*"); // Add * for italics
        }
      });
    }
  
    // Clear existing listeners to avoid stacking
    confirmButton.replaceWith(confirmButton.cloneNode(true));
    const newConfirmButton = document.getElementById("confirm-edit-encounter");
  
    // Handle confirming the edit
    newConfirmButton.addEventListener("click", () => {
      encounter.content = encounterEditTextArea.value;
      encounterContentDiv.innerHTML = marked.parse(encounter.content);
      newConfirmButton.classList.add("hidden");
      editButton.classList.remove("hidden");
      encounterContentDiv.classList.remove("hidden");
      encounterEditTextArea.classList.add("hidden");
      saveNotebooksToLocalStorage(); // Save changes
    });
  }
    
  // Helper function to wrap selected text with markdown symbols
  function wrapSelectedText(textArea, wrapper) {
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
  
    // Wrap the selected text
    const before = textArea.value.substring(0, start);
    const after = textArea.value.substring(end);
    textArea.value = `${before}${wrapper}${selectedText}${wrapper}${after}`;
  
    // Restore selection to include the wrapping
    textArea.setSelectionRange(start + wrapper.length, end + wrapper.length);
    textArea.focus();
  }
  
  
  // Show the field to add a new encounter
  function showAddEncounterField(locationIdx) {
    const locationsList = document.getElementById("locations-list");
    const addEncounterContainer = document.createElement("div");
    addEncounterContainer.innerHTML = `
      <input type="text" placeholder="New Encounter Name" id="new-encounter-name-${locationIdx}">
      <button id="confirm-add-encounter-${locationIdx}">✔</button>
    `;
    locationsList.children[locationIdx].appendChild(addEncounterContainer);
  
    const confirmAddEncounterBtn = document.getElementById(`confirm-add-encounter-${locationIdx}`);
    confirmAddEncounterBtn.addEventListener("click", () => {
      const newEncounterName = document.getElementById(`new-encounter-name-${locationIdx}`).value.trim();
      if (newEncounterName) {
        notebook.locations[locationIdx].encounters.push({
          name: newEncounterName,
          content: "New encounter content.",
          creatures: []
        });
        populateLocations();
        saveNotebooksToLocalStorage(); // Save changes
      } else {
        showNotification("Please enter a valid encounter name.");
      }
    });
  }
  