var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cart = new Schema({
  name 		:  String,
  email 	: String,
  sdt 		: String,
  msg 		: String,
  cart 		: Object,
  st 		: Number

},{collection : 'cart'});

module.exports = mongoose.model('Cart', Cart);