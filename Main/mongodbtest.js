var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
const mongourl = process.env.MONG_URL;


// Use connect method to connect to the Server
MongoClient.connect(mongourl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', mongourl);

    // Get the documents collection
    var collection = db.collection('users');

    // Insert some users
    collection.find({}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        for (var i = 0;  i < result.length; i++){
        	console.log(result[i].id);

        }
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
      //Close connection
      db.close();
    });
  }
});