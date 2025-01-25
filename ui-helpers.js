// ui-helpers.js

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
  
  // Display a popup with the roll result
  function showPopup(message) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.className = "roll-popup";
    document.body.appendChild(popup);
  
    // Remove the popup after 3 seconds
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }
  

  document.getElementById("edit-mode-toggle").addEventListener("click", function () {
    this.classList.toggle("active"); // Toggle the switch appearance
    const isEditMode = this.classList.contains("active");
    toggleEditMode(isEditMode); // Call your existing function to enable/disable edit mode
  });
  