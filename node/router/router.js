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
    // Entrée : rien si tour 1 (prends juste la carte)
    //          couleur si tour 2 : la couleur à laquelle on prend
    // Sortie : erreur ou success
    app.post("/prendreCarte", JeuController.PrendreCarte);
};
