'use strict';

require('newrelic');
var User = require('../models/model.js');
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
var path = require('path');
var nus = require('../models/nusmod.js');
var os = require('os');
const geocoder = require('geocoder');
var schedule = require('node-schedule'); 
const fs = require('fs');
const cheerio = require('cheerio');
var utility = require('../models/utility.js');
var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();





//Get wolfram
var date = new Date();
date = date.getDate();
if (date % 2 == 1)
  var wolfram_key = "YRV6XE-V42GEH4RPY";
else 
  var wolfram_key = "KE8U2V-UGWP6UJQ6L";
    // LOL
    var wolfram = require('wolfram-alpha').createClient(wolfram_key);

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
// graph.setAccessToken(FB_PAGE_TOKEN);
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

//Create Session
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
    sessions[sessionId] = {fbid: fbid, context: {}, text: ''};
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

const fbMessageWithPicture = (recipientId, url, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        'attachment': {
          'type': 'image',
          'payload': {
            "url": url,
          }
          // 'stickerID': '144885022352431'
        },
      },
    },
  };
  if ((Math.floor(Math.random() * 9) + 1)%3 === 0) {
    opts.form.message.attachment.payload.url = "http://img-comment-fun.9cache.com/media/287e9c03142541764332921489_700wa_0.gif";
  } else if ((Math.floor(Math.random() * 9) + 1)%3 === 1){
    opts.form.message.attachment.payload.url = "http://img-comment-fun.9cache.com/media/5c35c4a6146061814643754935_700wa_0.gif";
  } else { // nothing is done

  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

const fbMessageWithButtons_TY = (recipientId, msg, val1, val2, cb) => {
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

const fbMessageWithButtons_US1 = (recipientId, msg, val1, val2, cb) => {
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
              'payload': 'exam'
            },
            {
              'type': 'postback',
              'title': val2,
              'payload': 'class'
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

const fbMessageWithButtons_US2 = (recipientId, msg, val3, val4, cb) => {
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
              'title': val3,
              'payload': 'description'
            },
            {
              'type': 'postback',
              'title': val4,
              'payload': 'cors'
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

const fbMessageQuickReply = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      "message":{
        "text": msg,
        "quick_replies":[
        {
          "content_type":"text",
          "title":"Yes",
          "payload":"yes"
        },
        {
          "content_type":"text",
          "title":"No",
          "payload":"no"
        }
        ]
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};
//---> End Messenger API code

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
    res.status(200).send(req.query['hub.challenge']);
} else {
  res.sendStatus(403);
}
});


// REMINDER HERE

// NOTES: date is set in GMT 0+, not Singapore time

var round0 = new Date(2016, 6, 21, 9, 15, 0);
remind(round0,'Open Bidding Round 0 has started and it will end at 5pm tomorrow');
var roundopen1a = new Date(2016, 6, 25, 9, 0, 0);
remind(roundopen1a,'Open Bidding Round 1A has started and it will end at 1pm tomorrow');
var roundclosed1a = new Date(2016, 6, 26, 13, 0, 0);
remind(roundclosed1a,'Closed Bidding Round 1A has started and it will end at 5pm later');
var roundopen1b = new Date(2016, 6, 27, 9, 0, 0);
remind(roundopen1b,'Open Bidding Round 1B has started and it will end at 3pm later');
var roundclosed1b = new Date(2016, 6, 27, 15, 0, 0);
remind(roundclosed1b,'Closed Bidding Round 1B has started and it will end at 5pm later');
var roundopen1c = new Date(2016, 6, 28, 9, 0, 0);
remind(roundopen1c,'Open Bidding Round 1C has started and it will end at 3pm tomorrow');
var roundclosed1c = new Date(2016, 6, 29, 13, 0, 0);
remind(roundclosed1c,'Closed Bidding Round 1C has started and it will end at 5pm later');

var roundopen2a1 = new Date(2016, 7, 1, 9, 0, 0);
remind(roundopen2a1,'Open Bidding Round 2A has started and it will end at 8.59am tomorrow');
var roundopen2a2 = new Date(2016, 7, 3, 9, 0, 0);
remind(roundopen2a2,'Open Bidding Round 2A has started again and it will end at 1pm later');
var roundclosed2a = new Date(2016, 7, 3, 13, 0, 0);
remind(roundclosed2a,'Closed Bidding Round 2A has started and it will end at 5pm later');
var roundopen2b = new Date(2016, 7, 4, 9, 0, 0);
remind(roundopen2b,'Open Bidding Round 2B has started and it will end at 3pm later');
var roundclosed2b = new Date(2016, 7, 4, 15, 0, 0);
remind(roundclosed2b,'Closed Bidding Round 2B has started and it will end at 5pm tomorrow');

var roundopen3a = new Date(2016, 7, 8, 9, 0, 0);
remind(roundopen3a,'Open Bidding Round 3A has started and it will end at 3pm later');
var roundclosed3a = new Date(2016, 7, 8, 15, 0, 0);
remind(roundclosed3a,'Closed Bidding Round 3A has started and it will end at 5pm later');
var roundopen3b = new Date(2016, 7, 10, 9, 0, 0);
remind(roundopen3b,'Open Bidding Round 3B has started and it will end at 3pm later');
var roundclosed3b = new Date(2016, 7, 10, 15, 0, 0);
remind(roundclosed3b,'Closed Bidding Round 3B has started and it will end at 5pm later');

var test = new Date(2016, 6, 20, 11, 43, 30);
remind(test,'Hi Boss. Your reminder test is finally successful');



// Message handler
app.post('/fb', (req, res) => {


  //Receive message
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {

    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    const sessionId = findOrCreateSession(sender);
    console.log(event);
    
    

    //handle attachment
    if (event.message && event.message.attachments) {

      switch (event.message.attachments[0].type){
        case 'image':
        fbMessageWithPicture(sender, 'http://i0.kym-cdn.com/photos/images/newsfeed/000/096/044/trollface.jpg?1296494117');
        break;

        case 'video':
        fbMessage(sender,'Lol video too long I am not gonna watch it');
        break;

        case 'audio':
        fbMessage(sender,'Woah you got such a nice voice');
        break;

       // handle location
       case 'location':
       let lat = event.message.attachments[0].payload.coordinates.lat
       let long = event.message.attachments[0].payload.coordinates.long
       geocoder.reverseGeocode( lat, long, function ( err, data ) {
        fbMessage(sender,'I see that you are @ '+ data.results[0].formatted_address + ' right now!');

      });

        // console.log(event.message.attachments[0].payload.coordinates);

      }
      delete sessions[sessionId];
    }

   // Handle quick reply 
   if (event.message && event.message.quick_reply){
    // When intent is remind. Handle Yes/no reply
    if (sessions[sessionId].intent === 'remind') {
      if (event.message.quick_reply.payload === 'no'){
        User.deleteUser(sender, function(err) {
          if (err) {
            fbMessage(sender,"Too bad. You are not in our database!");
            console.error(err);
          }
          else 
            fbMessage(sender,"You are removed from our databased!");
        });      
      } else {
        User.addUser(sender, function(err, user) {
          if (err) {
            fbMessage(sender,"You already asked me to remind you mate! Cheers!");
            console.error(err);
          }
          else 
            fbMessage(sender,"Got it! Leave it to me");
        });
      }
      delete sessions[sessionId];
    }
    else if (sessions[sessionId].intent === 'location') {
      if (event.message.quick_reply.payload === 'no'){
        //query wolfram here 
        wolfram.query(sessions[sessionId].text, function (err, result) {
          console.log("Getting answer from Wolfram ...");
          if (err) throw err;
          console.log(result[1].subpods[0]);
          if (result[1] != null){
            fbMessageWithPicture(sender, result[1].subpods[0].image)
          }
          else {
            fbMessage(sender, "Hmmm interesting. Let me think about it. You can always type --help for help.");
          }
        }); 
      } else {
        fbMessageWithButtons_location(sender, "Click on the button below to find location", sessions[sessionId].location);
      }
      delete sessions[sessionId];
    }
  }

    //Merge and Execute Text
    else if (event.message && event.message.text) {
     let text = event.message.text.toUpperCase();
    //  if (event.message.From.Name){
    // 	console.log(event.message.From.Name);
    // }
     // console.log(lngDetector.detect('This is a test.')[0][0]);
     // console.log(lngDetector.detect(text,1));
     
    // lang detector cannot handle small words??!! Xin chao bannot be handled.
    // Check to see if array is empty

    merge(sender, text, sessionId);
    execute(sender, text,sessionId);
    
  }


   // If user press a button. Merge and execute Postbacks
   if (event.postback) {
    let text = sessions[sessionId].text

    switch(sessions[sessionId].intent){
      case 'unsure':
      console.log(text);
      if (event.postback.payload === 'exam' ) {
        // intent === exam
        if (text.search('CLASS') != -1) {
          text = text.replace('CLASS','');
          merge(sender, text, sessionId);
          execute(sender,text,sessionId);
        } else {
          text += " EXAM";
          merge(sender,text, sessionId);
          execute(sender,text,sessionId);
        };
        
      } else if (event.postback.payload === 'class' ) {
        // intent === class
        if (text.search('EXAM') != -1) {
          text = text.replace('EXAM','');
          merge(sender, text, sessionId);
          execute(sender,text,sessionId);
        } else {
          text += " CLASS";
          merge(sender,text, sessionId);
          execute(sender,text,sessionId);
        };
        
      } else if (event.postback.payload === 'cors'){
        text += " CORS";
        merge(sender,text, sessionId);
        execute(sender,text,sessionId);
      }
      else if (event.postback.payload === 'description'){
        text += " DESCRIPTION";
        merge(sender,text, sessionId);
        execute(sender,text,sessionId);
      }
      break;


      default:

      if (event.postback.payload === 'yay' ) {
        fbMessage(sender,'It is my pleasure!');
        
        // console.log('session terminated');
      } else {

        fbMessage(sender,"Hi, I'm a NUS bot. Ask me with the following formats: " + os.EOL + 
          "1. To know about class location of any module today, include 'class <modulecode>'" + os.EOL +
          "2. To know about exam detail, include 'exam <modulecode>'" + os.EOL +
          "3. To know about cors bidding stats, include 'cors <modulecode>'" + os.EOL +
          "4. Include 'remind me' to alert whe bidding round comes");
      }
    }
  }
  res.sendStatus(200);
}

});

//function to merge context, session
var merge = (sender, msg, sessionId) => {
  console.log("Merging ...");
  var intent = nus.findKey(msg);
  var module = nus.findModule(msg);
  var location = nus.findLocation(msg);
  if (intent != null)
    sessions[sessionId].intent = intent;
  if (module != null)
    sessions[sessionId].module = module;
  if (location != null)
    sessions[sessionId].location = location;

  sessions[sessionId].text = msg;
};

//function remind
function remind (date, msg){
  var reminder = schedule.scheduleJob(date, function(){
    User.findAll(function (err, users) {
      if (err) console.error(err);
      else {
        if (users.length>0) {
          for (var i=0; i<users.length; i++) {
            fbMessage(users[i].fbId,msg);
          }
        }
      }
    })
  });
};

//function decipher prof email



//Execute action based on context
var execute = (sender, msg , sessionId ) => {

  console.log("Executing ...");
  console.log(sessions[sessionId]);

    // If there is a module 
    if (sessions[sessionId].module !== -1) {

     switch(sessions[sessionId].intent){
      case 'unsure':
      fbMessageWithButtons_US1(sender,"Do you wish to find class location or examination detail?", 'Exam Detail', 'Class Location');
      fbMessageWithButtons_US2(sender,"Do you wish to find description or cors stat?", 'Description', 'Cors Bidding Stats');


      break;

      case "class":	
      var result = {};
      nus.findClass(sessions[sessionId].module).then(function(res){
        for (var i = 0; i < res.length; i++){
          var messageToSend = res[i].LessonType + ": STARTS AT " + res[i].StartTime + ' AND ENDS AT ' + res[i].EndTime + ' , @' + res[i].Venue;
          fbMessageWithButtons_location(sender,messageToSend,utility.trimVenue(res[i].Venue));
        };
        console.log("Waiting for other messages");

      }).then(function(){
       delete sessions[sessionId];
     }).catch(function(err){
      var messageToSend = "Either there is no such module or there is no class for that module today.";
      fbMessage(sender,messageToSend);
      console.log("Waiting for other messages");
    });

     break;

     //IF the intent is exam
     case "exam":
     var result = {};
     nus.getModule(nus.findModule(msg)).then(function(res){
      result = Object.assign(result,res);
      console.log(result);
      // var messageToSend = "The time of examination of module " + nus.findModule(msg) + " is at " + utility.convertTime(result.ExamDate) + ", it will last for " + utility.convertPeriod(result.ExamDuration) +
      // " and it will be held in " + result.ExamVenue + ".";
      var messageToSend = "The time of examination of module " + nus.findModule(msg) + " is at " + utility.convertTime(result.ExamDate) + ". Location is not yet known. Will update you someday :))";
     fbMessageWithButtons_TY(sender,messageToSend,'Thank you', 'Help me');
     console.log("Waiting for other messages");



   }).then(function(){
     delete sessions[sessionId];
   }).catch(function(err){
     console.log(err);
     var messageToSend = "Sorry we cannot find your module or the data of the exam is not yet updated.";
     delete sessions[sessionId];
     fbMessage(sender,messageToSend);
     console.log("Waiting for other messages");
   });
   break;

   case "prof":
   console.log("getting lecturers for " + sessions[sessionId].module);
   fbMessage(sender, "Lectures for module " + sessions[sessionId].module, function(err, data) {
     nus.getLecturers(sessions[sessionId].module).then(function(res, rej) {
      for (var i=0; i<res.length; i++) {
       fbMessage(sender,res[i]);
     }
     if (res.length == 0) {
       fbMessage(sender,"Sorry dude. Can't find any lecturers.");
     }
     delete sessions[sessionId];
   })
   });



   break;


   case "cors":
   console.log("cors");
   nus.getCors(nus.findModule(msg), "Science").then(function(res){

    var messageToSend;
    var i = 0;
    console.log(res);
    function corsRecursiveMessage() { fbMessage(sender, messageToSend, function (err, data) {
      messageToSend = "Year: " + res[i].AcadYear + ", Sem: " + res[i].Semester + ", Round: " + res[i].Round + ", Quota: " + res[i].Quota + ", Bidders: " + res[i].Bidders + 
      ", Low: " + res[i].LowestBid + ", Success: " + res[i].LowestSuccessfulBid + ", High: " + res[i].HighestBid + ", Type: " + res[i].StudentAcctType;
      if (i<res.length) {
        corsRecursiveMessage();
      }
      i++;
    });
  }
  corsRecursiveMessage();

  console.log("Waiting for other messages");



}).then(function(){
 delete sessions[sessionId];
}).catch(function(err){
 console.log(err);
 var messageToSend = "Sorry we cannot find your module. Re-enter the module?";
 fbMessage(sender,messageToSend);
 console.log("Waiting for other messages");
});
break;

case "description":
nus.getDescription(nus.findModule(msg)).then(function(res){
  var strArray = res.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
  var i = 0;
  function recursiveMessage() { fbMessage(sender, strArray[i], function (err, data) {
    if (i<strArray.length) {
      recursiveMessage();
    }
    else if (i==strArray.length) {
      fbMessage(sender, 'Find out more @ https://nusmods.com/modules/' + nus.findModule(msg));
    }
    i++;

  });
}
recursiveMessage();


console.log("Waiting for other messages");

}).then(function(){
 delete sessions[sessionId];
}).catch(function(err){
 console.log(err);
 var messageToSend = "Sorry we cannot find your module. Re-enter the module?";
 fbMessage(sender,messageToSend);
 console.log("Waiting for other messages");
});



}

  //If there is intent
} else if (sessions[sessionId].intent != null && sessions[sessionId].module == -1) {
  switch(sessions[sessionId].intent){

  	case "tell":
  	if (sessions[sessionId].fbid === '1139314066115187'){
  		fbMessage(sender,'Got it!');
  		fbMessage('1340406605974646',"Giang says '" + nus.findMessage(msg.toLowerCase()) + "'.")
  	} else if (sessions[sessionId].fbid === '1340406605974646'){
  		fbMessage(sender,'Alrighty!');
  		fbMessage('1139314066115187', "Quang says '" + nus.findMessage(msg.toLowerCase()) + "'.")
  	}
  	break;

    case "help":
    utility.getUserName(sender).then(function(res){
      console.log(res);
      console.log("here");
      fbMessage(sender,"Hi " + res);
      	// ", I'm a NUS bot. Ask me with the following formats: " + os.EOL + 
       //  "1. To know about class location of any module today, include 'class <modulecode>'" + os.EOL +
       //  "2. To know about exam detail, include 'exam <modulecode>'" + os.EOL +
       //  "3. To know about cors bidding stats, include 'cors <modulecode>'" + os.EOL +
       //  "4. Include 'remind me' to alert whe bidding round comes");
     }).then(function(){
       delete sessions[sessionId];
     })
     
     break;


     case "module":
     fbMessage(sender,"Which module are you referring to and what do you want to know about it ( exam / class). You can always type --help for help <3");
     break;

     case "intro":
     fbMessage(sender,'My name is N.A.B bot (not-a-bot Bot). I was created by Orbital project team Vietboi, which comprises masters Giang and Quang. I was created to serve you. Yes YOU!' + 
      ' Try to ask questions as specific as you can. Thank you and I wish you a nice day:)');
     delete sessions[sessionId];
     break;

     case "prof":

     var profName = utility.findProfName(msg);
     console.log(profName);


     var scrapeurl = 'https://myaces.nus.edu.sg/staffsearch/search?actionParam=staff&SearchValue=' + profName;

     request(scrapeurl, function(error, response, html){
      if(!error){
       console.log('requesting ...');
       var $ = cheerio.load(html);



       $('tr[height="20"]').filter(function(){

        var data = $(this);
        var fullNameOfProf = data.next().children().first().text(); 
        var designation = data.next().children().first().next().text();
        var department = data.next().children().first().next().next().text(); 
        var emailcoded = utility.trimCodedEmail(data.next().children().first().next().next().next().text());
        // console.log(emailcoded);


        var  emaildecoded = utility.decodeemail(emailcoded);
        if (department){
         fbMessage(sender,'Full Name: ' + fullNameOfProf + ', ' + designation + ', Department: ' + department + ', Email: ' + emaildecoded); 
       } else {
         fbMessage(sender,'We cannot find the professor detail. Is it really professor' + profName + '?');
       } 
     })
     }
   }) ;
     delete sessions[sessionId];


     break;

     case "insult":
     fbMessage(sender,"So sad... I'm starting to like you :'(")
     delete sessions[sessionId];
     break;

     case "thanks":
     fbMessage(sender,'It is my pleasure as always');
     delete sessions[sessionId];
     break;

     case "phuc":
     fbMessage(sender,'Phuc confirm gay lah. True whatt');
     fbMessageWithPicture(sender,'http://i0.kym-cdn.com/photos/images/newsfeed/000/096/044/trollface.jpg?1296494117');
     delete sessions[sessionId];
     break;

     case "commend":
     fbMessage(sender,'Thanks mate. I really appreciate it');
     break;

     case "delve":
     fbMessage(sender,'I was created by programming language PASCAL.' + os.EOL +
      '.' + os.EOL +
      '.' + os.EOL +
      '.' + os.EOL +
      '.' + os.EOL + 
      '.' + os.EOL +
      '.' + os.EOL +
      'Just KIDDING LEL not gonna tell you xD');
     delete sessions[sessionId];
     break;

     case "remind":
     fbMessageQuickReply(sender,'Do you wish me to remind you when each bidding round starts?');
     break;

     case "boss":
     fbMessage(sender, "He is the creator of this bot. Gossshhh!");
     delete sessions[sessionId];

     case "filler":
     delete sessions[sessionId];
     break;


     break;

     case "location":
     fbMessageQuickReply(sender,'Is it in NUS?');
     break;


     default:
     fbMessage(sender,'There is either no module indicated or we cannot find that module. Please try again');
   }
 }

 else if (sessions[sessionId].intent == null && sessions[sessionId].module == -1){
  if (lngDetector.detect(sessions[sessionId].text).length > 0){
    if (lngDetector.detect(sessions[sessionId].text)[0][0] === 'english') {
    //Wolfram API here    
    wolfram.query(sessions[sessionId].text, function (err, result) {
      console.log("Getting answer from Wolfram ...");
      if (err) throw err;
      console.log(result);
      if (result[1] != null){
        fbMessage(sender, result[1].subpods[0].text);
      }
      else {
        fbMessage(sender, "Hmmm interesting. Let me think about it. You can always type --help for help.");
      }
    });

  } else{
    fbMessage(sender,'Are you speaking ' + lngDetector.detect(sessions[sessionId].text)[0][0] + ' ? Sorry we are only able to handle English for now. Apology for any inconvenience caused!');
  }
}

}
};




