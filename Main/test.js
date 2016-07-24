// var User = require('../models/model.js');
// const express = require('express');
// const request = require('request');
// var graph = require('fbgraph');
// var utility = require('../models/utility.js');



// graph.setVersion("2.6");
// graph.setAccessToken('EAAQQyI1rDcUBAFzB4pMIYOBnQbFIuJvlmV68jqxithqRgoaYP90ZBZC629JezhLF57eSMew6PPtx8qv6DdelrLSAryPeZAIiGFz93ylWZB7yoJFQJZAQFZBxdZB5c57ZArcq0aJ5VS2qbokFE9nEsZBusdHsLumgHVmA34EzN2mQwawZDZD');

// User.findAll(function (err, users) {
// 	if (err) console.error(err);
// 	else {
// 		if (users.length>0) {
// 			for (var i=0; i<users.length; i++) {
// 				console.log(users[i]);
// 				graph.get(users[i].fbId, User.update(users[i].fbId,Uname,function(err){}){
// 					var Uname = res.first_name + ' ' + res.last_name;
// 					console.log(res);


// 				});
// 			}
// 		}
// 	}
// })
// var utility = require('../models/utility.js');

// utility.getUserName('1139314066115187').then(function(res){
// 	console.log(res);
// })
const cheerio = require('cheerio');
const express = require('express');
const request = require('request');
const app = express();
const async = require('async');
var opts = {
	'url': 'http://www.ajokeaday.com/jokes/random'
}
async.retry(5,function(cb,results){
	request(this.url, function(error, response, html){
		if(!error){
			console.log('requesting ...');
			var $ = cheerio.load(html);
			$('.jd-body').filter(function(){
				console.log("inside");

				var data = $(this);
				var joke = data.text();
				joke = joke.substring(20,joke.length - 19);
				if (joke.length < 320) cb(null,joke);
				else cb(new Error("Text longer than 320 characters"));

			})
		}
	}) 
}.bind(opts),function(err,results){
	console.log(results);
	console.log(results.length);
});

