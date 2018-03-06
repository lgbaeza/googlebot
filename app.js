/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var watson = require('watson-developer-cloud');
var bodyParser = require('body-parser');


// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var session = require('express-session');
app.set('trust proxy', 1) // trust first proxy 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

function compare(a,b) {
  if (a.score < b.score)
    return -1;
  if (a.score > b.score)
    return 1;
  return 0;
}

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

/*var helmet = require('helmet')
app.use(helmet({
  frameguard: false
}));*/
var frameguard = require('frameguard')
app.use(frameguard({
  action: 'allow-from',
  domain: 'https://www.google.com'
}))

app.get('/sendMessage', function (req, res) {
  
  var sess = req.session;
  var message = req.query.message;

  var workspaceId = "";
  var conversation = watson.conversation({
    username: '',
    password: '',
    version: 'v1',
    version_date: '2017-04-21'
  });

  var context2 = {
    "sentimiento":"null"
  };
  if(req.query.restart == undefined)
  {
    context2 = sess.context;

  }

  var parameters = {
    'text': message,
    'features':{
      'emotions': true
    }
  };
  
  //Call Watson Tone Analyzer Service
  //var tone = new watson.ToneAnalyzerV3();

  conversation.message({
    workspace_id: workspaceId,
    input: {'text': message},
    context: context2
  },  function(err, response) {
      sess.context = response.context;

      var google_api_key = "AIzaSyB-Q7IUsjht6clfrGVenjSvoRoDRA8ggvo";
      var strMap = "";
      var strLibros = "";
      if(response.context.lugar !== undefined)
      {
        var search = encodeURI(response.context.lugar);
        
        var lat_lng = encodeURI("google mexico");
        
        strMap = "<br> <iframe " +
          "width=\"100%\" " +
          "height=\"250\" " +
          "frameborder=\"0\" style=\"border:0\" " +
          "src=\"https://www.google.com/maps/embed/v1/directions?origin=" + lat_lng + "&key=" + google_api_key +
          "&destination=" + search + "\" allowfullscreen>" +
          "</iframe>";
          delete response.context.lugar;
      }
      else if(response.context.libros !== undefined)
      {
        var search = encodeURI(response.context.libros);

        strLibros = "<a target=\"_blank\" href=\"https://www.google.com/search?tbm=bks&q=" + search + "\">Click aquí</a>";
        delete response.context.libros;
      }

      var msgOut = "";

      msgOut += "<div class=\"cb_vtt\">" +
				"<div class=\"cb_vtt_title\">@Visitante</div>" +
				message +
			"</div>";

    for(var j=0; j < response.output.text.length; j++)
    {
      msgOut = "<div class=\"cb_att\">" +
				"<div class=\"cb_att_title\">@Watson</div>" +
				response.output.text[j] +
			"</div>";
    }
    
       msgOut +=  strMap + strLibros;
      res.send(msgOut)
  });

});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
