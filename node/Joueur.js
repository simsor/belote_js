/*
 * Classe représentant un joueur de belote
 */

module.exports.Joueur = function (pseudo, equipe) {
    this.pseudo = pseudo;
    this.equipe = equipe;
    this.main = [];
    this.aPris = false;
};

module.exports.Joueur.prototype.aCouleur = function(couleur) {
    for (var i=0; i < this.main.length; i++) {
	if (this.main[i].couleur == couleur)
	    return true;
    }

    return false;
};

module.exports.Joueur.prototype.aAtout = function() {
    for (var i=0; i < this.main.length; i++) {
	if (this.main[i].atout)
	    return true;
    }

    return false;
};


/*
 * Classe représentant une équipe de joueurs
 */
module.exports.Equipe = function (numero) {
    this.joueurs = [];
    this.score = 0;
    this.belote = false;
    this.numero = numero;
    this.cartes_gagnees = [];
};

module.exports.Equipe.prototype.prendrePli = function(table) {
    this.cartes_gagnees = this.cartes_gagnees.concat(table.tapis);
    table.tapis.length = 0;
};

module.exports.Equipe.prototype.calculerScore = function() {
    var score_manche = 0;
    for(var i=0; i < this.cartes_gagnees.length; i++) {
	score_manche += this.cartes_gagnees[i].valeur;
    }

    if (this.belote) {
	score_manche += 20;
    }

    return score_manche;
};

module.exports.Equipe.prototype.aPris = function() {
    for (var i=0; i < this.joueurs.length; i++) {
	if (this.joueurs[i].aPris)
	    return true;
    }

    return false;
};
