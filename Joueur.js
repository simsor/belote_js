/*
 * Classe représentant un joueur de belote
 */

function Joueur(pseudo, equipe) {
    this.pseudo = pseudo;
    this.equipe = equipe;
    this.main = [];
}


/*
 * Classe représentant une équipe de joueurs
 */
function Equipe(numero) {
    this.joueurs = [];
    this.score = 0;
    this.numero = numero;
}
