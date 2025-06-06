// Parancsok keresése
function searchFunction() {
    const input = document.getElementById("pInput");
    const filter = input.value.toUpperCase();
    const table = document.querySelector(".commands");
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[0];
        if (cell) {
            const cellClone = cell.cloneNode(true);
            
            const codeElements = cellClone.querySelectorAll("code");
            codeElements.forEach(code => code.remove());
            
            const txtValue = cellClone.textContent || cellClone.innerText;
            
            rows[i].style.display = txtValue.toUpperCase().includes(filter) ? "" : "none";
        }
    }
}

// Tooltip-pek kezelése
let paramTooltip = {};

fetch("https://raw.githubusercontent.com/sassvagyok/sasOS-data/main/parameterTooltips.json")
    .then(x => x.json())
    .then(data => {
        paramTooltip = data,
        addParameterTooltips();
    });

function addParameterTooltips() {
    const commandRows = document.querySelectorAll("tr[data-command]");
    
    commandRows.forEach(row => {
        // Split data-command by space, e.g. "8ball generic" => ["8ball", "generic"]
        const commandAttrs = row.getAttribute("data-command").split(" ");
        const codeElements = row.querySelectorAll("code:not([data-bs-toggle])");
        
        codeElements.forEach(code => {
            const paramName = code.textContent.trim();
            const paramIndex = code.getAttribute("data-param-index");
            let tooltipText = "";

            // Try all commandAttrs, stop at the first match
            for (const commandAttr of commandAttrs) {
                if (paramIndex && paramTooltip[commandAttr]?.[`${paramName}_${paramIndex}`]) {
                    tooltipText = paramTooltip[commandAttr][`${paramName}_${paramIndex}`];
                    break;
                } else if (paramTooltip[commandAttr]?.[paramName]) {
                    tooltipText = paramTooltip[commandAttr][paramName];
                    break;
                }
            }

            if (tooltipText) {
                code.setAttribute("data-bs-toggle", "tooltip");
                code.setAttribute("data-bs-html", "true");
                code.setAttribute("title", tooltipText);
            }
        });
    });
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle='tooltip']"));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Changelog formázása
function formatChangelog(text) {
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    formatted = formatted.replace(/\`([^`]+)\`/g, "<code>$1</code>");
    formatted = formatted.replace(/^- /gm, "&emsp;● ");
    formatted = formatted.replace(/^\s+- /gm, "&emsp;&emsp;○ ");
    formatted = formatted.replace(/\n/g, "<br>");
    
    return formatted;
}

document.addEventListener("DOMContentLoaded", async function () {
    // Verziószám lekérése
    const fetchVersion = await fetch("https://api.github.com/repos/sassvagyok/sasOS-docs/commits/main");
    const fetchedVersionJson = await fetchVersion.json();
    
    document.getElementById("version").innerHTML = fetchedVersionJson.commit.message.indexOf("\n") > -1 ? fetchedVersionJson.commit.message.substring(0, fetchedVersionJson.commit.message.indexOf("\n")) : fetchedVersionJson.commit.message;


    // Változáslista kezelése
    const fetchChangelog = await fetch("https://raw.githubusercontent.com/sassvagyok/sasOS-data/main/changelog.json");
    const fetchedChangelogJson = await fetchChangelog.json();

    let selectedChangelog = fetchedChangelogJson.find(x => x.version == fetchedChangelogJson[fetchedChangelogJson.length - 1].version);
    
    let formattedChangelog = `<h3 class="changelog">${selectedChangelog.version}</h3>`;
    formattedChangelog += `<p class="date">${selectedChangelog.date}</p>`
    formattedChangelog += `<p class="changelog">${formatChangelog(selectedChangelog.changelog)}</p>`;
    
    if (selectedChangelog.subversions && selectedChangelog.subversions.length > 0) {
        for (let i = 0; i < selectedChangelog.subversions.length; i++) {
            const subversion = selectedChangelog.subversions[i];
            formattedChangelog += `<hr><h3 class="changelog">${subversion.version}</h3>`;
            formattedChangelog += `<p class="date">${subversion.date}</p>`
            formattedChangelog += `<p class="changelog">${formatChangelog(subversion.changelog)}</p>`;
        }
    }
    
    const changelogElem = document.getElementById("changelog");
    if (changelogElem) {
        changelogElem.innerHTML = formattedChangelog;
    }

    // Animáció betöltéskor
    document.querySelectorAll(".anim").forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('slide-in');
        }, 100 + i * 120);
    });
});