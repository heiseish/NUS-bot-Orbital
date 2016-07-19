var mongoose = require('../config/database.js');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	fbId: {type:String, require:true, unique:true},
	modules: [{code: String}]
});

// User defined functions
userSchema.statics.addUser = function(Id, cb) {
	newUser = new this();
	newUser.fbId = Id;
	newUser.save(function (err,user) {
		cb(err, user);
	})
}

userSchema.statics.deleteUser = function(Id, cb) {
	this.findOne({fbId: Id}, function(err, user) {
		if (err) 
			cb(err);
		if (user != null) {
			user.remove(function(err) {
				cb(err);
			});
		}
		else {
			err = new Error("No such user");
			cb(err, user);
		}
	})
}

userSchema.statics.addModule = function(Id, module, cb) {
	this.findOne({fbId: Id}, function(err, user) {
		if (err) return console.error(err);
		var ifExist = 0; 
		for (i=0; i<user.modules.length; i++) {
			if (user.modules[i].code == module) {
				ifExist = 1;
			}
		}
		if (!ifExist) {
			user.modules.push({code:module});
			user.save(function(err) {
				cb(err, user);
			});
		}
		else 
			err = new Error("Module already exists");
		cb(err, user);
	})
}

userSchema.statics.deleteModule = function(Id, module, cb) {
	this.findOne({fbId: Id}, function(err, user) {
		if (err) return console.error(err);
		var ifExist = 0; 
		for (i=0; i<user.modules.length; i++) {
			if (user.modules[i].code == module) {
				ifExist = 1;
				user.modules.splice(i, 1);
			}
		}
		if (ifExist) {
			user.save(function(err) {
				cb(err, user);
			});
		}
		else 
			err = new Error("Module does not exist");
		cb(err, user);
	})
}

// Make the schema a model to export
var User = mongoose.model('User', userSchema);

module.exports = User;