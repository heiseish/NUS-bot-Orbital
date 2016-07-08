'use strict';


const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
var path = require('path');
var nus = require( path.resolve( __dirname, "./nusmod.js" ) );
var os = require('os');
const geocoder = require('geocoder');
const MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://localhost:27017/bot';
const assert = require('assert');


// Webserver parameter
const PORT = process.env.PORT || 8445;

const app = express();

app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());






MongoClient.connect(mongourl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to server");
      
      db.close();
    });