const natural = require('natural');

var corpus = ['something', 'soothing'];
var spellcheck = new natural.Spellcheck(corpus);

console.log(spellcheck.isCorrect('cat')); // false
console.log(spellcheck.getCorrections('soemthing', 1)); // ['something']
console.log(spellcheck.getCorrections('soemthing', 2))// ['something', 'soothing']

// natural.PorterStemmer.attach();
// console.log("I am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());
// console.log(natural.PorterStemmer.stem("I")); // stem a single word

// natural.LancasterStemmer.attach();
// console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());

// console.log(natural.JaroWinklerDistance("dixon","dicksonx"))
// console.log(natural.JaroWinklerDistance('not', 'same'));
