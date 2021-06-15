var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cate = new Schema({
  name:  String,
  nameKhongDau: String

},{collection : 'cate'});

module.exports = mongoose.model('Cate', Cate);