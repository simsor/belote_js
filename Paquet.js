function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/*
 * Classe représentant une carte d'un jeu
 */
function Carte(nom, couleur, valeur, atout) {
    this.nom = nom;
    this.couleur =  couleur;
    this.valeur = valeur;
    this.atout = atout || false;
}

Carte.prototype.transformerEnAtout = function() {
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

function Deck() {
    this.cartes = [];
}

Deck.prototype.melanger = function() {
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
* Fonction qui permet de récuperer un model de carte dans un fichier JSON
* et rempli un tableau de facon synchrone
* parametre : parametres(le modele, le fichier JSON), le tableau, la couleur
*/
Deck.prototype.recupererFichierJSON = function(parametres,tableau,couleur){
  //On parametre ajax en mode synchrone
  $.ajaxSetup({
        async: false
    });
  //on recupère le modele d'une couleur dans le fichier JSON
  $.getJSON(parametres["modelCarte"],{async:false},function(data){
    $.each(data,function(i){
      //on affecte une couleur aux cartes
	this['couleur']=couleur;
      //ajoute au tableau de cartes
      tableau.push(this);
      });
      //verification si le jeu est complet
      if(tableau.length>=parametres["nbCarte"]){
        //traitement fini on remet ajax en asynchrone
        $.ajaxSetup({
          async: true
        });
      }
    });
};

Deck.prototype.genererDepuisFichier = function(fichier) {
    var couleurs = ["Coeur", "Pique", "Trèfle", "Carreau"];
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
Deck.prototype.generationDeckCarte = function(nbCarte,modeleCarte){
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

Deck.prototype.distribuerCarte = function(joueurs,jeu){
  for(var i = 0; i<2; i=i+1){
      $.each(joueurs);
  }
};

/*
 * Classe représentant la table (avec des joueurs autour et des cartes)
 */

function Tapis() {
    this.cartes = [];


function Table(deck) {
    this.tapis = [];
    this.joueurs = [];
    this.deck = deck;
    this.carte_retournee = undefined;
    this.atout = "Aucun";

}

Table.prototype.donnerCarte = function(joueur, nombre) {
    nombre = nombre || 1;
    // array.shift() renvoie le 1er élément et le supprime
    for(var i = 0; i < nombre; i++) {
	var carte = this.deck.cartes.shift();
	joueur.main.push(carte);
    }
};

Table.prototype.distributionInitiale = function() {
    // On distribue les trois premieres
    for(var i=0; i < this.joueurs.length; i++) {
	this.donnerCarte(this.joueurs[i], 3);
    }

    // Puis deux à chaque
    for(var i=0; i < this.joueurs.length; i++) {
	this.donnerCarte(this.joueurs[i], 2);
    }
};

Table.prototype.retourner = function() {
    this.carte_retournee = this.deck.cartes.shift();
    return this.carte_retournee;
};

Table.prototype.fairePrendre = function(joueur, deuxiemeTour, couleurChoisie) {
    deuxiemeTour = deuxiemeTour || false;
    couleurChoisie = couleurChoisie || "";

    joueur.aPris = true;
    joueur.main.push(this.carte_retournee);
    this.carte_retournee = undefined;

    if (deuxiemeTour) {
	this.setAtout(couleurChoisie);
    }
    else {
	this.setAtout(this.carte_retournee.couleur);
    }
};

Table.prototype.setAtout = function(couleur) {
    for(var i=0; i < this.deck.cartes.length; i++) {
	if (this.deck.cartes[i].couleur == couleur) {
	    this.deck.cartes[i].transformerEnAtout();
	}
    }

    for (var i=0; i < this.joueurs.length; i++) {
	for(j=0; j < this.joueurs[i].main.length; j++) {
	    if (this.joueurs[i].main[j].couleur == couleur) {
		this.joueurs[i].main[j].transformerEnAtout();
	    }
	}
    }
};

Table.prototype.distributionDeuxiemeTour = function() {
    for(var i=0; i < this.joueurs.length; i++) {
	if (this.joueurs[i].aPris) {
	    this.donnerCarte(this.joueurs[i], 2);
	}
	else {
	    this.donnerCarte(this.joueurs[i], 3);
	}
    }
};
