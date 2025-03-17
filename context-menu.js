// Menu logic
function openContextMenu(event, page, subpage) {
  let backgroundBlocker = document.getElementById("background-blocker");
  if (backgroundBlocker){
  backgroundBlocker.style.display = "block";}
  event.stopPropagation(); // Prevents immediate closing due to bubbling
  const button = event.target.closest(".menu-button");
  if (!button) return;

  const menu = document.getElementById("context-menu");
  const menuOptions = menu.querySelector(".menu-options");
  menuOptions.innerHTML = ""; // Clear previous options
  const rect = event.target.getBoundingClientRect();
  const menuWidth = 120;
  const menuHeight = 120;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Determine context (Notebook or Page)
  if (button.id === "notebook-menu-button") {
      addMenuOption(menuOptions, "Add New", createNotebook);
      addMenuOption(menuOptions, "Rename", renameNotebook);
      addMenuOption(menuOptions, "Delete", deleteNotebook);
      addMenuOption(menuOptions, "Export", exportData);
      addMenuOption(menuOptions, "Import", importData);

  } else if (button.classList.contains("page-menu-button")) {
      addMenuOption(menuOptions, "Rename", () => renamePage(page));
      addMenuOption(menuOptions, "Delete", () => deletePage(page));
    } else if (button.classList.contains("subpage-menu-button")) {
      addMenuOption(menuOptions, "Rename", () => renamePage(subpage));
      addMenuOption(menuOptions, "Delete", () => deleteSubpage(subpage, page));
  }

  let menuX = rect.right + window.scrollX - 10; // Default left position
  let menuY = rect.bottom + window.scrollY - 10; // Default bottom position

  // Check if the menu overflows the right side
  if (menuX + menuWidth > viewportWidth) {
      menuX = rect.right - menuWidth + window.scrollX - 10; // Align to the right of the button
  }

  // Check if the menu overflows the bottom
  if (menuY + menuHeight > viewportHeight) {
      menuY = rect.top - menuHeight + window.scrollY + 10; // Place above the button
  }

  // Apply position
  menu.style.top = `${menuY}px`;
  menu.style.left = `${menuX}px`;

  // Show the menu
  menu.style.display = "block";

  // Delay adding the outside click listener to avoid immediate closing
  setTimeout(() => {
    document.addEventListener("pointerdown", closeMenu);
    }, 0);
}

function closeMenu(event) {
  const menu = document.getElementById("context-menu");
  if (!event || !menu.contains(event.target)) {

  const backgroundBlocker = document.getElementById("background-blocker");
  menu.style.display = "none";
  document.removeEventListener("pointerdown", closeMenu);
  if (backgroundBlocker){
    backgroundBlocker.style.display = "none";}
  }
}

function addMenuOption(menuOptions, text, callback) {
  const option = document.createElement("li");
  option.classList.add("menu-option");
  option.textContent = text;
  option.addEventListener("click", (event) => {
      event.stopPropagation();
      callback();
      closeMenu();
  });
  menuOptions.appendChild(option);
}

