/*
 * Classe représentant un joueur de belote
 */

function Joueur(pseudo, equipe) {
    this.pseudo = pseudo;
    this.equipe = equipe;
    this.main = [];
    this.aPris = false;
}

Joueur.prototype.aCouleur = function(couleur) {
    for (var i=0; i < this.main.length; i++) {
	if (this.main[i].couleur == couleur)
	    return true;
    }

    return false;
};

Joueur.prototype.aAtout = function() {
    for (var i=0; i < this.main.length; i++) {
	if (this.main[i].atout)
	    return true;
    }

    return false;
};


/*
 * Classe représentant une équipe de joueurs
 */
function Equipe(numero) {
    this.joueurs = [];
    this.score = 0;
    this.numero = numero;
}
