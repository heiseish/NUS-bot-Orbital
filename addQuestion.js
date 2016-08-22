var Question = require('./models/Question.js');



// var newQuestion = new Question({
// 	questionArray:[{question:'hello girl'}],answer: '3rd',tagsArray: [{tag: 'hello'},{tag: 'girl'}]});

var newQuestion = new Question();

var questionString = "How to log in to Unix?";
var answerString = "You can find your answer here";
var tagString = "CS1010";

newQuestion.questionArray.push({question:questionString});
newQuestion.answer = answerString;
newQuestion.tagsArray.push({tag: tagString});

newQuestion.save(function(err){
	if (err) console.log(err)
	else console.log('Great added!');
})