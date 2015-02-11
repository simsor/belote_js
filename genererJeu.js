
function recupererFichierJSON(fichier){
  var data = null;
  $.ajax({
      url : fichier,
      type : 'GET',
      data : 'JSON',
      success : function(code_json, statut){
          data = JSON.parse(code_json);
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
  for(var i = 0; i < 4; i++){
    console.log(recupererFichierJSON('cartes.json'));
  }
  console.log(jeu);
