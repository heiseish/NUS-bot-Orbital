// console.log("require utility successfully");
module.exports = {
	decodeemail: function(address)
	{		
		var coded = address
		const cipher = "aZbYcXdWeVfUgThSiRjQkPlOmNnMoLpKqJrIsHtGuFvEwDxCyBzA1234567890"
		var shift = coded.length;
		var link= "";
		var ltr;
		for (var i=0; i<shift; i++){
			if (cipher.indexOf(coded.charAt(i))==-1){
				ltr=coded.charAt(i)
				link+=(ltr)
			}
			else {     
				ltr = (cipher.indexOf(coded.charAt(i))-shift+cipher.length) % cipher.length
				link+=(cipher.charAt(ltr))
			}				
		}
		return link;
	},

	convertPeriod: function(str){
		if (str.search("M") != -1)
			return str[str.indexOf("M") - 4 ] + ' hours and ' + str[str.indexOf("M") - 2 ]+ str[str.indexOf("M") - 1 ] + ' minutes';
		else
			return str[str.indexOf("H") - 1 ] + ' hours';
	},

	convertTime: function(str){
		console.log(str);
		var date = str.substring(0 , str.indexOf("T"));
		var time = str.substring(str.indexOf("T") + 1 , str.indexOf("T") + 6 );
		return time + ' on ' + date;
	},

	trimVenue: function(str){
		if (str.search('-') !== -1)
			return str.substring(0, str.indexOf("-"));
		else
			return str;
	},

	trimCodedEmail: function(str){
		str = str.substring(str.indexOf("'") + 1 ,str.length - 5)
		return str;
	},
	
	findProfName: function(str){
		str = str.substring(str.indexOf("PROF") + 5)
		console.log(str);
		return str;
	},

	splitString: function(s, cb){
		var middle = Math.floor(s.length / 2);
		var before = s.lastIndexOf('.', middle);
		var after = s.indexOf('.', middle + 1);

		if (middle - before < after - middle) {
			middle = before;
		} else {
			middle = after;
		}

		var s1 = s.substr(0, middle);
		var s2 = s.substr(middle + 1);
		cb(s1, s2);
	}
}