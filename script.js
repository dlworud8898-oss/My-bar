// 1. 확장된 재료 데이터베이스
const ingredientsData = { 
    "Spirits": ["Gin", "Vodka", "Whiskey", "Rum", "Tequila", "Brandy"], 
    "Liqueurs": ["Peach Tree", "Triple Sec", "Blue Curacao", "Midori", "Kahlua", "Baileys", "Amaretto", "Cassis", "Malibu", "Banana Liqueur"], 
    "Mixers": ["Lemon juice", "Lime juice", "Sugar syrup", "Sweet&Sour mix", "Coke", "Sprite", "Ginger beer", "Tonic water"], 
    "Pantry": ["Milk", "Cream", "Egg white", "Bitters", "Orange juice", "Pineapple juice", "Apple juice", "Grenadine syrup", "Cranberry juice"] 
};

// 상호 호환 재료 (동의어 사전)
const aliases = {
    "sugar": ["sugar", "syrup", "honey", "simple syrup", "sugar syrup"],
    "syrup": ["sugar", "syrup", "honey", "simple syrup", "sugar syrup"],
    "milk": ["milk", "cream", "heavy cream", "half and half"],
    "cream": ["milk", "cream", "heavy cream", "half and half"],
    "lemon": ["lemon", "lime", "citrus"],
    "lime": ["lemon", "lime", "citrus"]
};

// [정석 레시피 DB - 누락 방지를 위해 더 확충 가능]
const localRecipes = [
    { name: "Gimlet", method: "Shake", req: ["gin", "lime", "sugar"], layers: [{n:"Gin", v:"2oz"}, {n:"Lime juice", v:"0.75oz"}, {n:"Simple Syrup", v:"0.75oz"}] },
    { name: "White Russian", method: "Build", req: ["vodka", "kahlua", "cream"], layers: [{n:"Vodka", v:"1.5oz"}, {n:"Kahlua", v:"0.75oz"}, {n:"Cream", v:"0.75oz"}] },
    { name: "Black Russian", method: "Build", req: ["vodka", "kahlua"], layers: [{n:"Vodka", v:"1.5oz"}, {n:"Kahlua", v:"0.75oz"}] },
    { name: "Margarita", method: "Shake", req: ["tequila", "triple", "lime"], layers: [{n:"Tequila", v:"1.5oz"}, {n:"Triple Sec", v:"0.5oz"}, {n:"Lime juice", v:"0.5oz"}] },
    { name: "Daiquiri", method: "Shake", req: ["rum", "lime", "sugar"], layers: [{n:"White Rum", v:"1.5oz"}, {n:"Lime juice", v:"0.75oz"}, {n:"Simple Syrup", v:"0.5oz"}] },
    { name: "Old Fashioned", method: "Build", req: ["whiskey", "bitters", "sugar"], layers: [{n:"Bourbon", v:"1.5oz"}, {n:"Bitters", v:"2 dashes"}, {n:"Sugar", v:"1tsp"}] },
    { name: "Faust", method: "Stir", req: ["rum", "cassis"], layers: [{n:"151 Rum", v:"1oz"}, {n:"Dark Rum", v:"1oz"}, {n:"Cassis", v:"0.5oz"}] },
    { name: "Katharsis", method: "Stir", req: ["rum", "amaretto", "lime"], layers: [{n:"151 Rum", v:"1.5oz"}, {n:"Amaretto", v:"0.5oz"}, {n:"Lime juice", v:"0.25oz"}] },
    { name: "June Bug", method: "Shake", req: ["midori", "malibu", "banana", "pineapple", "sweet"], layers: [{n:"Midori", v:"1oz"}, {n:"Malibu", v:"0.5oz"}, {n:"Banana", v:"0.5oz"}, {n:"Pineapple juice", v:"2oz"}] },
    { name: "도화 (Peach Flower)", method: "Shake", req: ["peach", "triple", "sweet", "apple", "grenadine", "sprite"], layers: [{n:"Peach", v:"1oz"}, {n:"Triple Sec", v:"0.5oz"}, {n:"S&S Mix", v:"1oz"}] }
];

let selected = [];

function init() {
    const shelf = document.getElementById('ingredient-shelf');
    if(!shelf) return;
    shelf.innerHTML = "";
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

// 재료 매칭 핵심 함수 (Alias 대응)
function hasIngredient(targetIng, mySelection) {
    const target = targetIng.toLowerCase();
    return mySelection.some(s => {
        if (target.includes(s)) return true;
        if (aliases[s] && aliases[s].some(a => target.includes(a))) return true;
        return false;
    });
}

async function findRecipes() {
    if(selected.length < 1) return;
    const lArea = document.getElementById('local-area');
    const aArea = document.getElementById('api-area');
    const status = document.getElementById('status');
    lArea.innerHTML = ""; aArea.innerHTML = ""; 
    status.innerText = "Finding all possible cocktails...";

    // 1. 로컬 레시피 검색 (전수 조사)
    // 로직 변경: "내가 가진 재료로 이 레시피의 필수 재료를 모두 충족하는가?"
    const lMatch = localRecipes.filter(recipe => {
        return recipe.req.every(reqIng => hasIngredient(reqIng, selected));
    });

    if(lMatch.length > 0) {
        lArea.innerHTML = `<div class="group-title">YOUR ARCHIVE (${lMatch.length})</div>`;
        lMatch.forEach(r => renderCard(lArea, r.name, null, r.layers, r.method));
    }

    // 2. 글로벌 API 검색 (중복 제거 및 정확도 향상)
    try {
        let allDrinks = [];
        // 선택한 모든 재료에 대해 개별 검색 수행 (병렬)
        const fetchPromises = selected.map(s => 
            fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${s}`).then(r => r.json()).catch(() => ({drinks:null}))
        );
        const results = await Promise.all(fetchPromises);
        results.forEach(data => { if(data.drinks) allDrinks = [...allDrinks, ...data.drinks]; });

        // ID 기반 중복 제거 및 상위 100개 추출
        const uniqueIds = Array.from(new Set(allDrinks.map(d => d.idDrink))).slice(0, 100);
        const details = await Promise.all(uniqueIds.map(id => 
            fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`).then(r => r.json())
        ));

        let apiMatches = [];
        details.forEach(res => {
            const d = res.drinks[0];
            // 이미 로컬에 있는 건 제외
            if(localRecipes.some(lr => lr.name.toLowerCase() === d.strDrink.toLowerCase())) return;

            let rIngs = [], layers = [];
            for(let i=1; i<=15; i++) {
                const ing = d["strIngredient"+i], m = d["strMeasure"+i];
                if(ing) { rIngs.push(ing); layers.push({ n: ing, v: m || "q.s." }); }
            }

            // 정확한 필터링: 레시피의 모든 재료가 내 선택 리스트(혹은 별명)에 있는가?
            const canMake = rIngs.every(ri => hasIngredient(ri, selected));
            if(canMake) apiMatches.push({ name: d.strDrink, img: d.strDrinkThumb, layers });
        });

        if(apiMatches.length > 0) {
            aArea.innerHTML = `<div class="group-title">GLOBAL DISCOVERIES (${apiMatches.length})</div>`;
            apiMatches.forEach(r => renderCard(aArea, r.name, r.img, r.layers, "Mix"));
        }
    } catch(e) { console.error(e); }
    status.innerText = "Search Complete.";
}

function renderCard(target, name, img, layers, method) {
    const card = document.createElement('div');
    card.className = "cocktail-card";
    const colors = { "Shake": "#FF4757", "Stir": "#2ED573", "Build": "#1E90FF", "Layer": "#FFA502" };
    card.innerHTML = `
        <div class="method-tag" style="background:${colors[method] || '#AAA'}">${method}</div>
        <div class="card-header">
            ${img ? `<img src="${img}" class="cocktail-img">` : `<div class="cocktail-img" style="display:flex; align-items:center; justify-content:center; color:#AAA; border:1px dashed #DDD; font-size:12px;">PHOTO</div>`}
            <h4 class="cocktail-name">${name}</h4>
        </div>
        <div class="ingredients-list">${layers.map(l => `• ${l.n}: ${l.v}`).join('<br>')}</div>
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

