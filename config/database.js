var mongoose = require('mongoose');
// need to make this environment variable
mongoose.connect('mongodb://giang:Madara04@ds035664.mlab.com:35664/heroku_85w00jl0');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
	console.log("Connection to mongodb successful");
});
module.exports = mongoose;