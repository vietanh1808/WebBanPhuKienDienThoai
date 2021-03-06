var express = require('express');
var router = express.Router();

var passport = require('passport');
var multer  = require('multer');

var User = require('../model/User.js');
var Cate = require('../model/Cate.js');
var Product = require('../model/Product.js');
var GioHang = require('../model/giohang.js');
var Cart = require('../model/Cart.js');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, './public/upload');
	},
	filename: function (req, file, cb) {
	  cb(null, Date.now() + '_' + file.originalname);
	}
});

var upload = multer({ storage: storage });

var countJson = function(json){
	var count = 0;
	for(var id in json){
			count++;
	}

	return count;
}

/* GET home page. */
router.get('/', function (req, res) {
	Product.find().then(function(product){
		Cate.find().then(function(cate){
			try {
				res.render('site/page/index',{product: product, cate: cate, user: req.session.passport.user});
			} catch(err) {
				res.render('site/page/index',{product: product, cate: cate});
			}
		});
	});
});

router.get('/cate/:name.:id.html', function (req, res) {
	Product.find({cateId: req.params.id}, function(err, data){
		Cate.find().then(function(cate){
			res.render('site/page/cate',{product: data, cate: cate});
		});
	});
});

router.get('/chi-tiet/:name.:id.:cate.html', function (req, res) {
	Product.findById(req.params.id).then(function(data){
		Product.find({cateId: data.cateId, _id: {$ne: data._id}}).limit(4).then(function(pro){
				res.render('site/page/chitiet', {data: data, product: pro});
		});
	});
   
});

router.post('/dat-hang.html', function (req, res) {
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	var data = giohang.convertArray();

	var cart = new Cart({
		  name 		:  req.body.name,
		  email 	: req.body.email,
		  sdt 		: req.body.phone,
		  msg 		: req.body.message,
		  cart 		: data,
		  st 		: 0
	});

	cart.save().then(function(){
		req.session.cart = {items: {}};
		res.redirect('/');
	});
	
});

router.get('/dat-hang.html', function (req, res) {
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	//var data = giohang.convertArray();
	
	if(req.session.cart){
		if(countJson(req.session.cart.items) > 0){
			res.render('site/page/check', {errors: null});
		}else res.redirect('/');
		
	}else{
		res.redirect('/');
	}
});

router.post('/menu', function (req, res) {
 	Cate.find().then(function(data){
 		 res.json(data);
 	});
});

router.get('/add-cart.:id', function (req, res) {
	var id = req.params.id;
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	
	Product.findById(id).then(function(data){
		giohang.add(id, data);
		req.session.cart = giohang;
		res.redirect('/gio-hang.html');
	});
});

router.get('/gio-hang.html', function (req, res) {
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	var data = giohang.convertArray();

   	res.render('site/page/cart', {data: data});
});

router.post('/updateCart', function (req, res) {
	var id 			= req.body.id;;
	var soluong 	= req.body.soluong;
	var giohang 	= new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );

	Product.findById(id).then(function(data) {
		var kho = data.soluong;
		if (soluong <= kho) {
			giohang.updateCart(id, soluong);
			req.session.cart = giohang;
			res.json({st: 1});
		} else {
			res.json({st: 0});
		}
	});
});

router.post('/delCart', function (req, res) {
	var id 			= req.body.id;
	var giohang 	= new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );

	giohang.delCart(id);
	req.session.cart = giohang;
	res.json({st: 1});
	
});


router.post('/binh-luan.html', function (req, res, next) {
	try {
		var value = req.body.value;
		var id = req.body.id;
		var id_user = req.session.passport.user;
		var time = new Date().toLocaleString();
		
		User.findById(id_user).then(function(user) {
			var data = {
				'user': user.fullname,
				'value': value,
				'time': time
			};
			Product.findById(id).then(function(cart) {
				cart.comment.push(data);
				cart.save();
			});
		});

	} catch (err) {
		console.log(err.message);
	}
});

router.get('/binh-luan.html', checkAdmin, function (req, res) {
	res.redirect(req.get('referer'));
});

router.post('/dang-ky-user.html', upload.single('hinh'), function(req, res) {

	console.log("file: ", req.file);
	var errors = req.validationErrors();
	if (errors) {
		var file = './public/upload/' + req.file.filename;
		  var fs = require('fs');
			fs.unlink(file, function(e){
				if(e) throw e;
			});
		res.redirect(req.get('referer'));
	}else{
		var user = new User({
			fullname    : req.body.name,
			img			: req.file.filename,
			email       : req.body.email,
			password    : req.body.password,
			role        : "user"
		});

		user.save().then(function(){
			res.redirect('/'); 
		});
	}
});

router.post('/getUser', function (req, res) {
	res.json(req.user);
});

router.get('/dang-ky-user.html', function(req, res) {
	res.render('site/login/register', {errors: null});
});

router.get('/dang-nhap-user.html', function(req, res, next) {
	res.render('site/login/index', {errors: null});
});

router.post('/dang-nhap-user.html',
	// passport.authenticate('local', { successRedirect: '/',
	passport.authenticate('local', {
								failureRedirect: '/dang-nhap-user.html',
								failureFlash: true }), 
	function(req, res) {
		if (req.user.role === 'user' || req.user.role === 'users'){
			res.redirect('/');
		}
		else {
			res.redirect('/dang-nhap-user.html');
		}
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },  
    function(username, password, done) {
      User.findOne({email: username}, function(err, username){
          if(err) throw err;
          if(username){
            if (username.password === password) {
                      return done(null, username);
            } else {
                     return done(null, false, { message: 'T??i Kho???n Ho???c M???t kh???u Kh??ng ????ng' });
            }
          } else{
             return done(null, false, { message: 'Kh??ng T???n T???i T??i Kho???n' });
          }
      });
  }
));

passport.serializeUser(function(email, done) {
  done(null, email.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, email) {
    done(err, email);
  });
});

router.get('/dang-xuat-user.html', function (req, res) {
    req.logout();
    res.redirect('/');
});

function checkAdmin(req, res, next){
	var url = req.originalUrl;

    if(req.isAuthenticated()){
      next();
    }else{
		res.redirect('/dang-nhap-user.html');
    }
}

module.exports = router;
