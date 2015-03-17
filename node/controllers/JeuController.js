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
	response.end(JSON.stringify({ error: 'Pas assez de joueurs' }));
    }
    else {
	var retour = {
	    etape: etape,
	    carte_retournee: table.carte_retournee,
	    tapis: table.tapis,
	    atout: table.atout,
	    joueurActuel: joueurs[table.index_joueur_courant].pseudo,
	    equipes: [ equipe1,
		       equipe2 ]
	};

	response.end(JSON.stringify(module_cycle.decycle(retour)));
    }
};

function finDuTour() {
    var joueur_victoire = table.getMaitre();
    var equipe_victoire = joueur_victoire.equipe;
    equipe_victoire.prendrePli(table);

    if (joueur[0].main.length == 0) {
	// Alors la manche est finie !
	console.log("Fin de la manche");
	finDeLaManche();
    }
}

function finDeLaManche() {
    // On va calculer les scores de chaque équipe
    var score_e1 = equipe1.calculerScore();
    var score_e2 = equipe2.calculerScore();

    // On vérifie les capots
    if (equipe1.cartes_gagnees.length == 0) {
	// Equipe 1 capot
	score_e2 = 250;
	score_e1 = 0;
    }
    else if (equipe2.cartes_gagnees.length == 0) {
	// Equipe 2 capot
	score_e1 = 250;
	score_e2 = 0;
    }
    else {
	// On traite les dedans
	if (equipe1.aPris()) {
	    if (score_e1 < 80) {
		// Equipe 1 dedans
		score_e2 = 160;
	    }
	}
	else if (equipe2.aPris()) {
	    if (score_e2 < 80) {
		// Equipe 2 dedans
		score_e1 = 160;
	    }
	}
	// Else : Tout est OK, pas de cas particulier
    }

    equipe1.score += score_e1;
    equipe2.score += score_e2;

    // Enfin, on passe la main au joueur suivant
    if (table.index_distributeur == 3)
	table.index_distributeur = 0;
    else
	table.index_distributeur += 1;

    
    table.deck = equipe1.cartes_gagnees.concat(equipe2.cartes_gagnees);
    table.deck.couper();
    
    // On repasse étape à tour1
    etape = "tour1";

    lancerNouvellePartie();
}

module.exports.JouerCarte = function(request, response) {
    if (joueurs.length < 4) {
	response.end(JSON.stringify({ error: 'Pas assez de joueurs' }));
    }
    else if (etape != "manche") {
	response.end(JSON.stringify({ error: 'Pas le moment pour ca' }));
    }
    else {
	var carte = module_cycle.retrocycle(JSON.parse(request.body.carte));
	var pseudo = request.body.pseudo;
	var joueur = undefined;
	// On cherche le joueur correspondant au pseudo
	joueur = joueurParPseudo(pseudo);

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
		    response.end(JSON.stringify({ success: 'Carte jouée' }));

		    // La carte a été jouée, on vérifie si le tour est fini
		    if (table.tapis.length == 4) {
			console.log("Fin du tour");
			finDuTour();
		    }
		}
		else {
		    response.end(JSON.stringify({ error: 'Cette carte ne peut pas être jouée' }));
		}
	    }
	    else {
		response.end(JSON.stringify({ error: "Vous n'avez pas cette carte" }));
	    }
	}
	else {
	    response.end(JSON.stringify({ error: "Ce n'est pas votre tour" }));
	}
    }
};

function lancerNouvellePartie() {
    table.deck.melanger();
    table.distributionInitiale();
    table.retourner();
    etape="tour1";
}

module.exports.AjouterJoueur = function(request, response) {
    var pseudo = request.body.pseudo;
    var equipe = -1;
    if (equipe1.joueurs.length == 0 || (equipe2.joueurs.length == 1 && equipe1.joueurs.length == 1)) {
	equipe = 1;
    }
    else {
	equipe = 2;
    }
    console.log(equipe);
    var ancienne_longueur = joueurs.length;
    if (joueurs.length >= 4) {
	response.end(JSON.stringify({ error: 'Plus de place sur la table' }));
    }
    else {
	var j;
	if (equipe == 1 && equipe1.joueurs.length < 2) {
	    j = new module_joueur.Joueur(pseudo, equipe1);
	    joueurs.push(j);
	    equipe1.joueurs.push(j);
	    table.joueurs.push(j);
	    response.end(JSON.stringify({ success: 'Joueur ajouté', equipe: equipe }));
	}
	else if (equipe == 2 && equipe2.joueurs.length < 2) {
	    j = new module_joueur.Joueur(pseudo, equipe2);
	    joueurs.push(j);
	    equipe2.joueurs.push(j);
	    table.joueurs.push(j);
	    response.end(JSON.stringify({ success: 'Joueur ajouté' }));
	}
	else
	    response.end(JSON.stringify({ error: "Equipe inconnue ou pleine" }));
    }

    if (ancienne_longueur == 3 && joueurs.length == 4) {
	console.log("On lance la partie");
	lancerNouvellePartie();
    }
};

module.exports.PrendreCarte = function(request, response) {
    var pseudo = request.body.pseudo;

    if (joueurs.length < 4) {
	response.end(JSON.stringify({ error: "La partie n'a pas commencé" }));
    }
    else {
	console.log(pseudo);
	var joueur = joueurParPseudo(pseudo);

	if (joueur == undefined) {
	    response.end(JSON.stringify({ error: "Vous n'existez pas." }));
	}
	else {
	    if (table.joueurs[table.index_joueur_courant].pseudo == joueur.pseudo) {
		// C'est bien son tour
		if (etape == "tour1") {
		    table.fairePrendre(joueur, false);
		    table.distributionDeuxiemeTour();
		    etape = "manche";
		}
		else if (etape == "tour2") {
		    var couleur = request.body.couleur;
		    table.fairePrendre(joueur, true, couleur);
		    table.distributionDeuxiemeTour();
		    etape = "manche";
		}
		else {
		    response.end(JSON.stringify({ error: 'WTF' }));
		}
	    }
	    else {
		response.end(JSON.stringify({ error: "Ce n'est pas votre tour" }));
	    }
	}
	
    }
};

module.exports.PasserCarte = function(request, response) {
    var pseudo = request.body.pseudo;
    
    if (joueurs.length < 4) {
	response.end(JSON.stringify({ error: "La partie n'a pas commencé" }));
    }
    else {
	var joueur = joueurParPseudo(pseudo);

	if (joueur == undefined) {
	    response.end(JSON.stringify({ error: "Vous n'existez pas." }));
	}
	else {
	    if (table.joueurs[table.index_joueur_courant].pseudo == joueur.pseudo) {
		// C'est bien son tour

		if (table.index_joueur_courant == 3)
		    table.index_joueur_courant = 0;
		else
		    table.index_joueur_courant += 1;
	    }
	}
    }
};
