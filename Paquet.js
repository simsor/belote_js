/*
 * Classe représentant une carte d'un jeu
 */
function Carte(nom, couleur, valeur, atout) {
    this.nom = nom;
    this.couleur =  couleur;
    this.valeur = valeur;
    this.atout = atout || false;
}

/*
 * Classe représentant un deck de cartes
 */
function Deck() {
    this.cartes = [];
}

Deck.prototype.melanger = function() {
    var nombre_de_fois = getRandomInt(30, 50);
    var tab = [].concat(this.cartes);

    for(i=0; i < nombre_de_fois; i++) {
	var nb1 = getRandomInt(0, 32);
	var nb2 = getRandomInt(0, 32);
	
	var temp = tableau[nb1];
	tab[nb1] = tab[nb2];
	tab[nb2] = temp;
    }

    this.cartes = tab;
};

Deck.prototype.couper = function() {
    var index_coupe = getRandomInt(10, 20);
    var tableau = [].concat(this.cartes);
    console.log(index_coupe);
    var debut = tableau.slice(0, index_coupe);
    var fin = tableau.slice(index_coupe, tableau.length);

    while(tableau.length > 0) {
	tableau.pop();
    }
    tableau = fin;
    tableau = tableau.concat(debut);

    this.cartes = tableau;
};



/*
 * Classe représentant le tapis de jeu
 */
function Tapis() {
    this.cartes = [];
}
