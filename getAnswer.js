var Question = require('./models/Question.js');


var getAnswer = (questionText, cb) => {
	Question.findQuestion(questionText, function(err, docs) {
		if (err) cb(err);
		var questionObject = docs[0];
		console.log(docs);
		if ((questionObject) && (questionObject.answer)) {
			cb(null, questionObject.answer);
			
		}
		else if (questionObject) {
			cb(new Error("Cannot find answer in database"));
		}
		else {
			cb(new Error("Cannot find question in database"))
		}

	})

}

module.exports = getAnswer;