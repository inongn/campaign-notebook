
//make dice rollable
function processHtmlContent(htmlContent, markdownContent) {
    // Extract stats first
    let stats = extractCombatantStats(markdownContent);

    // Combined regex to match initiative, dice rolls, and recharge
    const combinedPattern = /(?:(<li><strong>Initiative<\/strong>\s*)([+-]?\d+)(\s*<\/li>))|(?:(\d+d\d+(?:[+-]\d+)?|\s*[+-]\s*\d+))|(?:(Recharge\s*(\d+)(?:-(\d+))?))/g;

    htmlContent = htmlContent.replace(combinedPattern, (...args) => {
        if (args[1] && args[2] && args[3]) {
            // Initiative match
            const before = args[1];
            const bonus = args[2];
            const after = args[3];
            return `${before}<span class="rollable" onclick="handleRoll('initiative', '${bonus}', '${stats}')">${bonus}</span>${after}`;
        } else if (args[4]) {
            // Dice roll match
            const expression = args[4].trim();
            return `<span class="rollable" onclick="handleRoll('dice', '${expression}')">${expression}</span>`;
        } else if (args[5] && args[6]) {
            // Recharge match
            const minValue = parseInt(args[6], 10);
            const maxValue = args[7] ? parseInt(args[7], 10) : minValue;
            const rechargeExpression = `1d6`;
            const rechargeValue = `${minValue}-${maxValue}`;
            return `<span class="rollable" onclick="handleRoll('recharge', '${rechargeExpression}', '${rechargeValue}')">Recharge ${minValue}${maxValue !== minValue ? `-${maxValue}` : ''}</span>`;
        }
        return args[0];
    });

    return htmlContent;
}


function handleRoll(type, expression, value = null) {
    if (type === 'dice') {
        rollDice(expression);
    } else if (type === 'initiative') {
        rollInitiative(value);
    } else if (type === 'recharge') {
        rollDice(expression, value);
    }
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

function rollInitiative(stats){
    let splitStats = stats.split(",");
    addCombatantRow(splitStats[0],splitStats[1],splitStats[2],splitStats[3]);
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

    return [dexModifier, name, hitPoints, armorClass];
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