var mongoose = require('../config/database.js');

var questionSchema = new mongoose.Schema({
	questionArray: [{question: String}],
	answer: {type:String, unique:true},
	tagsArray : [{tag: String}],
});
questionSchema.index({'questionArray.question': 'text'});
// questionSchema.index({'$**': 'text'});

questionSchema.statics.findQuestion = function(questionText, cb) {
	Question.find({$text: {$search: questionText}},{ score : { $meta: "textScore" } }).sort({ score : { $meta : 'textScore' } }).exec(function(err,docs){
		if (err) console.log(err); 
		else cb(err, docs);
	})
}

questionSchema.statics.createQuestion = function(questionText,cb){
	newQuestion = new this();
 	newQuestion.questionArray.push({question: questionText});
 	newQuestion.tagsArray.push({tag: 'CS1010'});
	newQuestion.save(function (err,question) {
		cb(err, question);
	})
}

var Question = mongoose.model('questions', questionSchema);


module.exports = Question;


