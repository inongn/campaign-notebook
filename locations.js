// Location Management

function populateLocations() {
  const locationsList = document.getElementById("locations-list"); // Assuming there is a list element in the UI
  locationsList.innerHTML = ""; // Clear the current list
  const isEditMode = document.getElementById("edit-mode-toggle").checked;

  notebook.locations.forEach((location, locationIdx) => {
    const locationItem = document.createElement("li");
    
    locationItem.className = "location-item";

    // Create a container for the location header (draggable area)
    const locationHeader = document.createElement("div");
    locationHeader.className = "location-header"; // Add a class for styling
    locationHeader.innerHTML = `<strong>${location.name}</strong>`;
    locationItem.appendChild(locationHeader);

    // Add "+" and "-" buttons
    const addEncounterBtn = document.createElement("button");
    addEncounterBtn.classList.add("icon-btn");
    addEncounterBtn.classList.add("add");
    addEncounterBtn.classList.add("edit-mode");
    addEncounterBtn.classList.add("hidden");
    addEncounterBtn.innerHTML = `<i class="fas fa-plus"></i>`;
    addEncounterBtn.addEventListener("click", () => showAddEncounterField(locationIdx));
    locationHeader.appendChild(addEncounterBtn);

    const removeLocationBtn = document.createElement("button");
    removeLocationBtn.classList.add("icon-btn");
    removeLocationBtn.classList.add("trash");
    removeLocationBtn.classList.add("edit-mode");
    removeLocationBtn.classList.add("hidden");
    removeLocationBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    removeLocationBtn.addEventListener("click", () => deleteLocation(locationIdx));
    locationHeader.appendChild(removeLocationBtn);


    // Attach event listener for selecting a location
    const encountersList = document.createElement("ul");
  
    location.encounters.forEach((encounter, encounterIdx) => {
      const encounterItem = document.createElement("li");
      encounterItem.textContent = encounter.name;
      encounterIdx = encounterIdx;
      encounterItem.addEventListener("click", () => populateEncounter(encounter));
      
      const removeEncounterBtn = document.createElement("button");
      removeEncounterBtn.classList.add("icon-btn");
      removeEncounterBtn.classList.add("trash");
      removeEncounterBtn.classList.add("edit-mode");
      removeEncounterBtn.classList.add("hidden");
      removeEncounterBtn.innerHTML = `<i class="fas fa-trash"></i>`;
      removeEncounterBtn.addEventListener("click", () => deleteEncounter(locationIdx, encounterIdx));
      encounterItem.appendChild(removeEncounterBtn);

      encountersList.appendChild(encounterItem);
    });



    locationItem.appendChild(encountersList);
    locationsList.appendChild(locationItem);
  });

  const addLocationButton = document.createElement("button");
  addLocationButton.classList.add("icon-btn");
  addLocationButton.classList.add("add");
  addLocationButton.classList.add("edit-mode");
  addLocationButton.classList.add("hidden");
  addLocationButton.innerHTML = `<i class="fas fa-plus"></i>`;
  addLocationButton.addEventListener("click", () => showAddLocationField());
  locationsList.appendChild(addLocationButton);
  
// Enable SortableJS for locations
 Sortable.create(locationsList, {
    animation: 150,
    handle: ".location-header", // Make the entire header area draggable
    onStart: function () {
      saveState(); // Save state before dragging begins
    },
    onEnd: function (evt) {
      const [movedLocation] = notebook.locations.splice(evt.oldIndex, 1);
      notebook.locations.splice(evt.newIndex, 0, movedLocation);
      saveAllNotebooks(); // Save the new order
      refreshUI(); // Update the UI
    }
  });

// Enable SortableJS for encounters within each location
notebook.locations.forEach((location, locationIdx) => {
  const encountersList = document.querySelectorAll("#locations-list ul")[locationIdx];
  if (encountersList) {
    Sortable.create(encountersList, {
      animation: 150,
      handle: "li", // Make the entire <li> draggable for encounters
      onStart: function () {
        saveState(); // Save state before dragging begins
      },
      onEnd: function (evt) {
        const [movedEncounter] = location.encounters.splice(evt.oldIndex, 1);
        location.encounters.splice(evt.newIndex, 0, movedEncounter);
        saveAllNotebooks(); // Save the new order
        refreshUI(); // Update the UI
      }
    });
  }
});


  toggleEditMode(isEditMode);
}

function showAddLocationField() {
  saveState();

  const locationsList = document.getElementById("locations-list");
  const addLocationContainer = document.createElement("div");
  addLocationContainer.innerHTML = `
    <input type="text" placeholder="New Location Name" id="new-location-name">
<button id="confirm-add-location" class="icon-btn check">
<i class="fas fa-check"></i>
</button>
  `;
  locationsList.appendChild(addLocationContainer);

  const confirmAddLocationBtn = document.getElementById(`confirm-add-location`);
  confirmAddLocationBtn.addEventListener("click", () => {
    const newLocationName = document.getElementById(`new-location-name`).value;
    notebook.locations.push({
      name: newLocationName,
      encounters: []
    });
    saveAllNotebooks(); // notebook.js
    populateLocations();
    showNotification(`Location "${newLocationName}" added successfully.`); // ui-helpers.js

  });
}

function showAddEncounterField(locationIdx) {
  saveState();
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
    const encounterPos = notebook.locations[locationIdx].encounters.push({
      name: newEncounterName,
      content: "New encounter content.",
      creatures: []
    });
    saveAllNotebooks(); // notebook.js
    populateLocations();
    populateEncounter(notebook.locations[locationIdx].encounters[encounterPos-1]);
    showNotification(`Encounter "${newEncounterName}" added successfully.`); // ui-helpers.js
  });
}

// Delete a location and its associated encounters
function deleteLocation(locationId) {
  saveState();

  const location = notebook.locations[locationId];
  if (!location) {
    showNotification("Invalid location ID."); // ui-helpers.js
    return;
  }

  notebook.locations.splice(locationId, 1); // Remove the location
  saveAllNotebooks(); // notebook.js
  populateLocations(); // Refresh the UI with the updated locations
  showNotification(`Location "${location.name}" deleted successfully.`); // ui-helpers.js
}

// Delete a location and its associated encounters
function deleteEncounter(locationIdx, encounterIdx) {
  saveState();

  const encounter = notebook.locations[locationIdx].encounters[encounterIdx];
  if (!encounter) {
    showNotification("Invalid location ID."); // ui-helpers.js
    return;
  }

  notebook.locations[locationIdx].encounters.splice(encounterIdx, 1); // Remove the location
  saveAllNotebooks(); // notebook.js
  populateLocations(); // Refresh the UI with the updated locations
  showNotification(`Encounter "${encounter.name}" deleted successfully.`); // ui-helpers.js
}
