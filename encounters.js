
//make dice rollable
function processHtmlContent(htmlContent) {
    const dicePattern = /(\d+d\d+(?:[+-]\d+)?|[+-]\d+)/g;
    

    
    htmlContent = htmlContent.replace(dicePattern, match => {
        return `<span class="rollable" onclick="rollDice('${match}')">${match}</span>`;
    });
    
    return htmlContent;
}
function rollDice(expression) {
    let match = expression.match(/(\d*)d(\d+)([+-]\d+)?/);
    let message = '';

    if (match) {
        let rolls = parseInt(match[1] || '1', 10);
        let sides = parseInt(match[2], 10);
        let modifier = match[3] ? parseInt(match[3], 10) : 0;
        let total = modifier;
        let rollResults = [];

        for (let i = 0; i < rolls; i++) {
            let roll = Math.floor(Math.random() * sides) + 1;
            rollResults.push(roll);
            total += roll;
        }

        message = `${expression}: ${total}`; // Replace this line
    } else {
        match = expression.match(/([+-]\d+)/);
        if (match) {
            let modifier = parseInt(match[1], 10);
            let roll = Math.floor(Math.random() * 20) + 1;
            total = roll + modifier;
            message = `1d20${modifier >= 0 ? '+' : ''}${modifier}: ${total}`; // Replace this line
        } else {
            message = "Invalid dice expression!";
        }
    }

    showSnackbar(message);
}

let snackbarTimeout; // Store timeout globally

function showSnackbar(message) {
    let snackbar = document.getElementById("snackbar");
    snackbar.innerText = message;
    snackbar.classList.add("show");

    // Clear previous timeout before setting a new one
    clearTimeout(snackbarTimeout);
    
    snackbarTimeout = setTimeout(() => {
        snackbar.classList.remove("show");
    }, 3000);
}

function rollInitiative(content){
    extractCombatantStats(content);
    openRight();
}

function extractCombatantStats(markdownText) {
    let nameMatch = markdownText.match(/^#{1,}\s*(.+)$/m);
    let name = nameMatch ? nameMatch[1] : "Unknown";    

    let acMatch = markdownText.match(/\*\*Armor Class\*\*\s*(\d+)/);
    let armorClass = acMatch ? parseInt(acMatch[1], 10) : 0;

    let hpMatch = markdownText.match(/\*\*Hit Points\*\*\s*(\d+)/);
    let hitPoints = hpMatch ? parseInt(hpMatch[1], 10) : 0;

    // Match the ability score table row values
    let abilityMatch = markdownText.match(/\|\s*(\d+)\s*\(\s*([-+]\d+)\s*\)\s*\|\s*(\d+)\s*\(\s*([-+]\d+)\s*\)\s*\|\s*(\d+)\s*\(\s*([-+]\d+)\s*\)\s*\|\s*(\d+)\s*\(\s*([-+]\d+)\s*\)\s*\|\s*(\d+)\s*\(\s*([-+]\d+)\s*\)\s*\|\s*(\d+)\s*\(\s*([-+]\d+)\s*\)\s*\|/);

    let dexModifier = abilityMatch ? parseInt(abilityMatch[4], 10) : 0; // Correctly selecting the 2nd stat (DEX)

    console.log (dexModifier,name,hitPoints,armorClass);
    addCombatantRow(dexModifier,name,hitPoints,armorClass);
}


function openRight(){
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    const screenWidth = window.innerWidth;

    if (screenWidth <= 1000) {
        // If screen width is 992px or less, close left sidebar before toggling right
        if (left.classList.contains("active")) {
            left.classList.remove("active");
        }
    }

    right.classList.add("active");

    // Only call repositionMiddle if screen width is greater than 992
    if (screenWidth > 705) {
        repositionMiddle();
    }
}