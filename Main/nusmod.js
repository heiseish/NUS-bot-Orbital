var http = require('http');
var path = require('path');
var modules = path.resolve( __dirname, "./modules.json");
var classroom = path.resolve( __dirname, "./classroom.json");

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
      var fs = require("fs");
      var body = fs.readFileSync(modules);
      var result = JSON.parse(body);
      // console.log(typeof body);

      var i = 0;
      while (i < result.length){
        // console.log("outside if" + modulecode);
        if (result[i].ModuleCode === modulecode){
        // console.log(modulecode)
        delete result[i].CorsBiddingStats;
        // console.log(result[i]);
        response(result[i]);

      };
      i++;
    };
    if (i === result.length){
      reject(modulecode);
    }

  });


  },

 

// Our own functions

// find Module in a string
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
  console.log(string);
  if (string.search("WHO") != -1 && (string.search('MADE YOU') != -1 || (string.search('CREATED YOU') != -1)))
    intent = "intro";
  else if (string.search("HOW") != -1 && (string.search('MADE YOU') != -1 || (string.search('CREATED YOU') != -1) || (string.search('YOU CREATED') != -1)))
    intent = "delve";

  else if ((string  === "HI")  || string.search("HELLO") != -1 || string.search("--HELP") != -1 || string.search("WHAT CAN YOU DO") !== -1 || string.search("WHAT DO YOU DO") != -1)
    intent = "help";
  else if (string.search("EXAM") != -1 && string.search("CLASS") != -1)
    intent = "unsure";
  else if (string.search("EXAM") != -1)
    intent = "exam";
  else if (string.search("CLASS") != -1)
    intent = "class";
  else if (string.search("MODULE") != -1)
    intent = "module";
  // else if (string.search("EXAM") == -1 && string.search("CLASS") == -1)
  //   intent = "no intent"
  console.log(intent);
  return intent;
},


  convertPeriod: function(str){
    if (str.search("M") != -1)
      return str[str.indexOf("M") - 4 ] + ' hours and ' + str[str.indexOf("M") - 2 ]+ str[str.indexOf("M") - 1 ] + ' minutes';
    else
      return str[str.indexOf("H") - 1 ] + ' hours';

  },

  convertTime: function(str){
    console.log(str);
    var date = str.substring(0 , str.indexOf("T"));
    var time = str.substring(str.indexOf("T") + 1 , str.indexOf("T") + 6 );
    return time + ' on ' + date;
  },

  findClass: function(modulecode){
  return new Promise( function(response,reject){
      var fs = require("fs");
      var body = fs.readFileSync(classroom);
      var result = JSON.parse(body);
      // console.log(typeof body);

      // create array of object
      // console.log(result[0]);
      var val = [];

      var i = 0;
      var j = 0;
      console.log(modulecode);
      console.log(n);

      while (i < result.length){
        // console.log("outside if" + modulecode);
        if ((result[i].ModuleCode === modulecode) && (result[i].DayText === n)) {
        // console.log(modulecode)
        // console.log(result[i]);
        val[j] = result[i];
        // console.log(val[j]);
        j++;
        // console.log(result[i]);
        

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

  trimVenue: function(str){
    if (str.search('-') !== -1)
      return str.substring(0, str.indexOf("-"));
    else
      return str;
  }
}
