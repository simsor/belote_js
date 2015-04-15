var express         = require('express'),
    session         = require('express-session'),
    bodyParser      = require('body-parser'), //pour récupérer les résultats des post
    http            = require('http'),
    path            = require('path');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('port', 6800);
app.set('views', path.join(__dirname, 'views'));

// routes static, le routeur n'y aura pas accès
app.use('/image',express.static(path.join(__dirname+ '/public/image')));
app.use('/css',express.static(path.join(__dirname+'/public/css')));
app.use('/js',express.static(path.join(__dirname+'/public/js')));
app.use('/jeu',express.static(path.join(__dirname+'/public/main.html')));

app.use(session({
    secret: 'nC0@#1pM/-0qA1+é',
    name: 'Belote',
    resave: true,
    saveUninitialized: true
}));

// On permet d'accéder aux variables de session depuis les templates
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// chargement du routeur
require('./router/router')(app); 

http.createServer(app).listen(app.get('port'), function(){
  console.log('Serveur Node.js en attente sur le port ' + app.get('port'));
});

