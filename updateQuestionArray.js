var Question = require('./models/Question.js');
var compareQuestion = require('./compareQuestions');

// Check if user's question has existed in database
// if no push question to questionArray
var updateQuestionArray = (questionText, cb) => {
	Question.findQuestion(questionText, function(err, docs) {
		var questionObject = docs[0];
		if (compareQuestion(questionObject.questionArray,questionText)){
				questionObject.questionArray.push({question:questionText});
				questionObject.save();
				cb(null, questionObject);
		} else {
				
				cb(new Error('similar question alrdy exist'))
			
		}
		
	})

}

module.exports = updateQuestionArray;