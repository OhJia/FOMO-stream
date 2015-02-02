// var servi = require('servi');

// var app = new servi(true);

var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var serveStatic = require('serve-static');

var Codebird = require("codebird");

var cb = new Codebird;

// servi stuff
var servi = require("servi"); //servi module is in node, link it here; link other modules likes thi
var servi_app = new servi(true); //create new instance of an app; base server
var db = useDatabase("people");

var app = express();



// app.get('/', function (req, res) {
//   res.send('Hello World!')
// });

app.use(cookieParser());
app.use(session({
  secret: 'COOKIE HASH',
  resave: true,
  saveUninitialized: true
}));


var server = app.listen(3002, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});


// if (typeof run === 'function') {
//   app.defaultRoute(run);
// }


var twitter_consumer_key = 'APP TOKEN';
var twitter_consumer_secret = 'APP SECRET';
cb.setConsumerKey(twitter_consumer_key, twitter_consumer_secret);


var OAuth = require('oauth').OAuth
var oauth = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      twitter_consumer_key,
      twitter_consumer_secret,
      "1.0",
      "http://localhost:3000/auth/twitter/callback",
      "HMAC-SHA1"
    );

 app.get('/auth/twitter', function(req, res) {
 
  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
    if (error) {
      console.log(error);
      res.send("Authentication Failed!");
    }
    else {
      req.session.oauth = {
        token: oauth_token,
        token_secret: oauth_token_secret
      };
      //console.log(req.session.oauth);
      //console.log(results);
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
    }
  });
 
});


 app.get('/auth/twitter/callback', function(req, res, next) {
 
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth_data = req.session.oauth;
 
    oauth.getOAuthAccessToken(
      oauth_data.token,
      oauth_data.token_secret,
      oauth_data.verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          console.log(error);
          res.send("Authentication Failure!");
        }
        else {
          req.session.oauth.access_token = oauth_access_token;
          req.session.oauth.access_token_secret = oauth_access_token_secret;
          //console.log(results, req.session.oauth);
          // res.send("Authentication Successful");

		// codebird stuff
		cb.setToken(oauth_access_token, oauth_access_token_secret);

        cb.__call(
	    	"account_verifyCredentials",
	    	{},
	    	function (reply) {
	    		// console.log(reply)
	    		db.add({
		    		name: reply.name, 
		    		screen_name: reply.screen_name, 
		    		profile_photo: reply.profile_image_url, 
		    		token: oauth_access_token, 
		    		token_secret: oauth_access_token_secret
	    		}); // db stuff

	    });

          res.redirect('/'); // You might actually want to redirect!
        }
      }
    );
  }
  else {
    res.redirect('/'); // Redirect to login page
  }
 
});



app.get('/keys.js', function(req, res, next) {
	// Has session set
	if (req.session.oauth) {
		db.getAll(handleData);

		function handleData(data){
			var content = {
				consumer_key : twitter_consumer_key,
				consumer_secret : twitter_consumer_secret,
				people : {} //empty hash
			};

			for (var i = 0; i<data.length; i++){
				content.people[ data[i].screen_name ] = data[i]; //defining hash
			}

			res.send( "var server_oauth = " + JSON.stringify(content) + ";" );
		}
		// res.send("\
		// 	var server_oauth = {\
		// 		consumer_key : '"+ twitter_consumer_key +"',\
		// 		consumer_secret : '"+ twitter_consumer_secret +"',\
		// 		token_key : '" + req.session.oauth.access_token +"',\
		// 		token_secret : '" + req.session.oauth.access_token_secret +"'\
		// 	};"
		// );
	// Has not authenticated yet
	} else {
		res.send("// No oAuth info. Must authenticate first.");
	}
});

function showAll(request) {


}

app.use(express.static(__dirname + '/public'));
