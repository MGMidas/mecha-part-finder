const grid = document.getElementById("results-grid");
const typeSelect = document.getElementById("type-select");
const voltageSelect = document.getElementById("voltage-select");
const searchInput = document.getElementById("search-input");

let allComponents = [];

// 1. Chargement des données
async function loadMechaData() {
    try {
        const [resCC, resServo] = await Promise.all([
            fetch('Moteur CC.json'),
            fetch('Servomoteur.json')
        ]);

        if (!resCC.ok || !resServo.ok) throw new Error("Fichier JSON manquant");

        const dataCC = await resCC.json();
        const dataServo = await resServo.json();

        allComponents = [...dataCC, ...dataServo];
        displayComponents(allComponents);

    } catch (error) {
        console.error(error);
        grid.innerHTML = `<p style="color:red">Erreur : ${error.message}</p>`;
    }
}

// 2. Affichage
function displayComponents(data) {
    grid.innerHTML = "";
    if (data.length === 0) {
        grid.innerHTML = "<p>Aucun résultat.</p>";
        return;
    }

    data.forEach(item => {
        const name = item["Nom du produit"] || "Inconnu";
        const img = item["Image du produit"] || "";
        const price = item["Prix (EUR)"] || "0";
        const desc = item["Description du produit"] || "";

        const card = `
            <div class="card">
                <img src="${img}" alt="${name}">
                <div class="card-body">
                    <h3>${name}</h3>
                    <p class="price">${price} €</p>
                    <p class="desc">${desc.substring(0, 80)}...</p>
                    <a href="${item["URL du produit"]}" target="_blank" class="btn-detail">Voir la fiche</a>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// 3. Filtrage (CORRIGÉ)
function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const type = typeSelect.value.toLowerCase();
    const volt = voltageSelect.value;

    const filtered = allComponents.filter(item => {
        const name = (item["Nom du produit"] || "").toLowerCase();
        const desc = (item["Description du produit"] || "").toLowerCase();
        const fullText = name + " " + desc; // La variable s'appelle fullText

        const matchSearch = fullText.includes(term);
        const matchType = type === "all" || fullText.includes(type);
        
        // Correction du filtre tension pour être plus souple
        let matchVolt = true;
        if (volt !== "all") {
            // On cherche "12V", "12 V", ou juste "12" entouré d'espaces
            matchVolt = fullText.includes(volt + "v") || 
                        fullText.includes(volt + " v") || 
                        fullText.includes(" " + volt + " ");
        }

        return matchSearch && matchType && matchVolt;
    });

    displayComponents(filtered);
}

// Écouteurs
searchInput.addEventListener("input", applyFilters);
typeSelect.addEventListener("change", applyFilters);
voltageSelect.addEventListener("change", applyFilters);

loadMechaData();