
function recupererFichierJSON(fichier,tableau,couleur){
  $.getJSON(fichier,function(data){
    $.each(data,function(i){
      this['Couleur']=couleur
      tableau.push(this);
      });
    console.log(tableau);
    });
}


  var jeu = [];
  /*
  * generation du jeu de carte
  */
  var couleurs =['Trèfle','Pique','Carreau','Coeur'];
  for(var i = 0; i < 4; i++){
    recupererFichierJSON('cartes.json',jeu,couleurs[i]);
  }
