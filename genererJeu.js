
function recupererFichierJSON(fichier,tableau){
  var data = null;
  $.ajax({
      url : fichier,
      type : 'GET',
      data : 'JSON',
      success : function(code_json, statut){
          tableau.push(JSON.parse(code_json));
       },
       error : function(resultat, statut, erreur){
       },
       complete : function(resultat, statut){
       }
   });
   return data;
}

  var jeu = [];
  /*
  * generation du jeu de carte
  */
  var couleurs =['Trèfle','Pique','Carreau','Coeur']
  for(var i = 0; i < 4; i++){
    recupererFichierJSON('cartes.json',jeu);
  }
  console.log(jeu);
