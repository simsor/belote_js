var module_joueur = require("../Joueur");
var module_paquet = require("../Paquet");
var module_cycle = require("../cycle");

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

var deck = new module_paquet.Deck();
deck.genererDepuisFichier("../cartes.json");
var table = new module_paquet.Table(deck);
var etape = "attente"; // attente, tour1, tour2, manche


function joueurParPseudo(pseudo) {
    var joueur = undefined;
    for(var i=0; i < joueurs.length; i++) {
	if (joueurs[i].pseudo == pseudo) {
	    joueur = joueurs[i];
	    break;
	}
    }
    return joueur;
}

// ////////////////////////////////////////////// G E S T I O N     P A R T I E

module.exports.RetournerEtat = function(request, response){
    if (joueurs.length < 4) {
	response.end("{ error: 'Pas assez de joueurs' }");
    }
    else {
	var retour = {
	    etape: etape,
	    tapis: JSON.stringify(module_cycle.decycle(table.tapis)),
	    atout: JSON.stringify(module_cycle.decycle(table.atout)),
	    joueurActuel: table.index_joueur_courant,
	    equipes: [ JSON.stringify(module_cycle.decycle(equipe1)),
		       JSON.stringify(module_cycle.decycle(equipe2)) ]
	};

	response.end(JSON.stringify(retour));
    }
};

module.exports.JouerCarte = function(request, response) {
    if (joueurs.length < 4) {
	response.end("{ error: 'Pas assez de joueurs' }");
    }
    else {
	var carte = module_cycle.retrocycle(JSON.parse(request.body.carte));
	var pseudo = request.body.pseudo;
	var joueur = undefined;
	// On cherche le joueur correspondant au pseudo
	for(var i=0; i < joueurs.length; i++) {
	    if (joueurs[i].pseudo == pseudo) {
		joueur = joueurs[i];
		break;
	    }
	}

	if (table.joueurs[table.indice_joueur_courant].pseudo == joueur.pseudo) {
	    // On cherche la carte dans la main du joueur
	    var carte_serveur = undefined;
	    for(var i=0; i < joueur.main.length ; i++) {
		if (carte.couleur == joueur.main[i].couleur &&
		    carte.valeur == joueur.main[i].valeur) {
		    carte_serveur = joueur.main[i];
		    break;
		}
	    }
	    if (carte_serveur == undefined) {
		if (table.cartePeutEtreJouee(carte_serveur)) {
		    table.tapis.push(carte_serveur);
		    response.end("{ succes: 'Carte jouée' }");
		}
		else {
		    response.end("{ error: 'Cette carte ne peut pas être jouée' }");
		}
	    }
	    else {
		response.end("{ error: 'Vous n'avez pas cette carte' }");
	    }
	}
	else {
	    response.end("{ error: \"Ce n'est pas votre tour\" }");
	}
    }
};

function lancerNouvellePartie() {
    table.distributionInitiale();
    table.retourner();
    etape="tour1";
}

module.exports.AjouterJoueur = function(request, response) {
    var pseudo = request.body.pseudo;
    var equipe = request.body.equipe;
    var ancienne_longueur = joueurs.length;
    if (joueurs.length >= 4) {
	response.end("{ error: 'Plus de place sur la table' }");
    }
    else {
	var j;
	if (equipe == 1 && equipe1.joueurs.length < 2) {
	    j = new module_joueur.Joueur(pseudo, equipe1);
	    joueurs.push(j);
	    equipe1.joueurs.push(j);
	    table.joueurs.push(j);
	    response.end("{ success: 'Joueur ajouté' }");
	}
	else if (equipe == 2 && equipe2.joueurs.length < 2) {
	    j = new module_joueur.Joueur(pseudo, equipe2);
	    joueurs.push(j);
	    equipe2.joueurs.push(j);
	    table.joueurs.push(j);
	    response.end("{ success: 'Joueur ajouté' }");
	}
	else
	    response.end("{ error: 'Equipe inconnue ou pleine' }");
    }

    if (ancienne_longueur == 3 && joueurs.length == 4) {
	lancerNouvellePartie();
    }
};

module.exports.PrendreCarte = function(request, response) {
    var pseudo = request.body.pseudo;

    if (joueurs.length < 4) {
	response.end("{ error: \"La partie n'a pas commencé\" }");
    }
    else {
	console.log(pseudo);
	var joueur = joueurParPseudo(pseudo);

	if (joueur == undefined) {
	    response.end("{ error: \"Vous n'existez pas.\" }");
	}
	else {
	    if (table.joueurs[table.index_joueur_courant].pseudo == joueur.pseudo) {
		// C'est bien son tour
		if (etape == "tour1") {
		    table.fairePrendre(joueur, false);
		    etape = "tour2";
		}
		else if (etape == "tour2") {
		    var couleur = request.body.couleur;
		    table.fairePrendre(joueur, true, couleur);
		    etape = "manche";
		}
		else {
		    response.end("{ error: 'WTF' }");
		}
	    }
	    else {
		response.end("{ error: \"Ce n'est pas votre tour\" }");
	    }
	}
	
    }
};
