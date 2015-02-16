// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function melanger_cartes(tableau) {
    var nombre_de_fois = getRandomInt(30, 50);
    var tab = [].concat(tableau);

    for(i=0; i < nombre_de_fois; i++) {
	var nb1 = getRandomInt(0, 32);
	var nb2 = getRandomInt(0, 32);
	
	var temp = tableau[nb1];
	tab[nb1] = tab[nb2];
	tab[nb2] = temp;
    }

    return tab;
}

function couper_jeu(tableau) {
    var index_coupe = getRandomInt(10, 20);
    console.log(index_coupe);
    var debut = tableau.slice(0, index_coupe);
    var fin = tableau.slice(index_coupe, tableau.length);

    console.log(debut);
    console.log(fin);

    while(tableau.length > 0) {
	tableau.pop();
    }
    tableau = fin;
    tableau = tableau.concat(debut);

    return tableau;
}

var tableau = [];

for(i=0; i < 32; i++) {
    tableau.push({ "Nom": "numero " + i, "Valeur": i});
}

console.log(tableau);
console.log(melanger_cartes(tableau));
