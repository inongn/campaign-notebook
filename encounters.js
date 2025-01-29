// Encounter Management

function populateEncounter(encounter) {
  activeEncounter = encounter; // Update the active encounter
  const encounterName = document.getElementById("encounter-name");
  const encounterContent = document.getElementById("encounter-content");
  const editButton = document.getElementById("edit-encounter");
  const confirmButton = document.getElementById("confirm-edit-encounter");
  const encounterEditTextArea = document.getElementById("encounter-edit-content");

  // Set the encounter name
  encounterName.textContent = encounter.name;

  // Step 1: Render the content using Marked.js to apply Markdown
  const renderedMarkdown = marked.parse(encounter.content);

  // Step 2: Process the rendered Markdown for cross-notebook links
  encounterContent.innerHTML = generateLinkedContent(renderedMarkdown);

  // Populate the creatures for this encounter
  populateCreatures(encounter); // Pass the active encounter

  // Automatically load the first creature into the statblock
  if (encounter.creatures.length > 0) {
    populateStatblock(encounter.creatures[0],encounter);
  }

  // Reset buttons visibility
  confirmButton.classList.add("hidden");
  encounterEditTextArea.classList.add("hidden");
  encounterContent.classList.remove("hidden");

  // Attach edit functionality
  editButton.onclick = () => enableMarkdownEditor(encounter);
}


// Enable markdown editing for encounter content
function enableMarkdownEditor(encounter) {
  const editButton = document.getElementById("edit-encounter");
  const confirmButton = document.getElementById("confirm-edit-encounter");
  const encounterContent = document.getElementById("encounter-content");
  const encounterEditTextArea = document.getElementById("encounter-edit-content");

  // Switch to edit mode
  editButton.classList.add("hidden");
  confirmButton.classList.remove("hidden");
  encounterContent.classList.add("hidden");
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
    saveState();

    encounter.content = encounterEditTextArea.value;
    // Step 1: Render the content using Marked.js to apply Markdown
    const renderedMarkdown = marked.parse(encounter.content);

    // Step 2: Process the rendered Markdown for cross-notebook links
    encounterContent.innerHTML = generateLinkedContent(renderedMarkdown);
    newConfirmButton.classList.add("hidden");
    editButton.classList.remove("hidden");
    encounterContent.classList.remove("hidden");
    encounterEditTextArea.classList.add("hidden");
    saveAllNotebooks(); // notebook.js
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
  

  function generateLinkedContent(content) {
    // Iterate through all locations, encounters, and creatures to find matches
    notebook.locations.forEach((location) => {
      location.encounters.forEach((encounter) => {
        // Link to encounter
        const encounterRegex = new RegExp(`\\b${encounter.name}\\b`, "g");
        content = content.replace(encounterRegex, (match) => {
          return `<a href="#" class="link" data-type="encounter" data-name="${encounter.name}">${match}</a>`;
        });
  
        // Link to creatures
        encounter.creatures.forEach((creature) => {
          const creatureRegex = new RegExp(`\\b${creature.name}\\b`, "g");
          content = content.replace(creatureRegex, (match) => {
            return `<a href="#" class="link" data-type="creature" data-name="${creature.name}">${match}</a>`;
          });
        });
      });
    });
  
    // Add event listeners to the generated links
    setTimeout(() => {
      const links = document.querySelectorAll(".link");
      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const type = link.getAttribute("data-type");
          const name = link.getAttribute("data-name");
  
          if (type === "encounter") {
            const encounter = findEncounterByName(name);
            if (encounter) populateEncounter(encounter);
          } else if (type === "creature") {
            const creature = findCreatureByName(name);
            if (creature) populateStatblock(creature);
          }
        });
      });
    }, 0);
  
    return content;
  }
  
  function findEncounterByName(name) {
    for (const location of notebook.locations) {
      for (const encounter of location.encounters) {
        if (encounter.name === name) return encounter;
      }
    }
    return null; // Return null if no match is found
  }
  
  function findCreatureByName(name) {
    for (const location of notebook.locations) {
      for (const encounter of location.encounters) {
        for (const creature of encounter.creatures) {
          if (creature.name === name) return creature;
        }
      }
    }
    return null; // Return null if no match is found
  }
  