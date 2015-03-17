var fs = require("fs");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/*
 * Classe représentant une carte d'un jeu
 */
module.exports.Carte = function (nom, couleur, valeur, atout) {
    this.nom = nom;
    this.couleur =  couleur;
    this.valeur = valeur;
    this.atout = atout || false;
    this.joueur = undefined;
};

module.exports.Carte.prototype.transformerEnAtout = function() {
    switch(this.nom) {
    case "9":
	this.valeur = 14;
	break;

    case "Valet":
	this.valeur = 20;
	break;
    }

    this.atout = true;
};

/*
 * Classe représentant un deck de cartes
 */

module.exports.Deck = function () {
    this.cartes = [];
};

module.exports.Deck.prototype.melanger = function() {
    var nombre_de_fois = getRandomInt(30, 50);
    var tab = [].concat(this.cartes);

    for(var i=0; i < nombre_de_fois; i++) {
	var nb1 = getRandomInt(0, 32);
	var nb2 = getRandomInt(0, 32);

	var temp = tab[nb1];
	tab[nb1] = tab[nb2];
	tab[nb2] = temp;
    }

    this.cartes = tab;
};

module.exports.Deck.prototype.couper = function() {
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
* Fonction qui permet de récuperer un model de carte dans un fichier JSON
* et rempli un tableau de facon synchrone
* parametre : parametres(le modele, le fichier JSON), le tableau, la couleur
*/
// module.exports.Deck.prototype.recupererFichierJSON = function(parametres,tableau,couleur){
//   //On parametre ajax en mode synchrone
//   $.ajaxSetup({
//         async: false
//     });
//   //on recupère le modele d'une couleur dans le fichier JSON
//   $.getJSON(parametres["modelCarte"],{async:false},function(data){
//     $.each(data,function(i){
//       //on affecte une couleur aux cartes
// 	var carte = new Carte();
// 	carte.couleur = couleur;
// 	carte.nom = this.nom;
// 	carte.valeur = this.valeur;
// 	//ajoute au tableau de cartes
// 	tableau.push(carte);
//       });
//       //verification si le jeu est complet
//       if(tableau.length>=parametres["nbCarte"]){
//         //traitement fini on remet ajax en asynchrone
//         $.ajaxSetup({
//           async: true
//         });
//       }
//     });
// };

module.exports.Deck.prototype.recupererFichierJSON = function(parametres, tableau, couleur) {
    var cartes = JSON.parse(fs.readFileSync(parametres["modelCarte"]));
    for(var i=0; i < cartes.length; i++) {
	var carte = new module.exports.Carte();
	carte.couleur = couleur;
	carte.nom = cartes[i].nom;
	carte.valeur = cartes[i].valeur;
	//ajoute au tableau de cartes
	tableau.push(carte);
    }
};

module.exports.Deck.prototype.genererDepuisFichier = function(fichier) {
    var couleurs = ["Coeur", "Pique", "Trefle", "Carreau"];
    for(var i = 0; i< couleurs.length; i++) {
	this.recupererFichierJSON({
	    "modelCarte": fichier,
	    "nbCarte": 32
	}, this.cartes, couleurs[i]);
    }
};

/*
* generation du jeu de carte
* parametre : genere un jeu de carte en fonction d'un fichier modele JSON
* et un nombre de carte
* return : un tableau ou il y a toutes les cartes du jeu
*/
module.exports.Deck.prototype.generationDeckCarte = function(nbCarte,modeleCarte){
  var jeu = [];
  var fin = false;
  //definition des parametres
  parametres = {
    "nbCarte":nbCarte,
    "modelCarte":modeleCarte
  };
  var couleurs =['Trèfle','Pique','Carreau','Coeur'];
  for(var i = 0; i < 4; i++){
    recupererFichierJSON(parametres,jeu,couleurs[i]);
  }
  this.cartes = jeu;
};

/*
 * Classe représentant la table (avec des joueurs autour et des cartes)
 */

module.exports.Table = function (deck) {
    this.tapis = [];
    this.joueurs = [];
    this.deck = deck;
    
    this.carte_retournee = undefined;
    this.atout = undefined;
    this.couleur_demandee = undefined;

    this.index_distributeur = getRandomInt(0, 3);
    this.index_joueur_courant = (this.index_distributeur == 3) ? 0 : this.index_distributeur+1;
};

module.exports.Table.prototype.donnerCarte = function(joueur, nombre) {
    nombre = nombre || 1;
    // array.shift() renvoie le 1er élément et le supprime
    for(var i = 0; i < nombre; i++) {
	var carte = this.deck.cartes.shift();
	carte.joueur = joueur;
	joueur.main.push(carte);
    }
};

module.exports.Table.prototype.distributionInitiale = function() {
    // On distribue les trois premieres
    var i = this.index_distributeur;
    do {
	i++;
	if (i == 4)
	    i = 0;
	
	this.donnerCarte(this.joueurs[i], 3);
    } while (i != this.index_distributeur);
 
    // Puis deux à chaque
    var i = this.index_distributeur;
    do {
	i++;
	if (i == 4)
	    i = 0;
	this.donnerCarte(this.joueurs[i], 2);
    } while (i != this.index_distributeur);
};

module.exports.Table.prototype.retourner = function() {
    this.carte_retournee = this.deck.cartes.shift();
    return this.carte_retournee;
};

module.exports.Table.prototype.fairePrendre = function(joueur, deuxiemeTour, couleurChoisie) {
    deuxiemeTour = deuxiemeTour || false;
    couleurChoisie = couleurChoisie || "";

    joueur.aPris = true;
    joueur.main.push(this.carte_retournee);

    if (deuxiemeTour) {
	this.setAtout(couleurChoisie);
    }
    else {
	this.setAtout(this.carte_retournee.couleur);
    }

    this.carte_retournee = undefined;
};

module.exports.Table.prototype.setAtout = function(couleur) {
    this.atout = couleur;
    
    for(var i=0; i < this.deck.cartes.length; i++) {
	if (this.deck.cartes[i].couleur == couleur) {
	    this.deck.cartes[i].transformerEnAtout();
	}
    }

    for (var i=0; i < this.joueurs.length; i++) {
	for(var j=0; j < this.joueurs[i].main.length; j++) {
	    if (this.joueurs[i].main[j].couleur == couleur) {
		this.joueurs[i].main[j].transformerEnAtout();
	    }
	}
    }
};

module.exports.Table.prototype.distributionDeuxiemeTour = function() {
    var i = this.index_distributeur;
    do {
	i++;
	if (i == 4)
	    i = 0;
	
	if (this.joueurs[i].aPris) {
	    this.donnerCarte(this.joueurs[i], 2);
	}
	else {
	    this.donnerCarte(this.joueurs[i], 3);
	}
    } while (i != this.index_distributeur);

    this.index_distributeur++;
    if (this.index_distributeur == 4)
	this.index_distributeur = 0; 
};

module.exports.Table.prototype.getMaitre = function() {
    var atoutPresent = false;
    for(var i=0; i < this.deck.cartes.length; i++) {
	if (this.deck.cartes[i].atout) {
	    atoutPresent = true;
	    break;
	}
    }

    if(atoutPresent) {
	var atoutMax = undefined;
	for(var i=0; i < this.cartes.length; i++) {
	    if (this.deck.cartes[i].atout) {
		if (atoutMax == undefined)
		    atoutMax = this.cartes[i];

		else if (this.deck.cartes[i].valeur > atoutMax.valeur)
		    atoutMax = this.deck.cartes[i];
		
	    }
	}

	return atoutMax.joueur;
    }
    else {
	var carteMax = undefined;
	for(var i=0; i < this.deck.cartes.length; i++) {
	    if (this.deck.cartes[i].couleur == this.couleur_demandee) {
		if (carteMax == undefined)
		    carteMax = this.deck.cartes[i];

		else if (this.deck.cartes[i].valeur > carteMax.valeur)
		    carteMax = this.deck.cartes[i];
		
	    }
	}
	if (carteMax == undefined)
	    return undefined;
	else
	    return carteMax.joueur;
    }
};

module.exports.Table.prototype.cartePeutEtreJouee = function(carte) {
    if (this.tapis.length == 0)
	return true;
    
    if (carte.couleur == this.couleur_demandee)
	return true;

    if (!carte.joueur.aCouleur(this.couleur_demandee)) {
	if (this.getMaitre().equipe == carte.joueur.equipe)
	    // Le partenaire est maître
	    return true;
	
	if (carte.atout)
	    return true;

	if (carte.joueur.aAtout())
	    // Si il a un atout alors que la carte jouée n'en est pas un
	    return false;
	else
	    return true;
    }

    // Si la couleur jouée n'est pas celle demandée mais qu'il a la couleur
    return false;
};
