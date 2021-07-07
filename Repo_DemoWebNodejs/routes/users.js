var express = require('express');
var router = express.Router();
var multer  = require('multer');

var User = require('../model/User.js');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
    // cb(file.originalname);
  }
});
var upload = multer({ storage: storage });

function bodauTiengViet(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/ /g, "-");
    str = str.replace(/\./g, "-");
    return str;
}

/* GET home page. */
router.get('/', checkAdmin, function (req, res) {
	res.redirect('/admin/users/danh-sach.html')
});

router.get('/danh-sach.html', checkAdmin, function (req, res) {
	User.find().then(function(users){
		res.render('admin/users/danhsach', {users: users});
	});
});


router.get('/:id/sua-user.html', function (req, res) {
	User.findById(req.params.id).then(function(data){
			res.render('admin/users/sua',{errors: null, users: data});
	});
	
});

router.post('/:id/sua-user.html',  upload.single('hinh'), function (req, res) {
	req.checkBody('email', 'Tên không được rổng').notEmpty();
	//req.checkBody('hinh', 'Hình không được rổng').notEmpty();
	req.checkBody('password', 'Mật khẩu không được để trống').notEmpty();
	req.checkBody('role', 'Quyền không được trống').notEmpty();

  var errors = req.validationErrors();
	if (errors) {
		
		var file = './public/upload/' + req.file.filename;
		var fs = require('fs');
		fs.unlink(file, function(e){
			if(e) throw e;
		 });
    console.log();

  		User.findById(req.params.id).then(function(data){
				res.render('admin/users/sua',{errors: errors, users: data});
		});
	}else{
		User.findOne({ _id: req.params.id},  function(err, data){
			var file = './public/upload/' + data.img;
			var fs = require('fs');
			fs.unlink(file, function(e){
				if(e) throw e;
			 });
			data.fullname 			= req.body.fullname;
			data.img 			= req.file.filename;
			data.email 			= req.body.email;
			data.password 			= req.body.password;
			data.role 		= req.body.role;

			data.save();
				req.flash('success_msg', 'Đã Sửa Thành Công');
				res.redirect('/admin/users/danh-sach.html');
			//});
		});
	}
});

router.get('/:id/xoa-user.html', checkAdmin,  function (req, res) {

	User.findById(req.params.id, function(err, data){
		data.remove(function(){
			req.flash('success_msg', 'Đã Xoá Thành Công');
			res.redirect('/admin/users/danh-sach.html');
		})
	});
	
});

router.get('/them-user.html', checkAdmin, function (req, res) {
	User.find().then(function(users){
		res.render('admin/users/them',{errors: null, users: users});
	});
});


router.post('/them-user.html', checkAdmin, upload.single('hinh'), function (req, res) {
	req.checkBody('email', 'Tên không được trống').notEmpty();
	//req.checkBody('hinh', 'Hình không được rổng').notEmpty();
	req.checkBody('password', 'Mật khẩu không được để trống').notEmpty();
	req.checkBody('role', 'Quyền không được trống').notEmpty();

	console.log("file: ", req.file);
    var errors = req.validationErrors();
	if (errors) {
		var file = './public/upload/' + req.file.filename;
		  var fs = require('fs');
			fs.unlink(file, function(e){
				if(e) throw e;
			});
  		User.find().then(function(users){
			  res.render('admin/users/them',{errors: errors, users: users});
		  });
	}else{
		var user = new User({
			fullname    : req.body.fullname,
			img         : req.file.filename,
			email       : req.body.email,
			password    : req.body.password,
			role        : req.body.role
		});

		user.save().then(function(){
			req.flash('success_msg', 'Đã Thêm Thành Công');
			res.redirect('/admin/product/them-product.html'); 
		});
	}
});

function checkAdmin(req, res, next){
   
    if(req.isAuthenticated()){
      next();
    }else{
    //   next();
      res.redirect('/admin/dang-nhap.html');
    }
}

module.exports = router;