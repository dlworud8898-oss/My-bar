const colorMap = { gin: "#E0F7FA", vodka: "#FFFFFF", whiskey: "#D2691E", rum: "#F5DEB3", tequila: "#FFFACD", brandy: "#8B4513", lime: "#32CD32", lemon: "#FFF700", sugar: "#F0F0F0", syrup: "#F0F0F0", orange: "#FFA500", pineapple: "#FFD700", kahlua: "#3E2723", amaretto: "#CD853F", blue: "#0000FF", midori: "#7FFF00", campari: "#FF0000", coke: "#321414", sprite: "#00FF00", peach: "#FFDAB9", milk: "#FFFFFF", cream: "#FFFFFF", cassis: "#720e0e", baileys: "#dcb48c", banana: "#FFE135", bitters: "#7b1a1a", grenadine: "#FF0000", apple: "#ccff00", cranberry: "#D1001C" };

const aliases = {
    "sugar": ["sugar", "syrup", "honey", "simple syrup", "sugar syrup"],
    "syrup": ["sugar", "syrup", "honey", "simple syrup", "sugar syrup"],
    "milk": ["milk", "cream", "heavy cream", "half and half"],
    "cream": ["milk", "cream", "heavy cream", "half and half"]
};

const localRecipes = [
    { name: "Gimlet", method: "Shake", req: ["gin", "lime", "sugar"], layers: [{n:"Gin", v:"2oz"}, {n:"Lime juice", v:"0.75oz"}, {n:"Simple Syrup", v:"0.75oz"}] },
    { name: "White Russian", method: "Build", req: ["vodka", "kahlua", "cream"], layers: [{n:"Vodka", v:"1.5oz"}, {n:"Kahlua", v:"0.75oz"}, {n:"Cream", v:"0.75oz"}] },
    { name: "Black Russian", method: "Build", req: ["vodka", "kahlua"], layers: [{n:"Vodka", v:"1.5oz"}, {n:"Kahlua", v:"0.75oz"}] },
    { name: "Old Fashioned", method: "Build", req: ["whiskey", "bitters", "sugar"], layers: [{n:"Bourbon", v:"1.5oz"}, {n:"Bitters", v:"2 dashes"}, {n:"Sugar", v:"1tsp"}] },
    { name: "Margarita", method: "Shake", req: ["tequila", "triple", "lime"], layers: [{n:"Tequila", v:"1.5oz"}, {n:"Triple Sec", v:"0.5oz"}, {n:"Lime juice", v:"0.5oz"}] },
    { name: "Faust", method: "Stir", req: ["rum", "cassis"], layers: [{n:"151 Rum", v:"1oz"}, {n:"Dark Rum", v:"1oz"}, {n:"Cassis", v:"0.5oz"}] },
    { name: "June Bug", method: "Shake", req: ["midori", "malibu", "banana", "pineapple", "sweet"], layers: [{n:"Midori", v:"1oz"}, {n:"Malibu", v:"0.5oz"}, {n:"Banana", v:"0.5oz"}, {n:"Pineapple", v:"2oz"}] },
    { name: "도화 (Peach Flower)", method: "Shake", req: ["peach", "triple", "sweet", "apple", "grenadine", "sprite"], layers: [{n:"Peach", v:"1oz"}, {n:"Triple Sec", v:"0.5oz"}, {n:"S&S Mix", v:"1oz"}] }
];

const ingredientsData = { 
    "Spirits": ["Gin", "Vodka", "Whiskey", "Rum", "Tequila", "Brandy"], 
    "Liqueurs": ["Peach Tree", "Triple Sec", "Blue Curacao", "Midori", "Kahlua", "Baileys", "Amaretto", "Cassis", "Malibu", "Banana Liqueur"], 
    "Mixers": ["Lemon juice", "Lime juice", "Sugar syrup", "Sweet&Sour mix", "Coke", "Sprite", "Ginger beer", "Tonic water"], 
    "Pantry": ["Milk", "Cream", "Egg white", "Bitters", "Orange juice", "Pineapple juice", "Apple juice", "Grenadine syrup", "Cranberry juice"] 
};

let selected = [];

function init() {
    const shelf = document.getElementById('ingredient-shelf');
    for (let cat in ingredientsData) {
        const group = document.createElement('div');
        group.innerHTML = `<h3>${cat}</h3><div class="chip-group"></div>`;
        const container = group.querySelector('.chip-group');
        ingredientsData[cat].forEach(ing => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerText = ing;
            chip.onclick = () => {
                chip.classList.toggle('selected');
                const val = ing.toLowerCase().split(' ')[0];
                if(selected.includes(val)) selected = selected.filter(i => i !== val);
                else selected.push(val);
            };
            container.appendChild(chip);
        });
        shelf.appendChild(group);
    }
}

function getColor(n) {
    const name = n.toLowerCase();
    for(let k in colorMap) { if(name.includes(k)) return colorMap[k]; }
    return "#888";
}

function check(recipeIng) {
    const ri = recipeIng.toLowerCase();
    return selected.some(s => {
        if (ri.includes(s) || s.includes(ri)) return true;
        if (aliases[s] && aliases[s].some(a => ri.includes(a))) return true;
        return false;
    });
}

async function findRecipes() {
    if(selected.length < 1) return;
    const lArea = document.getElementById('local-area');
    const aArea = document.getElementById('api-area');
    const status = document.getElementById('status');
    lArea.innerHTML = ""; aArea.innerHTML = ""; 
    status.innerText = "Searching global standard recipes...";

    const lMatch = localRecipes.filter(r => r.req.every(ri => check(ri)));
    if(lMatch.length > 0) {
        lArea.innerHTML = `<div class="group-title">CLASSIC STANDARD (${lMatch.length})</div>`;
        lMatch.forEach(r => renderCard(lArea, r.name, null, r.layers, r.method));
    }

    try {
        let allPossible = [];
        const searches = selected.map(s => fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${s}`).then(r => r.json()).catch(()=>({drinks:null})));
        const datas = await Promise.all(searches);
        datas.forEach(d => { if(d.drinks) allPossible = [...allPossible, ...d.drinks]; });
        const uniqueIds = Array.from(new Set(allPossible.map(d => d.idDrink))).slice(0, 80);
        const details = await Promise.all(uniqueIds.map(id => fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`).then(r => r.json())));

        let apiMatches = [];
        details.forEach(res => {
            const d = res.drinks[0];
            if(localRecipes.some(lr => lr.name.toLowerCase() === d.strDrink.toLowerCase())) return;
            let rIngs = [], layers = [];
            for(let i=1; i<=15; i++) {
                const ing = d["strIngredient"+i], m = d["strMeasure"+i];
                if(ing) { rIngs.push(ing); layers.push({ n: ing, v: m || "q.s." }); }
            }
            if(rIngs.every(ri => check(ri))) apiMatches.push({ name: d.strDrink, img: d.strDrinkThumb, layers });
        });

        if(apiMatches.length > 0) {
            aArea.innerHTML = `<div class="group-title">GLOBAL DISCOVERIES (${apiMatches.length})</div>`;
            apiMatches.forEach(r => renderCard(aArea, r.name, r.img, r.layers, "Mix"));
        }
    } catch(e) { console.error(e); }
    status.innerText = "Enjoy your drinks.";
}

function renderCard(target, name, img, layers, method) {
    const card = document.createElement('div');
    card.className = "cocktail-card";
    const mColor = { "Shake": "var(--shake)", "Stir": "var(--stir)", "Build": "var(--build)", "Layer": "var(--layer)" }[method] || "#AAA";
    card.innerHTML = `
        <div class="method-tag" style="background:${mColor}">${method}</div>
        <div class="card-header">
            ${img ? `<img src="${img}" class="cocktail-img">` : `<div class="cocktail-img" style="display:flex; align-items:center; justify-content:center; color:#AAA; border:1px dashed #DDD; font-size:12px;">CLASSIC</div>`}
            <h4 class="cocktail-name">${name}</h4>
        </div>
        <div class="glass-container">${layers.map(l => `<div class="layer" style="height:${100/layers.length}%; background:${getColor(l.n)}"><span>${l.n}</span><span style="font-size:7px; opacity:0.8;">${l.v}</span></div>`).join('')}</div>
        <div class="ingredients-list">${layers.map(l => `• <b>${l.n}</b>: ${l.v}`).join('<br>')}</div>
    `;
    target.appendChild(card);
}

function resetAll() {
    selected = [];
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('local-area').innerHTML = "";
    document.getElementById('api-area').innerHTML = "";
    document.getElementById('status').innerText = "";
}

window.onload = init;
