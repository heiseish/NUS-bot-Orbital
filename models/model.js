var mongoose = require('../config/database.js');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	fbId: {type:String, require:true, unique:true},
	modules: [{code: String}]
});

// User defined functions
userSchema.statics.addUser = function(Id) {
	newUser = new this();
	newUser.fbId = Id;
	newUser.save(function (err,user) {
		if (err) return console.error(err);
		console.log("New user added");
	})
}

userSchema.statics.addModule = function(Id, module) {
	this.findOne({fbId: Id}, function(err, user) {
		if (err) return console.error(err);
		user.modules.push({code:module});
		user.save(function (err) {
			if (err) throw err;
			console.log(user.modules);
		})
	})
}

userSchema.statics.deleteModule = function(Id, module) {
	this.findOne({fbId: Id}, function (err, user) {
		if (err) return console.error(err);
		user.modules.push({code:module});
		user.save(function (err) {
			if (err) throw err;
			console.log(user.modules);
		})
	})
}

userSchema.statics.deleteUser = function(Id) {
	this.findOne({fbId: Id}, function(err, user) {
		if (err) return console.error(err);
		user.remove(function(err) {
			if (err) throw err;
			console.log("User successfully deleted!");
		})
	})
}

// Make the schema a model to export
var User = mongoose.model('User', userSchema);

module.exports = User;