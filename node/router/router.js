var JeuController = require('./../controllers/JeuController');

// Routes
module.exports = function(app){

    app.get("/recupererEtatJeu", JeuController.RetournerEtat);
    
    app.post("/rejoindreJeu", JeuController.AjouterJoueur);

};
