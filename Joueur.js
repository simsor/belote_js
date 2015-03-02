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
	
    }
};


/*
 * Classe représentant une équipe de joueurs
 */
function Equipe(numero) {
    this.joueurs = [];
    this.score = 0;
    this.numero = numero;
}
