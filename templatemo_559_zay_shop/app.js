const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// app.set('layout', './layout/header');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false', { useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/index', function (req, res) {
    res.render('index');
});

app.get('/contact', function(req, res) {
    res.render('contact');

});

app.get('/shop', function(req, res) {
    res.render('shop');

});

app.get('/shop-single', function(req, res) {
    res.render('shop-single');

});

app.get('/about', function(req, res) {
    res.render('about');
});

app.get('/admin/login', function(req, res) {
    res.render('admin/login');
    // res.redirect('admin/login');
});

app.get('/admin/index', function(req, res) {
    res.render('admin/index') 
});

app.listen(3000);