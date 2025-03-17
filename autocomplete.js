customMonsters = JSON.parse(localStorage.getItem("customMonsters")) || [];

class Encounter {
    constructor(encounterElement, chips) {
        this.encounterElement = encounterElement;
        this.chips = chips;

        // ========================
        // DOM ELEMENT REFERENCES (Scoped to the Encounter)
        // ========================
        this.input = encounterElement.querySelector(".monster-input");
        this.chipContainer = encounterElement.querySelector(".chip-container");
        this.autocompleteList = encounterElement.querySelector(".autocomplete-list");
        this.customEditor = encounterElement.querySelector(".custom-monster-editor");
        this.customTextarea = encounterElement.querySelector(".custom-monster-textarea");
        this.monsterContent = encounterElement.querySelector(".monster-content");
        this.monsterActions = encounterElement.querySelector(".monster-actions");
        this.cloneButton = encounterElement.querySelector(".clone-monster");
        this.saveButton = encounterElement.querySelector(".save-monster");
        this.closeAutocomplete = this.closeAutocomplete.bind(this);

        // ========================
        // STATE VARIABLES (Instance-Specific)
        // ========================

        this.selectedMonsters = [];
        if (chips){
        this.chips.forEach((chip) => {
            this.selectedMonsters.push(chip);
        }
        )}

        // ========================
        // EVENT LISTENERS (Scoped to the Encounter)
        // ========================
        this.input.addEventListener("input", () => this.updateAutocomplete());
        this.input.addEventListener("keydown", (e) => this.handleInputKeydown(e));
        this.input.addEventListener("focus", () => this.updateAutocomplete());

        if (this.cloneButton) this.cloneButton.addEventListener("click", () => this.cloneMonster());
        if (this.saveButton) this.saveButton.addEventListener("click", () => this.saveCustomMonster());

        this.renderChips();
    }

    // ========================
    // AUTOCOMPLETE FUNCTIONS
    // ========================
    getMonsterList() {
        return ["Create Custom Monster", ...customMonsters,...MONSTER_LIST];
    }

    updateAutocomplete() {
        document.addEventListener("click", this.closeAutocomplete);
        this.autocompleteList.style.display ="block";
        let backgroundBlocker = document.getElementById("background-blocker");
        backgroundBlocker.style.display = "block";      
        const query = this.input.value.trim().toLowerCase();
        this.autocompleteList.innerHTML = "";
    
        if (query === "" && !this.autocompleteList.querySelector(".create-custom-monster")) {
            const createCustomDiv = document.createElement("div");
            createCustomDiv.classList.add("autocomplete-item", "create-custom-monster");
            createCustomDiv.textContent = "Create Custom Monster";
            createCustomDiv.addEventListener("click", () => this.openCustomMonsterEditor());
            this.autocompleteList.appendChild(createCustomDiv);
        }
    
        this.getMonsterList().forEach((monster) => {
            if (monster === "Create Custom Monster" || this.selectedMonsters.includes(monster)) return;
    
            const words = monster.toLowerCase().split(" ");
            const matches = words.some((word) => word.startsWith(query));
    
            if (matches) {
                const div = document.createElement("div");
                div.classList.add("autocomplete-item");
    
                const monsterText = document.createElement("span");
                monsterText.textContent = monster;
                div.addEventListener("click", () => this.selectMonster(monster));    
                div.appendChild(monsterText);
    
                // Add delete button for custom monsters
                if (customMonsters.includes(monster)) {
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.classList.add("delete-monster-btn");
                    deleteBtn.addEventListener("click", (event) => {
                        event.stopPropagation(); // Prevent selectMonster from being triggered
    
                        // Remove monster from customMonsters list
                        const index = customMonsters.indexOf(monster);
                        if (index !== -1) {
                            customMonsters.splice(index, 1);
                        }
    
                        // Save updated list to localStorage
                        localStorage.setItem("customMonsters", JSON.stringify(customMonsters));
    
                        // Remove the associated markdown file from localStorage
                        localStorage.removeItem(`${monster}.md`);
    
                        // Remove from UI
                        div.remove();
                    });
    
                    div.appendChild(deleteBtn);
                }
    
                this.autocompleteList.appendChild(div);
            }
        });
    }
    

    closeAutocomplete(event){
        if (!this.input.contains(event.target)) {
            this.autocompleteList.innerHTML = ""
            let backgroundBlocker = document.getElementById("background-blocker");
            backgroundBlocker.style.display = "none";
            this.autocompleteList.style.display ="none";
            document.removeEventListener("click", this.closeAutocomplete);
        }
    }

    handleInputKeydown(event) {
        if (event.key === "Enter" && this.input.value.trim()) {
            this.selectMonster(this.input.value.trim());
        }
        if (event.key === "Backspace" && this.input.value === "" && this.selectedMonsters.length) {
            this.removeMonster(this.selectedMonsters[this.selectedMonsters.length - 1]);
        }
    }

    selectMonster(monster) {
        if (!this.selectedMonsters.includes(monster)) {
            this.selectedMonsters.push(monster);
            this.renderChips();
            this.input.value = "";
            this.updateAutocomplete();
        }
    }

    // ========================
    // CHIP RENDERING FUNCTIONS
    // ========================
    renderChips() {
        this.chipContainer.innerHTML = "";
        this.selectedMonsters.forEach((monster) => {
            const chip = document.createElement("div");
            chip.classList.add("chip");
            chip.dataset.monster = monster;
            chip.innerHTML = `<span>${monster}</span><button class="remove-btn" data-monster="${monster}">&times;</button>`;

            chip.addEventListener("click", () => this.toggleMonsterChip(monster));

            this.chipContainer.appendChild(chip);
        });

        this.chipContainer.appendChild(this.input);
        this.chipContainer.appendChild(this.autocompleteList);

        this.chipContainer.querySelectorAll(".remove-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                this.removeMonster(button.dataset.monster);
            });
        });
    }

    toggleMonsterChip(monster) {
        const chips = this.chipContainer.querySelectorAll(".chip");
        let isActive = false;

        chips.forEach((chip) => {
            if (chip.dataset.monster === monster) {
                isActive = chip.classList.contains("active");
            }
            chip.classList.remove("active");
        });

        if (isActive) {
            this.monsterContent.innerHTML = "";
            this.monsterActions.classList.add("hidden");
        } else {
            this.chipContainer.querySelector(`.chip[data-monster='${monster}']`).classList.add("active");
            this.displayMonsterContent(monster);
            this.monsterActions.classList.remove("hidden");
        }
    }

    removeMonster(monster) {
        const index = this.selectedMonsters.indexOf(monster);
        if (index > -1) {
            this.selectedMonsters.splice(index, 1);
            this.renderChips();

            if (this.monsterContent.dataset.activeMonster === monster) {
                this.monsterContent.innerHTML = "";
                delete this.monsterContent.dataset.activeMonster;
                this.monsterActions.classList.add("hidden");
            }
        }
    }

    // ========================
    // MONSTER CONTENT FUNCTIONS
    // ========================

        
    
    async displayMonsterContent(monster) {

        let content = "";
    
        if (customMonsters.includes(monster)) {
            content = localStorage.getItem(`${monster}.md`) || "No content available.";
        } else {
            try {
                const response = await fetch(`campaign-notebook/Monsters/${monster}.md`);
                if (!response.ok) throw new Error();
                content = await response.text();
            } catch (error) {
                content = "Error loading monster content.";
            }
        }
    
        // Parse the markdown to HTML using marked.js
        const parsedContent = processHtmlContent(marked.parse(content),content);
        this.monsterContent.innerHTML = parsedContent;
        this.monsterContent.dataset.activeMonster = monster;
    
        this.monsterActions.classList.remove("hidden");}




    // ========================
    // CUSTOM MONSTER FUNCTIONS
    // ========================
    async openCustomMonsterEditor(monster = null) {
        this.monsterActions.classList.add("hidden");
        this.monsterContent.innerHTML = "";
    
        let content = "";
    
        if (monster) {
            try {
                const response = await fetch(`Monsters/${monster}.md`);
                if (!response.ok) throw new Error();
                content = await response.text();
            } catch (error) {
                content = "Error loading monster content.";
            }
        } else {
            const response = await fetch("Monsters/Sample.md?1");
            content = await response.text();
        }
    
        this.customTextarea.value = content;
        this.customEditor.classList.remove("hidden");
        this.customTextarea.focus();
    }
    
    cloneMonster() {
        const activeMonster = this.monsterContent.dataset.activeMonster;
        if (!activeMonster) return;
    
        this.openCustomMonsterEditor(activeMonster);
    }

    deleteMonster() {
        const activeMonster = this.monsterContent.dataset.activeMonster;
        if (!customMonsters.includes(activeMonster)) return;

        customMonsters = customMonsters.filter((m) => m !== activeMonster);
        localStorage.setItem("customMonsters", JSON.stringify(customMonsters));
        localStorage.removeItem(`${activeMonster}.md`);

        this.monsterContent.innerHTML = "";
        this.monsterActions.classList.add("hidden");

        this.selectedMonsters = this.selectedMonsters.filter((m) => m !== activeMonster);
        this.renderChips();
    }

    saveCustomMonster() {
        const content = this.customTextarea.value.trim();
        const lines = content.split("\n");
        let customName = `Custom Monster (${customMonsters.length + 1})`; // Default name
    
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            const nameMatch = firstLine.match(/^#+\s*(.+)$/); // Match heading with #
            if (nameMatch) {
                customName = nameMatch[1].trim(); // Extract monster name
            }
        }
    
        // Ensure unique name by checking both MONSTER_LIST and customMonsters
        let uniqueName = customName;
        let counter = 1;
        while (customMonsters.includes(uniqueName) || MONSTER_LIST.includes(uniqueName)) {
            uniqueName = `${customName} (${counter++})`;
        }
    
        customMonsters.push(uniqueName);
        localStorage.setItem("customMonsters", JSON.stringify(customMonsters));
        localStorage.setItem(`${uniqueName}.md`, content); // Save content
    
        this.selectMonster(uniqueName);
        this.toggleMonsterChip(uniqueName);
        this.customEditor.classList.add("hidden");
    }
    
}

// ========================
// INITIALIZATION
// ========================

