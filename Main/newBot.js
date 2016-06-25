'use strict';


const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
var path = require('path');
var nus = require( path.resolve( __dirname, "./nusmod.js" ) );
var os = require('os');

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Messenger API parameters
const FB_PAGE_ID = process.env.FB_PAGE_ID;
if (!FB_PAGE_ID) {
  throw new Error('missing FB_PAGE_ID');
}
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;


const sessions = {};
const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbReq = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: { access_token: FB_PAGE_TOKEN },
  headers: {'Content-Type': 'application/json'},
});

const fbMessage = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        text: msg,
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

const fbMessageWithButtons = (recipientId, msg, val1, val2, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        'attachment': {
        	'type': 'template',
        	'payload': {
        		'template_type': 'button',
        		'text': msg,
        		'buttons': [
        		{
        			'type': 'postback',
        			'title': val1,
        			'payload': 'yay'
        		},
        		{
        			'type': 'postback',
        			'title': val2,
        			'payload': 'nay'
        		}
        		]
        	}
        },
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

const fbMessageWithButtons_location = (recipientId, msg, location, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        'attachment': {
          'type': 'template',
          'payload': {
            'template_type': 'button',
            'text': msg,
            'buttons': [
            {
              'type': 'web_url',
              'url': 'http://map.nus.edu.sg/#page=search&type=by&qword=' + location + '&p=1',
              'title': 'Search Location'
              
            }
            ]
          }
        },
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};


// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());

// Webhook setup
app.get('/fb', (req, res) => {
  if (!FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
  }
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
} else {
  res.sendStatus(400);
}
});

// Message handler
app.post('/fb', (req, res) => {


  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {

    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    const sessionId = findOrCreateSession(sender);



    if (event.message && event.message.text) {
     let text = event.message.text.toUpperCase()
     merge(sender, text, sessionId);
     execute(sender,text,sessionId);
   }



   if (event.postback) {
    let text = sessions[sessionId].text


    switch(sessions[sessionId].intent){
      case 'unsure':
      if (event.postback.payload == 'yay' ) {
        // intent === exam
        text = text.replace('CLASS','');
        execute(sender,text,sessionId);
        
      } else {
        // intent === class
        text = text.replace('EXAM','');
        execute(sender,text,sessionId);
        
      }
      break;

    

      case 'class':
      if (event.postback.payload == 'yay' ) {
        fbMessage(sender,'It is my pleasure!');
        delete sessions[sessionId];
        console.log('session terminated');
      }
      break;

      case 'exam':
      delete sessions[sessionId].intent;
      delete sessions[sessionId].module;

      if (event.postback.payload == 'yay' ) {
        fbMessage(sender,'It is my pleasure!');
        delete sessions[sessionId];
        
        console.log('session terminated');
      } else {

        merge(sender,'HI',findOrCreateSession(sender));
        
        execute(sender,sessions[sessionId].text,findOrCreateSession(sender));
        
        // console.log('session terminated');
      }
    }
  }
}

res.sendStatus(200);
});

//function to check text
var merge = (sender, msg, sessionId) => {
  console.log("Merging ...");
  var intent = nus.findKey(msg);
  var module = nus.findModule(msg);
  if (intent != null)
    sessions[sessionId].intent = intent;
  if (module != null)
    sessions[sessionId].module = module;
  sessions[sessionId].text = msg;
}

var execute = (sender, msg , sessionId ) => {

  console.log("Executing ...");
  console.log(msg);
  console.log(sessions[sessionId]);
  
	// var module = nusmod.findModule(msg);
  // If there is a module 
  if (sessions[sessionId].module !== -1) {

   switch(sessions[sessionId].intent){
    case "unsure":

    fbMessageWithButtons(sender,"Do you wish to find class location or examination detail?", 'Exam Detail', 'Class Location');

    break;

		// case "no intent":

		// fbMessage(sender,"We are not ready for this sh*t");
		// break;

		case "class":

		
		var result = {};

    nus.findClass(sessions[sessionId].module).then(function(res){

      for (var i = 0; i < res.length; i++){

        var messageToSend = res[i].LessonType + ": STARTS AT " + res[i].StartTime + ' AND ENDS AT ' + res[i].EndTime + ' , @' + res[i].Venue;
        // console.log(messageToSend);

        // console.log(nus.trimVenue(res[i].Venue));

        fbMessageWithButtons_location(sender,messageToSend,nus.trimVenue(res[i].Venue));
      };
    // delete sessions[sessionId];
    console.log("Waiting for other messages");

  }).catch(function(err){
      // console.log(err);

      var messageToSend = "Either there is no such module or there is no class for that module today.";
      fbMessage(sender,messageToSend);
      console.log("Waiting for other messages");

    });

  break;

  case "exam":


  var result = {};

  nus.getModule(sessions[sessionId].module).then(function(res){
				// console.log(nus.findModule(msg));
				// console.log(res);
				result = Object.assign(result,res);
        // console.log(result);

        var messageToSend = "The time of examination of module " + sessions[sessionId].module + " is at " + nus.convertTime(result.ExamDate) + ", it will last for " + nus.convertPeriod(result.ExamDuration) +
        " and it will be held in " + result.ExamVenue + ".";
        
        fbMessageWithButtons(sender,messageToSend,'Thank you', 'Help me');
		// delete sessions[sessionId];
		console.log("Waiting for other messages");

  }).catch(function(err){
   console.log(err);

   var messageToSend = "Sorry we cannot find your module";
   fbMessage(sender,messageToSend);
   console.log("Waiting for other messages");

 });



}
} else if (sessions[sessionId].intent != null) {
  switch(sessions[sessionId].intent){
    case "help":
    fbMessage(sender,"Hi, my name is NUS bot builded with node.js. Ask me anything with the following formats: " + os.EOL + 
      "1. If you wish to know about class location of any module today, include 'class <modulecode>'" + os.EOL +
      "2. If you wish to know about exam detail of any module, include 'exam <modulecode>'" + os.EOL +
      "3. You can even ask me what's the meaning of life xD");
    delete sessions[sessionId];

    
    // fbMessage(sender,"1. If you wish to know about class location of any module today, include 'class <modulecode>'");
    // fbMessage(sender,"2. If you wish to know about exam detail of any module, include 'exam <modulecode>' ");
    // fbMessage(sender,"3. I can be your calculator xD");
    // fbMessage(sender,"4. I know everyone famous in the history of mankind. You can even ask me what's the meaning of life");
    break;



    case "module":
    fbMessage(sender,"Which module are you referring to and what do you want to know about it ( exam / class). You can always type --help for help <3");
    break;

    default:
    fbMessage(sender,'There is either no module indicated or we cannot find that module. Please try again');
  }
}

else if (sessions[sessionId].intent == null && sessions[sessionId].module == -1){
  //Wolfram API here
  //id1: YRV6XE-V42GEH4RPY
  console.log("before wolfram query");
  var wolfram_key = "YRV6XE-V42GEH4RPY";
  var wolfram = require('wolfram-alpha').createClient(wolfram_key);
  
  wolfram.query(sessions[sessionId].text, function (err, result) {
    console.log("Getting answer from Wolfram ...");
    if (err) throw err;
    // result = JSON.parse(result);
    console.log(result);
    if (result[1] != null){
      fbMessage(sender, result[1].subpods[0].text);
      fbMessage(sender, "Not what you're looking for? You can type --help for help" );
    }
    else {
      fbMessage(sender, "Hmmm interesting. Let me think about it");
      fbMessage(sender, "Not what you're looking for? You can type --help for help" );
    }
  });
}

}


