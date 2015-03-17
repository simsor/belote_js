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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Liste des objets utiles pour la partie
var joueurs = [];

var equipe1 = new module_joueur.Equipe(1);
var equipe2 = new module_joueur.Equipe(2);

var deck = new module_paquet.Deck();
deck.genererDepuisFichier("cartes.json");
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

    for(var i=0; i < joueurs.length; i++) {
	if (joueurs[i].pseudo == joueur_victoire.pseudo) {
	    table.index_joueur_courant = i;
	    break;
	}
    }

    if (joueurs[0].main.length == 0) {
	// Alors la manche est finie !
	console.log("Fin de la manche");
	finDeLaManche(equipe_victoire);
    }
}

function finDeLaManche(equipe_victorieuse) {
    // On va calculer les scores de chaque équipe
    var score_e1 = equipe1.calculerScore();
    var score_e2 = equipe2.calculerScore();

    // Le 10 de der
    if (equipe_victorieuse.numero == 1)
	score_e1 += 10;
    else
	score_e2 += 10;

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
	    if (score_e1 <= 80) {
		// Equipe 1 dedans
		score_e2 = 160;
		score_e1 = 0;
	    }
	}
	else if (equipe2.aPris()) {
	    if (score_e2 <= 80) {
		// Equipe 2 dedans
		score_e1 = 160;
		score_e2 = 0;
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

    table.index_joueur_courant = table.index_distributeur;

    
    table.deck.cartes = equipe1.cartes_gagnees.concat(equipe2.cartes_gagnees);
    console.log("Taille du deck : " + table.deck.cartes.length);
    table.deck.couper();
    console.log("Taille du deck après coupe : " + table.deck.cartes.length);
    
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

	if (table.joueurs[table.index_joueur_courant].pseudo == joueur.pseudo) {
	    // On cherche la carte dans la main du joueur
	    var carte_serveur = undefined;
	    for(var i=0; i < joueur.main.length ; i++) {
		if (carte.couleur == joueur.main[i].couleur &&
		    carte.valeur == joueur.main[i].valeur) {
		    carte_serveur = joueur.main[i];
		    break;
		}
	    }
	    if (carte_serveur != undefined) {
		console.log("Joueur de la carte : " + carte_serveur.joueur.pseudo);
		
		if (table.cartePeutEtreJouee(carte_serveur)) {
		    table.tapis.push(carte_serveur);
		    for(var i=0; i< joueur.main.length; i++) {
			if (carte_serveur.couleur == joueur.main[i].couleur &&
			    carte_serveur.valeur == joueur.main[i].valeur) {
			    joueur.main.remove(i);
			    break;
			}
		    }

		    if (table.tapis.length == 1) // c'était la première carte
			table.couleur_demandee = carte_serveur.couleur;
		    
		    response.end(JSON.stringify({ success: 'Carte jouée' }));

		    // On passe au joueur suivant
		    if (table.index_joueur_courant == 3)
			table.index_joueur_courant = 0;
		    else
			table.index_joueur_courant += 1;

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
    equipe1.cartes_gagnees.length = 0;
    equipe2.cartes_gagnees.length = 0;

    table.unsetAtout();
    table.atout = undefined;

    if (table.index_distributeur == 3)
	table.index_joueur_courant = 0;
    else
	table.index_joueur_courant = table.index_distributeur + 1;
    
    table.distributionInitiale();
    table.retourner();
    etape="tour1";

    console.log("Nombre de joueurs : " + joueurs.length);
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
	table.deck.melanger();
	lancerNouvellePartie();
    }
};

module.exports.PrendreCarte = function(request, response) {
    var pseudo = request.body.pseudo;

    if (joueurs.length < 4) {
	response.end(JSON.stringify({ error: "La partie n'a pas commencé, " + joueurs.length + " joueurs" }));
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
		    response.end(JSON.stringify({success: "Tour 1 fini"}));
		}
		else if (etape == "tour2") {
		    var couleur = request.body.couleur;
		    table.fairePrendre(joueur, true, couleur);
		    table.distributionDeuxiemeTour();
		    etape = "manche";
		    response.end(JSON.stringify({success: "Tour 2 fini"}));
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

		if (table.index_joueur_courant == table.index_distributeur + 1 && etape == "tour1") {
		    // Alors on a fait un tour complet, on passe au tour 2
		    etape = "tour2";
		}
		else if (table.index_joueur_courant == table.index_distributeur + 1 && etape == "tour2") {
		    // Alors fin du deuxième tour sans que personne ne prenne.
		    etape = "tour1";

		    table.deck.cartes.push(table.carte_retournee); // On la remet dans le paquet
		    for(var i=0; i < joueurs.length; i++) {
			table.deck.cartes = table.deck.cartes.concat(joueurs[i].main); // On remet la main du joueur dans le paquet
			joueurs[i].main.length = 0; // On vide sa main
		    }

		    table.deck.couper();
		    lancerNouvellePartie();
		}

		response.end(JSON.stringify({success: "Carte passée"}));
	    }
	    else {
		response.end(JSON.stringify({error:"Ce n'est pas votre tour."}));
	    }
	}
    }
};

module.exports.ArreterPartie = function(request, response) {
    joueurs.length = 0;
    table.deck.genererDepuisFichier("cartes.json");
    etape = "attente";
    equipe1.score = 0;
    equipe2.score = 0;
    equipe1.joueurs.length = 0;
    equipe2.joueurs.length = 0;
    equipe1.cartes_gagnees.length = 0;
    equipe2.cartes_gagnees.length = 0;

    table.carte_retournee = undefined;
    table.atout = undefined;
    table.couleur_demandee = undefined;
    table.index_distributeur = getRandomInt(0, 3);
    table.index_joueur_courant = (table.index_distributeur == 3) ? 0 : table.index_distributeur+1;

    response.end(JSON.stringify({success: "Partie réinitialisée."});
};
