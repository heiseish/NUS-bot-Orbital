var http = require('http');
var path = require('path');
var modules = path.resolve(__dirname, '../Resources/modules.json');
var classroom = path.resolve(__dirname,'../Resources/classroom.json');
var moduleInfo = path.resolve(__dirname,'../Resources/moduleInformation.json');
var fs = require("fs");

var d = new Date();
var weekday = new Array(7);
weekday[0]=  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var n = weekday[d.getDay()];
// var n = weekday[1];

var findModule =function(string){
  var s = /([A-Z])+([A-Z])+\d+\d+\d+\d+([A-Z])/;
  var r = /([A-Z])+([A-Z])+\d+\d+\d+\d/;

  var module = string.match(r);
  var module2 = string.match(s);
  if (module2 == null) {
    if (module == null)
      return -1;
    else 
      return module[0];
  }
  else
    return module2[0]; 
};

module.exports = {
  getModule: function (modulecode){
    return new Promise( function(response,reject){
     // var url = 'http://api.nusmods.com/' + ay + '/1/modules.json';
     // console.log("day");
     // http.get(url, function(res){
     //   var body = '';

     //   res.on('data', function(chunk){
     //     body += chunk;
     //   });

     //   res.on('end', function(){

      var body = fs.readFileSync(modules);
      var result = JSON.parse(body);

      var i = 0;
      while (i < result.length){
        if (result[i].ModuleCode === modulecode){

          delete result[i].CorsBiddingStats;
          response(result[i]);
        };
        i++;
      };
      if (i === result.length){
        reject(modulecode);
      }
    });
  },

  getLecturers: function (modulecode){
    return new Promise( function(response,reject){


      var body = fs.readFileSync(moduleInfo);
      var result = JSON.parse(body);

      var i = 0;
      while (i < result.length){
        if (result[i].ModuleCode === modulecode){
          console.log(result[i].Lecturers)
          response(result[i].Lecturers);
        };
        i++;
      };
      if (i === result.length){
        reject(modulecode);
      }
    });
  },

  getDescription: function (modulecode){
    return new Promise( function(response,reject){

      var body = fs.readFileSync(modules);
      var result = JSON.parse(body);

      var i = 0;
      while (i < result.length){
        if (result[i].ModuleCode === modulecode){
          console.log(result[i].ModuleDescription);
          response(result[i].ModuleDescription);
        };
        i++;
      };
      if (i === result.length){
        reject(modulecode);
      }
    });


  },

  getCors: function (modulecode, faculty){
    return new Promise( function(response,reject){

      var fs = require("fs");
      var body = fs.readFileSync(modules);
      var result = JSON.parse(body);

      var i = 0;
      while (i < result.length){
        if (result[i].ModuleCode === modulecode){

          var cors = result[i].CorsBiddingStats;
          for (var j = 0; j < cors.length; j++){
            if (cors[j].AcadYear !== "2015/2016"){

              cors.splice(j, 1);
              i--;
            };
          };
          for (var k = 0; k < cors.length; k++) {
            if (cors[k].Faculty !== faculty){
              cors.splice(k, 1);
            }
          }

          
          response(cors);
        };
        i++;
      };
      if (i === result.length){
        reject(modulecode);
      }
    });


  },



  findModule: function(string){
    var s = /([A-Z])+([A-Z])+\d+\d+\d+\d+([A-Z])/;
    var r = /([A-Z])+([A-Z])+\d+\d+\d+\d/;

    var module = string.match(r);
    var module2 = string.match(s);
    if (module2 == null) {
      if (module == null)
        return -1;
      else 
        return module[0];
    }
    else
      return module2[0]; 
  },

// find keyword in a string
findKey: function(string){
  var intent;

  if (string.search("TELL") != -1 && string.search("THAT") != -1)
    intent = "tell";
  else if (string.search("THANK YOU") != -1 || string.search("THANKS") != -1 || string === "TY" || string.search("TKS") != -1)
    intent = "thanks";
  else if (string === "OH" || string === "EH" || string === "AH" || string == "OK")
    intent = "filler";
  else if ((string.search("IDIOT") != -1 || string.search("STUPID") != -1 || string.search("CHEAPO") != -1 || string.search("NOOB") != -1) && (string.search("YOU") != -1 || string.search("BOT") != -1) || string.search("FUCK") == 0 || string.search("STUPID") == 0 || string.search("NOOB") == 0)
    intent = "insult";
  else if (string.search("FUCK") != -1 || string.search("STFU") != -1 || string.search("SHUT THE FUCK UP") != -1 || string.search("DKM") != -1 )
    intent = "insult2";
  else if (string === "AWESOME" || string === "NICE" || string.search("GOOD JOB") != -1 || string === "SMART" || ((string.search("AWESOME") != -1 || string.search("SMART") != -1 || string.search("NICE") != -1) && (string.search("BOT") != -1  || string.search("YOU") != -1)))
    intent = "commend";
  else if (string.search("SORRY") != -1)
    intent = "sorry";
  else if (string.search("WHERE IS") != -1 || string.search("LOCATION OF") != -1)
    intent = "location";
  else if (string.search("REMIND ME") != -1)
    intent = "remind";
  else if (string.search("PROF") != -1)
    intent = "prof";
  else if ((string.search("WHO") != -1 && (string.search('MADE YOU') != -1 || (string.search('CREATED YOU') != -1))) || string.search("WHO ARE YOU") != -1 || string.search("WHAT ARE YOU") != -1 || string.search("YOUR BOSS") != -1)
    intent = "intro";
  else if (string.search("HOW") != -1 && (string.search('MADE YOU') != -1 || (string.search('CREATED YOU') != -1) || (string.search('YOU CREATED') != -1)))
    intent = "delve";
  else if (string === "HI" || string.search("HI BOT") != -1  || string.search("HELLO") != -1 || string.search("--HELP") != -1 || string.search("WHAT CAN YOU DO") !== -1 || string.search("WHAT DO YOU DO") != -1 || string === "YO")
    intent = "help";
  else if (string.search("EXAM") != -1)
    intent = "exam";
  else if (string.search("CLASS") != -1 || string.search("LESSON") != -1)
    intent = "class";
  else if (string.search("CORS") != -1)
    intent = "cors"
  else if (string.search("MODULE") != -1)
    intent = "module";
  else if (string.search("DESCRIPTION") != -1 || string.search('CONTENT') != -1 || ((string.search('TELL') != -1 || string.search('WHAT') != -1) && findModule(string) != -1))
    intent = "description";
  else if ((string.search("EXAM") != -1 && string.search("CLASS") != -1) || ((findModule(string) != -1) &&  (string.search("EXAM") === -1) && (string.search("CLASS") === -1) && (string.search("CORS") === -1))) // need to add more to prevent abuse
    intent = "unsure";
  else if (string.search("QUANG") != -1 || string.search("GIANG") != -1)
    intent = "boss";
  else if (string.search("PHUC") != -1)
    intent = "phuc";
  else if (string.search("TELL ME A JOKE") != -1)
    intent = "joke";
  else if (string.search("HTTP") != -1 || string.search("www") != -1)
    intent = "url";
  
  
  // else if (string.search("EXAM") == -1 && string.search("CLASS") == -1)
  //   intent = "no intent"
  console.log(intent);
  return intent;
},

findLocation: function(string) {
  var location;
  var strToFind = "WHERE IS";
  var n = string.lastIndexOf(strToFind) + strToFind.length;
  location = string.slice(n);
  if (location.slice(-1) === '?')
    location = location.slice(0, -1);
  // console.log("location is " + location);
  return location;
},

findClass: function(modulecode){
  return new Promise( function(response,reject){
    var fs = require("fs");
    var body = fs.readFileSync(classroom);
    var result = JSON.parse(body);
    var val = [];

    var i = 0;
    var j = 0;
    console.log(modulecode);
    console.log(n);

    while (i < result.length){
      if ((result[i].ModuleCode === modulecode) && (result[i].DayText === n)) {
        val[j] = result[i];
        j++;
      };
      i++;
    }
    // console.log(val);
    if ( j !== 0 )
      response(val);
    else
      reject(Error("There is no class or lecture today. Chill mate"));
  })
},



}
