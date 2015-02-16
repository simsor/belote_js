
/*
* Function qui permet de récuperer un model de carte dans un fichier JSON
* et rempli un tableau de facon synchrone
* parametre : parametres(le modele, le fichier JSON), le tableau, la couleur
*/
function recupererFichierJSON(parametres,tableau,couleur){
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
function generationDeckCarte(nbCarte,modeleCarte){
  var jeu = [];
  var fin = false;
  parametres = {
    "nbCarte":nbCarte,
    "modelCarte":modeleCarte
  }
  var couleurs =['Trèfle','Pique','Carreau','Coeur'];
  for(var i = 0; i < 4; i++){
    recupererFichierJSON(parametres,jeu,couleurs[i]);
  }

  return jeu;
}

console.log(generationDeckCarte(32,"cartes.json"));
