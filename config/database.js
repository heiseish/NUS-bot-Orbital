var mongoose = require('mongoose');
// need to make this environment variable
const DB_URL = process.env.DB_URL;
mongoose.connect(DB_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
	console.log("Connection to mongodb successful");
});
module.exports = mongoose;