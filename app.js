//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();
//load environment variables
var dotenv = require('dotenv');
dotenv.load();

//fbgraph
var graph = require('fbgraph');

//twitter
var passport = require('passport');
var util = rquire('util');
var TwitterStrategy = require('passport-twitter').Strategy;

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

//routes
app.get('/', function(req,res) { 
	res.render("index");
});

//fbgraph authentication
app.get('/auth/facebook', function(req, res) {
	if (!req.query.code) {
		var authUrl = graph.getOauthUrl({
			'client_id': process.env.facebook_client_id,
			'redirect_uri': 'http://localhost:3000/auth/facebook',
			'scope': 'user_about_me'//you want to update scope to what you want in your app
		});

		if (!req.query.error) {
			res.redirect(authUrl);
		} else {
			res.send('access denied');
		}
		return;
	}
	graph.authorize({
		'client_id': process.env.facebook_client_id,
		'redirect_uri': 'http://localhost:3000/auth/facebook',
		'client_secret': process.env.facebook_client_secret,
		'code': req.query.code
	}, function( err, facebookRes) {
		res.redirect('/UserHasLoggedIn');
	});
});

app.get('/UserHasLoggedIn', function(req, res) {
	graph.get('me', function(err, response) {
		data = { facebookData: response};
		res.render('facebook', data);
	});
});



//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});