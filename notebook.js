let editor = null; 
let notebooks = null;
let activeNotebook = null;
let currentPage = null;
let notebookIndex = [];     

document.addEventListener("DOMContentLoaded", async () => {
    await loadNotebookIndex();
    await populateNotebookSelect();

    let lastNotebook = localStorage.getItem("lastNotebook");
    let lastPage = localStorage.getItem("lastPage");
    let pageToLoad = lastPage;

    if (lastNotebook && notebookIndex.includes(lastNotebook)) {
        // Initialize notebook with the correct page
        initializeNotebook(lastNotebook, pageToLoad);
    } else {
        // If no saved notebook, just initialize the first one
        initializeNotebook(notebookIndex[0]);
    }
});



async function loadNotebookIndex(){
    notebookIndex = JSON.parse(localStorage.getItem("notebooksIndex"));
    if (!notebookIndex || notebookIndex.length === 0) {
            activeNotebook = await loadSampleYAML();
            notebookIndex = [];
            saveNotebook();
        }
        
}


async function loadSampleYAML() {
    try {
        const response = await fetch('/campaign-notebook/sample.yaml'); // Fetch the YAML file from the home directory
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const yamlText = await response.text();
        const yamlData = jsyaml.load(yamlText); // Parse YAML using js-yaml library
        return yamlData;
    } catch (error) {
        console.error("Error loading YAML:", error);
        return null;
    }
}

async function populateNotebookSelect() {
    if (notebookIndex.length === 0) {
        activeNotebook = await loadSampleYAML();
        notebookIndex = [];
        await saveNotebook();
    }
    
    const selectElement = document.getElementById("notebook-select");
    selectElement.innerHTML = "";

    let lastNotebook = localStorage.getItem("lastNotebook");

    notebookIndex.forEach((title) => {
        const option = document.createElement("option");
        option.value = title;
        option.textContent = title;

        // Pre-select the last opened notebook
        if (title === lastNotebook) {
            option.selected = true;
        }

        selectElement.appendChild(option);
    });

    if (!selectElement.dataset.listenerAdded) {
        selectElement.addEventListener("change", (event) => {
            localStorage.setItem("lastNotebook", event.target.value); // Save selection
            initializeNotebook(event.target.value);
        });
        selectElement.dataset.listenerAdded = "true";
    }
}


function initializeNotebook(notebook, pageToOpen = null) {
    const notebookYAML = localStorage.getItem(`notebook_${notebook}.yaml`);
    
    if (notebookYAML) {
        activeNotebook = jsyaml.load(notebookYAML);
        populatePageList(activeNotebook);

        let pageToLoad = null;

        if (pageToOpen) {
            // Look for the page in the notebook and its subpages
            let pageFound = false;

            activeNotebook.notebook.pages.forEach((page, pageIndex) => {
                if (page.title === pageToOpen) {
                    pageToLoad = activeNotebook.notebook.pages[pageIndex];
                    pageFound = true;
                }

                if (!pageFound && page.subpages) {
                    page.subpages.forEach((subpage, subpageIndex) => {
                        if (subpage.title === pageToOpen) {
                            pageToLoad = activeNotebook.notebook.pages[pageIndex].subpages[subpageIndex];
                            pageFound = true;
                        }
                    });
                }
            });
        }

        // If the page was found, open it; otherwise, default to the first page
        if (pageToLoad) {
            populatePageContent(pageToLoad);
        } else {
            populatePageContent(activeNotebook.notebook.pages[0]);
        }
    } else {
        console.error("Notebook not found.");
    }
}



// populate page list
async function populatePageList(yaml) {
    const pageListDiv = document.getElementById("page-list");
    const contentDiv = document.getElementById("content-content");

    pageListDiv.innerHTML = ""; // Clear existing content
    let firstPageHeader = null;

    yaml.notebook.pages.forEach(page => {
        const pageDiv = document.createElement("div");
        pageDiv.classList.add("page");

        const pageHeaderDiv = createPageHeader(page);
        if (!firstPageHeader) {
            firstPageHeader = pageHeaderDiv;
        }
        pageDiv.appendChild(pageHeaderDiv);

        if (page.subpages && page.subpages.length > 0) {
            const subpagesDiv = document.createElement("div");
            subpagesDiv.classList.add("page-subpages");

            page.subpages.forEach(subpage => {
                const subpageHeaderDiv = createSubpageHeader(subpage, page);
                subpagesDiv.appendChild(subpageHeaderDiv);
            });

            pageDiv.appendChild(subpagesDiv);
        }

        pageListDiv.appendChild(pageDiv);
    });
}

function createPageHeader(page) {
    const pageHeaderDiv = document.createElement("div");
    pageHeaderDiv.classList.add("page-header");
    pageHeaderDiv.addEventListener("click", (event) => populatePageContent(page, event));

    const pageHeaderNameDiv = document.createElement("div");
    pageHeaderNameDiv.classList.add("page-header-name");

    const pageIconBtn = document.createElement("button");
    pageIconBtn.classList.add("page-icon-btn");
    pageIconBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';


        // Handle collapse/expand if the page has subpages
        if (page.subpages && page.subpages.length > 0) {
            pageIconBtn.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent triggering the page click event
    
                // Find the subpages container
                const subpagesDiv = pageHeaderDiv.nextElementSibling;
                if (subpagesDiv && subpagesDiv.classList.contains("page-subpages")) {
                    subpagesDiv.classList.toggle("collapsed");
    
                    // Toggle chevron direction
                    if (subpagesDiv.classList.contains("collapsed")) {
                        pageIconBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'; // Collapsed state
                    } else {
                        pageIconBtn.innerHTML = '<i class="fas fa-chevron-down"></i>'; // Expanded state
                    }
                }
            });
        } else {
        // No subpages: Change the button to an interpunct
        pageIconBtn.innerHTML = '<i class="fas fa-circle"></i>'; // Expanded state
        }
    
    const pageNameSpan = document.createElement("span");
    pageNameSpan.classList.add("page-name");
    pageNameSpan.textContent = page.title;

    pageHeaderNameDiv.appendChild(pageIconBtn);
    pageHeaderNameDiv.appendChild(pageNameSpan);

    const pageHeaderButtonsDiv = document.createElement("div");
    pageHeaderButtonsDiv.classList.add("page-header-buttons");

    const addButton = document.createElement("button");
    addButton.classList.add("page-icon-btn");
    addButton.innerHTML = '<i class="fas fa-plus"></i>';
    addButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevents triggering the page click event
        addSubpage(page);
    });

    const menuButton = document.createElement("button");
    menuButton.classList.add("page-icon-btn", "menu-button", "page-menu-button");
    menuButton.innerHTML = '<i class="fas fa-ellipsis-vertical"></i>';
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevents triggering the page click event
        openContextMenu(event, page);
    });


    pageHeaderButtonsDiv.appendChild(addButton);
    pageHeaderButtonsDiv.appendChild(menuButton);

    pageHeaderDiv.appendChild(pageHeaderNameDiv);
    pageHeaderDiv.appendChild(pageHeaderButtonsDiv);

    return pageHeaderDiv;
}

function createSubpageHeader(subpage, page) {
    const subpageHeaderDiv = document.createElement("div");
    subpageHeaderDiv.classList.add("subpage-header");
    subpageHeaderDiv.addEventListener("click", (event) => populatePageContent(subpage, event));

    const subpageHeaderNameDiv = document.createElement("div");
    subpageHeaderNameDiv.classList.add("subpage-header-name");

    const subpageIconBtn = document.createElement("button");
    subpageIconBtn.classList.add("page-icon-btn");
    subpageIconBtn.innerHTML = '<i class="fas fa-circle"></i>';

    const subpageNameSpan = document.createElement("span");
    subpageNameSpan.classList.add("page-name");
    subpageNameSpan.textContent = subpage.title;

    subpageHeaderNameDiv.appendChild(subpageIconBtn);
    subpageHeaderNameDiv.appendChild(subpageNameSpan);

    const subpageHeaderButtonsDiv = document.createElement("div");
    subpageHeaderButtonsDiv.classList.add("subpage-header-buttons");

    const menuButton = document.createElement("button");
    menuButton.classList.add("page-icon-btn", "menu-button", "subpage-menu-button");
    menuButton.innerHTML = '<i class="fas fa-ellipsis-vertical"></i>';
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevents triggering the page click event
        openContextMenu(event, page, subpage);
    });

    subpageHeaderButtonsDiv.appendChild(menuButton);

    subpageHeaderDiv.appendChild(subpageHeaderNameDiv);
    subpageHeaderDiv.appendChild(subpageHeaderButtonsDiv);

    return subpageHeaderDiv;
}

function populatePageContent(page, event = null) {
    currentPage = page;

    // Store the currently active notebook and page in localStorage
    localStorage.setItem("lastNotebook", activeNotebook.notebook.title);
    localStorage.setItem("lastPage", page.title);

    // Remove 'active-page' from all page and subpage headers
    document.querySelectorAll(".page-header, .subpage-header").forEach(header => {
        header.classList.remove("active-page");
    });

    if (event) {
        // If triggered by a click event, use event.currentTarget
        event.currentTarget.classList.add("active-page");
    } else {
        // Use indexes to correctly mark the active page or subpage
        let allPages = [...document.querySelectorAll(".page-header")];
        let allSubpages = [...document.querySelectorAll(".subpage-header")];

        let pageFound = false;

        activeNotebook.notebook.pages.forEach((notebookPage, pageIndex) => {
            if (notebookPage === page) {
                if (allPages[pageIndex]) {
                    allPages[pageIndex].classList.add("active-page");
                    pageFound = true;
                }
            }

            if (!pageFound && notebookPage.subpages) {
                notebookPage.subpages.forEach((subpage, subpageIndex) => {
                    if (subpage === page) {
                        let parentPageHeader = allPages[pageIndex];
                        let subpageHeaders = parentPageHeader.nextElementSibling?.querySelectorAll(".subpage-header");
                        if (subpageHeaders && subpageHeaders[subpageIndex]) {
                            subpageHeaders[subpageIndex].classList.add("active-page");
                        }
                        pageFound = true;
                    }
                });
            }
        });
    }

    // Update existing Editor.js instance instead of destroying it
    if (editor && page.content) {
        let savedData = page.content;
        if (typeof savedData === "string") {
            try {
                savedData = JSON.parse(savedData);
            } catch (e) {
                console.error("Error parsing saved page content: ", e);
                return;
            }
        }

        if (savedData && savedData.blocks) {
            editor.render(savedData);
        }
    } else {
        initEditor(page);
    }
}

function initEditor(page) {
    editor = new EditorJS({
        holder: "content-content",
        tools: {
            paragraph: {
                class: Paragraph,
                inlineToolbar: true
            },
            header: {
                class: Header,
                inlineToolbar: true,
                config: {
                    placeholder: "Enter a header",
                    levels: [1, 2, 3, 4, 5, 6],
                    defaultLevel: 1
                }
            },
            quote: {
                class: Quote,
                inlineToolbar: true,
                config: {
                    quotePlaceholder: "Enter a quote",
                    captionPlaceholder: "Author"
                }
            },
            list: {
                class: EditorjsList,
                inlineToolbar: true,
                config: {
                    defaultStyle: "unordered"
                }
            },
            encounter: EncounterBlock
        },
        autofocus: true,
        placeholder: "Start writing your notes here...",
        onReady: () => {
            let savedData = page.content;

            if (typeof savedData === "string") {
                try {
                    savedData = JSON.parse(savedData);
                } catch (e) {
                    console.error("Error parsing initial content: ", e);
                    return;
                }
            }

            if (savedData && savedData.blocks) {
                editor.render(savedData);
            }
        },
        onChange: () => {
            saveEditorContent();
        }
    });
}

async function saveEditorContent() {
    if (!editor || !currentPage) return;


    const savedData = await editor.save(); // Retrieve editor content
    currentPage.content = savedData; // Update page content in activeNotebook
    saveNotebook();
}

// Function to save YAML to localStorage
async function saveNotebook() {
    const notebookYAML = jsyaml.dump(activeNotebook);
    localStorage.setItem(`notebook_${activeNotebook.notebook.title}.yaml`, notebookYAML);
    if (!notebookIndex.includes(activeNotebook.notebook.title)) {
        notebookIndex.push(activeNotebook.notebook.title);
        localStorage.setItem("notebooksIndex", JSON.stringify(notebookIndex));
    }
}

function createNotebook() {
    const notebookTitle = prompt("Enter a name for the new notebook:");
    if (!notebookTitle) return;

    activeNotebook = {
        notebook:{
        title: notebookTitle,
        pages: [{title:"New Page",content: ""}]}
    };

    saveNotebook();
    populateNotebookSelect();
    const selectElement = document.getElementById("notebook-select");
    selectElement.value = notebookTitle;
    initializeNotebook(notebookTitle);
}

function addPage() {
    if (!activeNotebook) {
        return;
    }

    // Create a new page object
    const newPage = {
        title: "New Page",
        content: { blocks: [] }, // Empty Editor.js content
        subpages: [] // Default empty array for subpages
    };

    // Add to active notebook's pages
    if (!activeNotebook.notebook.pages) {
        activeNotebook.notebook.pages = [];
    }
    activeNotebook.notebook.pages.push(newPage);

    // Update the UI
    populatePageList(activeNotebook); // Refresh the page list
    populatePageContent(newPage);
    saveNotebook(); // Save changes to localStorage
}

function addSubpage(parentPage){
    if (!parentPage) {
        return;
    }

    // Create a new subpage object
    const newSubpage = {
        title: "New Subpage",
        content: { blocks: [] }, // Empty Editor.js content
    };

    // Ensure parent page has a subpages array
    if (!parentPage.subpages) {
        parentPage.subpages = [];
    }
    parentPage.subpages.push(newSubpage);


    // Update the UI
    populatePageList(activeNotebook); // Refresh the page list
    populatePageContent(newSubpage);
    saveNotebook(); // Save changes to localStorage
}

function createNotebook() {
    const notebookTitle = prompt("Enter a name for the new notebook:");
    if (!notebookTitle) return;

    activeNotebook = {
        notebook:{
        title: notebookTitle,
        pages: [{title:"New Page",content: ""}]}
    };

    saveNotebook();
    populateNotebookSelect();
    const selectElement = document.getElementById("notebook-select");
    selectElement.value = notebookTitle;
    initializeNotebook(notebookTitle);
}

function deletePage(page) {

    // Find the index of the page to delete
    const pageIndex = activeNotebook.notebook.pages.indexOf(page);

    // Remove the page from the notebook
    activeNotebook.notebook.pages.splice(pageIndex, 1);

    // Update the UI
    populatePageList(activeNotebook); // Refresh the page list
    saveNotebook(); // Save changes to localStorage
    if (activeNotebook.notebook.pages.length == 0){
        addPage();
    }
    if(currentPage == page){
        populatePageContent(activeNotebook.notebook.pages[0])
    }
}

function deleteSubpage(subpage, page){

    const pageIndex = activeNotebook.notebook.pages.indexOf(page);
    const subpageIndex = activeNotebook.notebook.pages[pageIndex].subpages.indexOf(subpage);

    // Remove the page from the notebook
    activeNotebook.notebook.pages[pageIndex].subpages.splice(subpageIndex, 1);

    // Update the UI
    populatePageList(activeNotebook); // Refresh the page list
    saveNotebook(); // Save changes to localStorage

    if(currentPage == subpage){
        populatePageContent(activeNotebook.notebook.pages[0])
    }
}

function renamePage(page) {
    if (!activeNotebook || !activeNotebook.notebook.pages || !page) {
        return;
    }

    // Prompt the user for a new name
    const newTitle = prompt("Enter a new name for the page:", page.title);
    if (!newTitle || newTitle.trim() === "") {
        return; // If the user cancels or enters an empty name, do nothing
    }

    // Update the page title
    page.title = newTitle.trim();

    // Update the UI
    populatePageList(activeNotebook); // Refresh the page list
    populatePageContent(page); // Update displayed content
    saveNotebook(); // Save changes to localStorage
}

async function deleteNotebook() {
    if (!activeNotebook || !activeNotebook.notebook || !activeNotebook.notebook.title) {
        alert("No active notebook to delete.");
        return;
    }

    const notebookTitle = activeNotebook.notebook.title;

    if (!confirm(`Are you sure you want to delete the notebook: "${notebookTitle}"?`)) {
        return;
    }

    // Remove notebook from the index
    const index = notebookIndex.indexOf(notebookTitle);
    if (index !== -1) {
        notebookIndex.splice(index, 1);
        localStorage.setItem("notebooksIndex", JSON.stringify(notebookIndex));
    }

    // Remove notebook from localStorage
    localStorage.removeItem(`notebook_${notebookTitle}`);

    // Reset activeNotebook if it was deleted
    activeNotebook = null;

    // Update the notebook selection dropdown
    await populateNotebookSelect();
    initializeNotebook(notebookIndex[0]);

}

function renameNotebook() {
    if (!activeNotebook || !activeNotebook.notebook || !activeNotebook.notebook.title) {
        alert("No active notebook to rename.");
        return;
    }

    const oldTitle = activeNotebook.notebook.title;
    const newTitle = prompt("Enter a new name for the notebook:", oldTitle);

    if (!newTitle || newTitle.trim() === oldTitle.trim()) return; // Prevent empty or unchanged names

    if (notebookIndex.includes(newTitle)) {
        alert("A notebook with this name already exists. Choose a different name.");
        return;
    }

    // Update the notebook title in the index
    const index = notebookIndex.indexOf(oldTitle);
    if (index !== -1) {
        notebookIndex[index] = newTitle;
        localStorage.setItem("notebooksIndex", JSON.stringify(notebookIndex));
    }

    // Rename the notebook in localStorage
    const notebookData = localStorage.getItem(`notebook_${oldTitle}`);
    if (notebookData) {
        localStorage.setItem(`notebook_${newTitle}`, notebookData);
        localStorage.removeItem(`notebook_${oldTitle}`);
    }

    // Update active notebook title
    activeNotebook.notebook.title = newTitle;

    // Save and refresh UI
    saveNotebook();
    populateNotebookSelect();
    
    // Update selection in dropdown
    const selectElement = document.getElementById("notebook-select");
    selectElement.value = newTitle;
}

async function exportData() {
    const zip = new JSZip();
    
    // Iterate through localStorage to find .md and .yaml files
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.endsWith(".md") || key.endsWith(".yaml")) {
            const fileData = localStorage.getItem(key);
            zip.file(key, fileData);
        }
    }
    
    try {
        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        // Create a download link and trigger the download
        const a = document.createElement("a");
        a.href = URL.createObjectURL(zipBlob);
        a.download = "exported_files.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("Error creating zip file:", error);
    }
}

async function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".yaml, .yml, .md, .zip"; // Accept YAML, Markdown, and ZIP files

    input.addEventListener("change", async (event) => {
        const file = event.target.files[0];

        if (file) {
            if (file.name.endsWith(".zip")) {
                await handleZipFile(file);
            } else {
                await handleSingleFile(file);
            }
        }
    });

    input.click(); // Trigger file selection
}

async function handleSingleFile(file) {
    const reader = new FileReader();
    
    reader.onload = function (e) {
        const content = e.target.result;
        const filename = file.name;
        localStorage.setItem(filename, content);

        if (filename.endsWith(".md")) {
            // Extract "friendlyname" for Markdown
            const friendlyname = filename.replace(/\.md$/, "");
            customMonsters.push(friendlyname);
            localStorage.setItem("customMonsters", JSON.stringify(customMonsters));

        } else if (filename.endsWith(".yaml") || filename.endsWith(".yml")) {
            // Extract "friendlyname" for YAML (remove "notebook_" prefix and extension)
            const friendlyname = filename.replace(/^notebook_/, "").replace(/\.(yaml|yml)$/, "");
            activeNotebook = jsyaml.load(content);
            saveNotebook();
            populateNotebookSelect();
            const selectElement = document.getElementById("notebook-select");
            selectElement.value = friendlyname;
            initializeNotebook(friendlyname);
        }
    };

    reader.readAsText(file);
}

async function handleZipFile(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const zipData = e.target.result;
        const zip = await JSZip.loadAsync(zipData);

        const filePromises = Object.keys(zip.files).map(async (filename) => {
            if (filename.endsWith(".yaml") || filename.endsWith(".yml") || filename.endsWith(".md")) {
                const fileContent = await zip.files[filename].async("text");
                const extractedFile = new File([fileContent], filename, { type: "text/plain" });
                await handleSingleFile(extractedFile);
            }
        });

        await Promise.all(filePromises);
    };

    reader.readAsArrayBuffer(file);
}
