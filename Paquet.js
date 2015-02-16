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
      this['Couleur']=couleur
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
}

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
  }
  var couleurs =['Trèfle','Pique','Carreau','Coeur'];
  for(var i = 0; i < 4; i++){
    recupererFichierJSON(parametres,jeu,couleurs[i]);
  }
  this.cartes = jeu;
}

Deck.prototype.distribuerCarte = function(joueurs,jeu){
  for(var i = 0; i<2; i=i+1){
    $.each(joueurs)
  }
}
