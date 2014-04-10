/*
 * Database setting
 */

//-----------------------------
var dbHost = 'localhost';
var dbPort = 27017;
var dbName = 'SubsMySession';
var dbUser = 'sms';
var dbPasswd = 'sms';
//-----------------------------

var mongo = require('mongoskin');

var db = mongo.db('mongodb://' + dbUser + ':' + dbPasswd + '@' + dbHost + ':' + dbPort + '/' + dbName + '?auto_reconnect=true');

module.exports = db;
