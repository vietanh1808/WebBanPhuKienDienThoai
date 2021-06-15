var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
 fullname 		: String,
 img 			: String,
 email 			: String,
 password 		: String,

},{collection : 'user'});

module.exports = mongoose.model('User', User);