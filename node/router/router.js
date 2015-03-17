var JeuController = require('./../controllers/JeuController');

// Routes
module.exports = function(app){

    // GET permettant de récupérer l'état actuel du jeu
    // Entrée : rien
    // Sortie : un tableau JSON à parse puis retrocycle
    app.get("/recupererEtatJeu", JeuController.RetournerEtat);


    // POST permettant de rejoindre une partie
    // Entrée : pseudo : le pseudo du joueur à ajouter
    // Sortie : error ou succes
    app.post("/rejoindreJeu", JeuController.AjouterJoueur);

    // POST permettant de prendre une carte
    // Entrée : juste le pseudo si tour 1 (prends juste la carte)
    //          pseudo et couleur si tour 2 : la couleur à laquelle on prend
    // Sortie : erreur ou success
    app.post("/prendreCarte", JeuController.PrendreCarte);

    // POST permettant de passer une carte
    // Entrée : le pseudo du joueur
    // Sortie : erreur ou success
    app.post("/passerCarte", JeuController.PasserCarte);

    // POST permettant de jouer une carte
    // Entrée : une carte JSON.parse(JSON.cycle(carte)) et un pseudo
    // Sortie : error ou success
    app.post("/jouerCarte", JeuController.JouerCarte);
};
