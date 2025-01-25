// main.js

// Global Variables
let notebook = {}; // Active notebook
let activeEncounter = null; // Tracks the currently active encounter

// Initialization logic
window.addEventListener("DOMContentLoaded", () => {
  // Load the first notebook or create a default one if none exist
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

  // Populate locations and notebook dropdown
  populateLocations();
  populateNotebookDropdown();

  // Automatically load the first encounter of the first location
  if (notebook.locations.length > 0 && notebook.locations[0].encounters.length > 0) {
    displayEncounter(notebook.locations[0].encounters[0]);
  }

  // Initialize the initiative tracker with default rows
  initializeTracker(3);

  // Set the edit mode to match the default toggle state
  const editModeToggle = document.getElementById("edit-mode-toggle");
  toggleEditMode(editModeToggle.checked);
});

// Event listener for toggling edit mode
document.getElementById("edit-mode-toggle").addEventListener("change", (e) => {
  toggleEditMode(e.target.checked); // Enable or disable edit mode

  // Refresh locations and creatures to reflect edit mode
  populateLocations();
  if (activeEncounter) {
    populateCreatures(activeEncounter.creatures);
  }
});

// Event listener for "Save Notebook" button
document.getElementById("save-notebook").addEventListener("click", () => {
  saveNotebooksToLocalStorage();
});

// Helper Functions

// Display a notification message
function showNotification(message) {
  const notificationArea = document.getElementById("notification-area");

  // Create a notification message element
  const notification = document.createElement("div");
  notification.className = "notification-message";
  notification.textContent = message;

  // Add the notification to the notification area
  notificationArea.appendChild(notification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Display a modal with optional input and confirmation
function showModal({ message, showInput = false, onConfirm }) {
  const modalContainer = document.getElementById("modal-container");
  const modalMessage = document.getElementById("modal-message");
  const modalInput = document.getElementById("modal-input");
  const confirmButton = document.getElementById("modal-confirm");
  const cancelButton = document.getElementById("modal-cancel");

  modalMessage.textContent = message;
  modalInput.value = "";
  modalInput.classList.toggle("hidden", !showInput);

  modalContainer.classList.remove("hidden");

  // Confirm action
  const handleConfirm = () => {
    modalContainer.classList.add("hidden");
    const inputValue = showInput ? modalInput.value.trim() : null;
    if (onConfirm) onConfirm(inputValue);
    cleanup();
  };

  // Cancel action
  const handleCancel = () => {
    modalContainer.classList.add("hidden");
    cleanup();
  };

  // Cleanup event listeners
  const cleanup = () => {
    confirmButton.removeEventListener("click", handleConfirm);
    cancelButton.removeEventListener("click", handleCancel);
  };

  confirmButton.addEventListener("click", handleConfirm);
  cancelButton.addEventListener("click", handleCancel);
}

// Toggle edit mode
function toggleEditMode(isEditMode) {
  const editButtons = document.querySelectorAll(".edit-mode");
  editButtons.forEach((button) => {
    button.style.display = isEditMode ? "inline-block" : "none";
  });
}

// Update the header to show the notebook name
function updateNotebookHeader() {
    const notebookHeader = document.getElementById("notebook-header");
    notebookHeader.textContent = notebook.name || "Untitled Notebook";
  }
  
  // Load notebook from localStorage and initialize the application
  window.addEventListener("DOMContentLoaded", () => {
    const allNotebooks = loadNotebooksFromLocalStorage();
  
    if (Object.keys(allNotebooks).length > 0) {
      const firstNotebookName = Object.keys(allNotebooks)[0];
      notebook = allNotebooks[firstNotebookName];
    } else {
      notebook = { ...defaultNotebook };
      saveNotebooksToLocalStorage();
    }
  
    populateLocations();
    populateNotebookDropdown();
  
    // Set the notebook name in the header
    updateNotebookHeader();
  
    if (notebook.locations.length > 0 && notebook.locations[0].encounters.length > 0) {
      displayEncounter(notebook.locations[0].encounters[0]);
    }
  });
  