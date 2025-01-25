// locations.js

// Populate the locations list in the UI
function populateLocations() {
    const locationsList = document.getElementById("locations-list");
    locationsList.innerHTML = "";
    const isEditMode = document.getElementById("edit-mode-toggle").checked;
  
    notebook.locations.forEach((location, locationIdx) => {
      const locationItem = document.createElement("li");
      locationItem.innerHTML = `<strong>${location.name}</strong>`;
  
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
        addEncounterBtn.classList.add("icon-btn");
        addEncounterBtn.classList.add("add");
        addEncounterBtn.innerHTML = `<i class="fas fa-plus"></i>`;
        addEncounterBtn.addEventListener("click", () => showAddEncounterField(locationIdx));
        locationItem.appendChild(addEncounterBtn);
  
        const removeButton = document.createElement("button");
        removeButton.classList.add("icon-btn");
        removeButton.classList.add("trash");
        removeButton.innerHTML = `<i class="fas fa-trash"></i>`;
        removeButton.addEventListener("click", () => {
          notebook.locations.splice(locationIdx, 1); // Remove the location
          populateLocations();
          saveNotebooksToLocalStorage(); // Save changes
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
          removeEncounterButton.innerHTML = `<i class="fas fa-trash"></i>`;
          removeEncounterButton.classList.add("icon-btn");
          removeEncounterButton.classList.add("trash");
          removeEncounterButton.style.marginLeft = "10px";
          removeEncounterButton.addEventListener("click", () => {
            notebook.locations[locationIdx].encounters.splice(encounterIdx, 1); // Remove the encounter
            populateLocations();
            saveNotebooksToLocalStorage(); // Save changes
          });
          encounterItem.appendChild(removeEncounterButton);
        }
  
        encounterItem.addEventListener("click", () => displayEncounter(encounter));
        encountersList.appendChild(encounterItem);
      });
  
      // Add drag-and-drop listeners for the location
      locationItem.addEventListener("dragover", (e) => e.preventDefault());
      locationItem.addEventListener("drop", (e) => {
        const draggedIndex = e.dataTransfer.getData("location-index");
        if (draggedIndex !== undefined) {
          const draggedLocation = notebook.locations.splice(draggedIndex, 1)[0];
          notebook.locations.splice(locationIdx, 0, draggedLocation);
          populateLocations(); // Refresh the list
        }
      });
  
      // Add drag-and-drop listeners for encounters
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

    if (isEditMode) {
        // Add "New Location" button
        const addLocationButton = document.createElement("i");
        addLocationButton.classList.add("fas", "fa-plus");
        addLocationButton.style.color = "green";
        addLocationButton.style.cursor = "pointer";
        addLocationButton.style.textAlign = "center";
        addLocationButton.style.marginLeft = "10px";
        
        addLocationButton.addEventListener("click", () => {
            const addLocationContainer = document.getElementById("add-location-container");
            addLocationContainer.classList.remove("hidden");
        
        });
    
        locationsList.appendChild(addLocationButton);
  }}
  
  // Show the field to add a new encounter
  function showAddEncounterField(locationIdx) {
    const locationsList = document.getElementById("locations-list");
    const addEncounterContainer = document.createElement("div");
    addEncounterContainer.innerHTML = `
      <input type="text" placeholder="New Encounter Name" id="new-encounter-name-${locationIdx}">
<button id="confirm-add-encounter-${locationIdx}" class="icon-btn check">
  <i class="fas fa-check"></i>
</button>
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
      saveNotebooksToLocalStorage(); // Save changes
    });
  }
  
  
  // Confirm add location button event listener
  document.getElementById("confirm-add-location").addEventListener("click", () => {
    const newLocationName = document.getElementById("new-location-name").value.trim();
    if (newLocationName) {
      const newLocation = {
        name: newLocationName,
        encounters: []
      };
      notebook.locations.push(newLocation);
      document.getElementById("new-location-name").value = "";
      document.getElementById("add-location-container").classList.add("hidden");
      populateLocations();
      saveNotebooksToLocalStorage(); // Save changes
    }
  });
  