var express = require('express');
var router = express.Router();

var Cart = require('../model/Cart.js');
var Product = require('../model/Product.js');

router.get('/', checkAdmin, function(req, res, next) {
  res.redirect('/admin/cart/danh-sach.html');
});

router.get('/danh-sach.html', checkAdmin, function(req, res, next) {
	Cart.find().then(function(data){
		 res.render('admin/cart/danhsach', {data: data});
	});
  
});


router.get('/:id/xem-cart.html', checkAdmin, function(req, res, next) {
 	var id = req.params.id;
 	Cart.findById(id).then(function(data){
		 res.render('admin/cart/view', {cart: data});
	});
});

router.get('/:id/thanh-toan-cart.html',checkAdmin, function(req, res, next) {
 	var id = req.params.id;

	//  data.forEach(a => {
		//  Product.findByIdAndUpdate(a.item._id).then(function(pro) {
		// 	 pro.soluong = pro.soluong - a.soluong;
		// 	 pro.save();
		//  });
	//  });
	 
 	Cart.findById(id, function(err, data){
		data.cart.forEach(a => {
			Product.findByIdAndUpdate(a.item._id).then(function(pro) {
				pro.soluong = pro.soluong - a.soluong;
				pro.save();
			});
		});
 		data.st = 1;
 		data.save();
 		req.flash('success_msg', 'Đã Thêm Thành Công');
		res.redirect('/admin/cart/'+id+'/xem-cart.html'); 
 	});
});

router.get('/:id/xoa-cart.html', checkAdmin, function(req, res, next) {
 	var id = req.params.id;
 	Cart.findOneAndRemove({_id: id}, function(err, offer){
 		req.flash('success_msg', 'Đã Xoá Thành Công');
		res.redirect('/admin/cart/danh-sach.html'); 
 	});
});

function checkAdmin(req, res, next){
   
    if(req.isAuthenticated()){
      next();
    }else{
		  res.redirect('/admin/dang-nhap.html');
    }
}



module.exports = router;