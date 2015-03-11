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

var equipe1 = new module_joueur.Equipe(1);
var equipe2 = new module_joueur.Equipe(2);


// ////////////////////////////////////////////// G E S T I O N     P A R T I E

module.exports.RetournerEtat = function(request, response){
    
};

module.exports.AjouterJoueur = function(request, response) {
    var pseudo = request.body.pseudo;
    var equipe = request.body.equipe;
    if (len(joueurs) >= 4) {
	response.end("{ error: 'Plus de place sur la table' }");
    }
    else {
	var j;
	if (equipe == 1 && len(equipe1.joueurs) < 2) {
	    j = new module_joueur.Joueur(pseudo, equipe1);
	    joueurs.push(j);
	    equipe1.joueurs.push(j);
	}
	else if (equipe == 2 && len(equipe2.joueurs) < 2) {
	    j = new module_joueur.Joueur(pseudo, equipe2);
	    joueurs.push(j);
	    equipe2.joueurs.push(j);
	}
	else
	    response.end("{ error: 'Equipe inconnue ou pleine' }");
    }
};
