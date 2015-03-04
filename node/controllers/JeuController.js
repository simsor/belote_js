var module_joueur = require("../Joueur");
var module_paquet = require("../Paquet");

Object.cast = function(rawObj, constructor) {
    var obj = new constructor();
    for(var i in rawObj) {
	obj[i] = rawObj[i];
    }
    return obj;
};

Object.castTableau = function(tab, constructor) {
    for (var i=0; i < tab.length; i++) {
	tab[i] = Object.cast(tab[i], constructor);
    }

    return tab;
};

// Liste des objets utiles pour la partie
var joueurs = [];


// ////////////////////////////////////////////// G E S T I O N     P A R T I E

module.exports.RetournerEtat = function(request, response){
    response.end("{ error: 'Not done yet' } " + j1.machine());
};

module.exports.AjouterJoueur = function(request, response) {
    var pseudo = request.query.pseudo;
    response.end("{ error: 'Not done yet' } " + pseudo);
};
