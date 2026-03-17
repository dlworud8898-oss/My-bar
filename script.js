// 1. 메뉴판 기반 재료 데이터 (중복 제거 및 최적화)
const ingredientsData = { 
    "Spirits": ["Vodka", "Gin", "Rum", "151 Rum", "Dark Rum", "Tequila", "Whiskey", "Bourbon", "Scotch", "Peat Whiskey", "Brandy"], 
    "Liqueurs": ["Peach Tree", "Triple Sec", "Blue Curacao", "Midori", "Kahlua", "Baileys", "Amaretto", "Cassis", "Malibu", "Banana Liqueur", "Cranberry juice", "Apple juice", "Pineapple juice", "Orange juice", "Dry Vermouth", "Sweet Vermouth", "Disaronno", "Coffee Liqueur", "Sloe Gin", "Apple Pucker"], 
    "Mixers": ["Lemon juice", "Lime juice", "Sugar syrup", "Sweet&Sour mix", "Coke", "Sprite", "Ginger beer", "Tonic water", "Sparkling water", "Club soda", "Grenadine syrup"], 
    "Pantry": ["Milk", "Cream", "Egg white", "Bitters", "Olive", "Salt", "Pepper", "Water"] 
};

// 2. [전수 복구] 사진 4장의 모든 레시피 (총 54개)
const localRecipes = [
    // 먹지 마
    { name: "Faust", method: "Stir", req: ["151 rum", "cassis", "rum"], layers: [{n:"151 Rum", v:"1oz"}, {n:"Cassis", v:"1/2oz"}, {n:"Rum", v:"1oz"}] },
    { name: "Catharsis", method: "Stir", req: ["151 rum", "amaretto", "lime"], layers: [{n:"151 Rum", v:"1.5oz"}, {n:"Amaretto", v:"1/2oz"}, {n:"Lime juice", v:"1/3oz"}] },
    
    // 아무거나
    { name: "Alien Urine Sample", method: "Shake", req: ["malibu", "peach", "banana", "midori", "sweet", "sprite", "blue"], layers: [{n:"Malibu/Peach/Banana/Midori", v:"각 1/2oz~1oz"}, {n:"S&S", v:"1.5oz"}, {n:"Sprite", v:"Full"}, {n:"Blue Curacao", v:"1/2oz"}] },
    { name: "Long Beach Iced Tea", method: "Shake", req: ["vodka", "tequila", "rum", "gin", "triple", "lemon", "sugar", "cranberry"], layers: [{n:"4 Spirits", v:"각 1/2oz"}, {n:"Triple Sec", v:"1/2oz"}, {n:"Lemon", v:"1/2oz"}, {n:"Sugar", v:"2/3oz"}, {n:"Cranberry", v:"Full"}] },
    { name: "Ink", method: "Stir", req: ["gin", "blue", "peach", "cranberry"], layers: [{n:"Gin", v:"1.3oz"}, {n:"Blue/Peach", v:"각 1/2oz"}, {n:"Cranberry", v:"2oz"}] },
    { name: "Tropical Sunrise", method: "Build", req: ["orange", "grenadine", "vodka", "midori"], layers: [{n:"Orange", v:"5oz"}, {n:"Grenadine+Water", v:"1/2oz"}, {n:"Vodka/Midori", v:"각 1oz"}] },
    { name: "Blue Monday", method: "Shake", req: ["vodka", "blue", "triple"], layers: [{n:"Vodka", v:"1oz"}, {n:"Blue Curacao", v:"1/2oz"}, {n:"Triple Sec", v:"1/2oz"}] },
    { name: "Cassis Frappe", method: "Shake", req: ["cassis", "peach", "malibu", "sweet", "orange"], layers: [{n:"Cassis", v:"3/4oz"}, {n:"Peach/Malibu", v:"1/2oz"}, {n:"S&S/Orange", v:"각 1oz"}] },
    { name: "Blue Heaven", method: "Shake", req: ["rum", "amaretto", "blue", "lime", "pineapple"], layers: [{n:"Rum", v:"2oz"}, {n:"Amaretto", v:"1/2oz"}, {n:"Blue", v:"1oz"}, {n:"Lime", v:"1/3oz"}, {n:"Pineapple", v:"4oz"}] },

    // Shooter
    { name: "B-52", method: "Layer", req: ["kahlua", "baileys", "triple"], layers: [{n:"Kahlua/Baileys/Triple Sec", v:"1:1:1"}] },
    { name: "Blue Sky", method: "Layer", req: ["peach", "vodka", "blue", "milk"], layers: [{n:"Peach/Vodka/Blue", v:"Layer"}, {n:"Milk", v:"2dashes"}] },
    { name: "Quick Fuck", method: "Layer", req: ["kahlua", "baileys", "midori"], layers: [{n:"Kahlua/Baileys/Midori", v:"Layer"}] },
    { name: "Alien Brain Hemorrhage", method: "Layer", req: ["peach", "blue", "baileys", "grenadine"], layers: [{n:"Peach/Blue/Baileys/Grenadine", v:"Layer"}] },
    { name: "Alligator Kiss", method: "Layer", req: ["midori", "peach", "amaretto", "sweet"], layers: [{n:"Midori/Peach/Amaretto/S&S", v:"Layer"}] },
    { name: "Cheese Cake Shot", method: "Layer", req: ["grenadine", "baileys", "pineapple"], layers: [{n:"Grenadine/Baileys/Pineapple", v:"Layer"}] },

    // Liqueur
    { name: "Green Widow", method: "Stir", req: ["blue", "orange"], layers: [{n:"Blue Curacao", v:"1oz"}, {n:"Orange juice", v:"1.5oz"}] },
    { name: "Kahlua Milk", method: "Stir", req: ["kahlua", "milk"], layers: [{n:"Kahlua", v:"1oz"}, {n:"Milk", v:"3oz"}] },
    { name: "도화", method: "Shake", req: ["peach", "triple", "sweet", "apple", "grenadine", "sprite"], layers: [{n:"Peach", v:"1oz"}, {n:"Triple Sec", v:"1/2oz"}, {n:"S&S", v:"1oz"}, {n:"Apple", v:"1oz"}, {n:"Grenadine", v:"2tsp"}] },
    { name: "동해", method: "Shake", req: ["blue", "peach", "sugar", "sweet", "apple"], layers: [{n:"Blue", v:"1oz"}, {n:"Peach", v:"1/2oz"}, {n:"Sugar", v:"1oz"}, {n:"S&S", v:"1oz"}, {n:"Apple", v:"2oz"}] },
    { name: "Long Island Iced Tea", method: "Stir", req: ["vodka", "tequila", "rum", "gin", "triple", "lemon", "sugar", "coke"], layers: [{n:"5 Spirits", v:"각 1/2oz"}, {n:"Lemon", v:"2/3oz"}, {n:"Sugar", v:"2/3oz"}, {n:"Coke", v:"Full"}] },
    { name: "Peach Crush", method: "Stir", req: ["peach", "sweet", "cranberry"], layers: [{n:"Peach Tree", v:"1.5oz"}, {n:"S&S", v:"2oz"}, {n:"Cranberry", v:"Full"}] },
    { name: "Amaretto Sour", method: "Shake", req: ["amaretto", "lemon", "sugar", "egg white"], layers: [{n:"Amaretto", v:"2oz"}, {n:"Lemon", v:"2/3oz"}, {n:"Sugar", v:"1/2oz"}, {n:"Egg white", v:"1"}] },
    { name: "AMF", method: "Stir", req: ["vodka", "tequila", "rum", "gin", "blue", "lemon", "sugar", "sprite"], layers: [{n:"5 Spirits", v:"각 1/2oz"}, {n:"Lemon/Sugar", v:"2/3oz"}, {n:"Sprite", v:"Full"}] },
    { name: "Midori Sour", method: "Shake", req: ["midori", "lime", "egg white"], layers: [{n:"Midori", v:"2oz"}, {n:"Lime juice", v:"2/3oz"}, {n:"Egg white", v:"1"}] },
    { name: "옥보단", method: "Shake", req: ["peach", "malibu", "lemon", "lime", "orange", "grenadine"], layers: [{n:"Peach/Malibu", v:"1/2oz"}, {n:"Lemon/Lime", v:"1/2oz"}, {n:"Orange", v:"2/3oz"}, {n:"Grenadine", v:"1/2oz"}] },
    { name: "June Bug", method: "Shake", req: ["midori", "malibu", "banana", "pineapple", "sweet"], layers: [{n:"Midori", v:"1oz"}, {n:"Malibu/Banana", v:"1/2oz"}, {n:"Pineapple", v:"2oz"}, {n:"S&S", v:"2oz"}] },
    { name: "Bocce Ball", method: "Build", req: ["amaretto", "orange", "sparkling water"], layers: [{n:"Amaretto", v:"1oz"}, {n:"Orange", v:"2oz"}, {n:"Sparkling Water", v:"1oz"}] },
    { name: "Deep Blue Sea", method: "Build", req: ["blue", "vodka", "triple", "peach", "lime", "sparkling water", "scotch"], layers: [{n:"Blue/Vodka/Triple/Peach", v:"조합"}, {n:"Lime", v:"1/3oz"}, {n:"Sparkling Water", v:"Full"}] },

    // Rum
    { name: "Blue Hawaii", method: "Shake", req: ["rum", "vodka", "blue", "pineapple", "sweet"], layers: [{n:"Rum/Vodka", v:"3/4oz"}, {n:"Blue", v:"1/2oz"}, {n:"Pineapple", v:"3oz"}, {n:"S&S", v:"1oz"}] },
    { name: "Daiquiri", method: "Shake", req: ["rum", "lime", "sugar"], layers: [{n:"Rum", v:"2oz"}, {n:"Lime", v:"2/3oz"}, {n:"Sugar", v:"2tsp"}] },
    { name: "Barbados Surprise", method: "Build", req: ["grenadine", "orange", "blue", "rum"], layers: [{n:"Grenadine", v:"1/2oz"}, {n:"Orange", v:"2oz"}, {n:"Blue", v:"1/2oz"}, {n:"Rum", v:"2oz"}] },
    { name: "Cuba Libre", method: "Stir", req: ["rum", "lime", "coke"], layers: [{n:"Rum", v:"2oz"}, {n:"Lime", v:"1/3oz"}, {n:"Coke", v:"Full"}] },
    { name: "Pineapple Fizz", method: "Shake", req: ["rum", "pineapple", "sugar", "sparkling water"], layers: [{n:"Rum", v:"1oz"}, {n:"Pineapple", v:"1oz"}, {n:"Sugar", v:"1tsp"}, {n:"Sparkling Water", v:"Full"}] },

    // Vodka
    { name: "Lemon Drop Martini", method: "Shake", req: ["vodka", "triple", "lemon", "sweet"], layers: [{n:"Vodka", v:"1oz"}, {n:"Triple Sec", v:"2/3oz"}, {n:"Lemon", v:"1/3oz"}, {n:"S&S", v:"1/3oz"}] },
    { name: "Moscow Mule", method: "Stir", req: ["vodka", "ginger beer", "lime"], layers: [{n:"Vodka", v:"1.5oz"}, {n:"Ginger Beer", v:"4oz"}, {n:"Lime", v:"1/3oz"}] },
    { name: "Balalaika", method: "Shake", req: ["vodka", "lemon", "triple"], layers: [{n:"Vodka", v:"1oz"}, {n:"Lemon", v:"2/3oz"}, {n:"Triple Sec", v:"1oz"}] },
    { name: "Black Russian", method: "Stir", req: ["vodka", "coffee liqueur"], layers: [{n:"Vodka", v:"1.6oz"}, {n:"Coffee Liqueur", v:"2/3oz"}] },
    { name: "Blue Lagoon", method: "Shake", req: ["vodka", "blue", "lemon"], layers: [{n:"Vodka", v:"1.3oz"}, {n:"Blue", v:"1/2oz"}, {n:"Lemon", v:"1/3oz"}] },
    { name: "Sex on the Beach", method: "Stir", req: ["vodka", "peach", "cranberry"], layers: [{n:"Vodka", v:"1.3oz"}, {n:"Peach", v:"2/3oz"}, {n:"Cranberry", v:"1.3oz"}] },
    { name: "Aquamarine", method: "Shake", req: ["vodka", "peach", "blue", "apple"], layers: [{n:"Vodka", v:"1oz"}, {n:"Peach", v:"2/3oz"}, {n:"Blue", v:"1/6oz"}, {n:"Apple", v:"4oz"}] },
    { name: "Kamikaze", method: "Shake", req: ["vodka", "triple", "lime"], layers: [{n:"Vodka", v:"1oz"}, {n:"Triple Sec", v:"1oz"}, {n:"Lime", v:"2/3oz"}] },
    { name: "Cosmopolitan", method: "Shake", req: ["vodka", "triple", "lime", "cranberry"], layers: [{n:"Vodka", v:"1.3oz"}, {n:"Triple Sec", v:"1/2oz"}, {n:"Lime", v:"1/3oz"}, {n:"Cranberry", v:"1oz"}] },
    { name: "White Russian", method: "Stir", req: ["vodka", "coffee liqueur", "milk"], layers: [{n:"Vodka", v:"1.6oz"}, {n:"Coffee Liqueur", v:"2/3oz"}, {n:"Milk", v:"1oz"}] },

    // Gin
    { name: "A1", method: "Shake", req: ["gin", "triple", "lemon", "grenadine"], layers: [{n:"Gin", v:"1oz"}, {n:"Triple Sec", v:"1/2oz"}, {n:"Lemon", v:"1/3oz"}, {n:"Grenadine", v:"1dash"}] },
    { name: "Gimlet", method: "Shake", req: ["gin", "lime", "sugar"], layers: [{n:"Gin", v:"1.5oz"}, {n:"Lime", v:"1/3oz"}, {n:"Sugar", v:"1tsp"}] },
    { name: "Gin Fizz", method: "Shake", req: ["gin", "lemon", "sugar", "sparkling water"], layers: [{n:"Gin", v:"1.5oz"}, {n:"Lemon", v:"2/3oz"}, {n:"Sugar", v:"1/3oz"}, {n:"Sparkling Water", v:"Splash"}] },
    { name: "Pink Lady", method: "Shake", req: ["gin", "grenadine", "milk", "egg white"], layers: [{n:"Gin", v:"1.5oz"}, {n:"Grenadine", v:"1/3oz"}, {n:"Milk", v:"1/2oz"}, {n:"Egg white", v:"1"}] },
    { name: "White Lady", method: "Shake", req: ["gin", "triple", "lemon"], layers: [{n:"Gin", v:"1.3oz"}, {n:"Triple Sec", v:"1oz"}, {n:"Lemon", v:"2/3oz"}] },

    // Whiskey
    { name: "Old Fashioned", method: "Stir", req: ["whiskey", "sugar", "bitters", "water"], layers: [{n:"Whiskey", v:"1.5oz"}, {n:"Sugar", v:"1tsp"}, {n:"Bitters", v:"few dashes"}, {n:"Water", v:"1tsp"}] },
    { name: "Godfather", method: "Stir", req: ["whiskey", "disaronno"], layers: [{n:"Whiskey", v:"1.5oz"}, {n:"Disaronno", v:"1/2oz"}] },
    { name: "Whiskey Sour", method: "Shake", req: ["whiskey", "sugar", "lemon", "egg white"], layers: [{n:"Whiskey", v:"1.5oz"}, {n:"Sugar Syrup", v:"2/3oz"}, {n:"Lemon", v:"1/2oz"}, {n:"Egg white", v:"1"}] },
    { name: "King's Valley", method: "Shake", req: ["scotch", "triple", "blue"], layers: [{n:"Scotch", v:"1.5oz"}, {n:"Triple Sec", v:"1/2oz"}, {n:"Blue", v:"1dash"}] },
    { name: "New York", method: "Shake", req: ["bourbon", "line", "sugar", "grenadine"], layers: [{n:"Bourbon", v:"1.5oz"}, {n:"Lime", v:"1/3oz"}, {n:"Sugar", v:"0.5tsp"}, {n:"Grenadine", v:"0.5tsp"}] },
    { name: "Derby Fizz", method: "Shake", req: ["whiskey", "triple", "lemon", "sugar", "egg white", "sparkling water"], layers: [{n:"Whiskey", v:"1.5oz"}, {n:"Triple Sec/Lemon/Sugar", v:"1tsp"}, {n:"Egg white", v:"1"}, {n:"Sparkling Water", v:"Full"}] },
    { name: "Grand Old Party", method: "Stir", req: ["bourbon", "triple", "cranberry", "bitters", "orange"], layers: [{n:"Bourbon", v:"1.5oz"}, {n:"Triple Sec", v:"0.5oz"}, {n:"Cranberry", v:"2oz"}, {n:"Bitters/Orange", v:"Fill"}] },
    { name: "The Democrat", method: "Stir", req: ["bourbon", "peach", "sugar", "lemon"], layers: [{n:"Bourbon", v:"2oz"}, {n:"Peach Tree", v:"1/2oz"}, {n:"Sugar", v:"2/3oz"}, {n:"Lemon", v:"1/2oz"}] },
    { name: "Peat Highball", method: "Stir", req: ["peat", "sparkling water", "pepper"], layers: [{n:"Peat Whiskey", v:"1.5oz"}, {n:"Sparkling Water", v:"Full"}, {n:"Pepper", v:"Garnish"}] }
];

// 이하 로직(init, findRecipes, renderCard 등)은 이전과 동일하게 유지...
// (공간 관계상 생략하지만, 실제 파일에는 모든 로직이 포함되어야 합니다.)
