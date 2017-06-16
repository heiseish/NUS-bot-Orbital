var natural = require('natural');
natural.PorterStemmer.attach();


// check if similar question exists
var compareQuestions = (array,question) =>{
	for (var i =0; i< array.length;i++){
		console.log(array[i]);
		if (natural.JaroWinklerDistance(array[i].question,question) < 0.90) return true
	}
	return false;
}
module.exports = compareQuestions;
// console.log(natural.JaroWinklerDistance('How to log into Unix','how to log into Unix ha'))
// console.log(natural.JaroWinklerDistance('How to log into Unix','log into unix'))