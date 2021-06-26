var express = require('express');
var router = express.Router();

var Cate = require('../model/Cate.js');

var User = require('../model/User.js');

var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy1 = require('passport-local').Strategy;

/* GET home page. */
router.get('/', checkAdmin, function(req, res, next) {
    res.render('admin/main/index');
});

router.get('/dang-nhap.html', function(req, res, next) {
  res.render('admin/login/index');
});

router.post('/getUser',checkAdmin, function (req, res) {
  res.json(req.user);
});

router.post('/dang-nhap.html',
  passport.authenticate('local', { successRedirect: '/admin',
  // passport.authenticate('local', { 
                                   failureRedirect: '/admin/dang-nhap.html',
                                   failureFlash: true }), 
                  function(req, res) {
                    if (req.user.role === 'admin')
                      res.redirect('/admin');
                    else   
                      res.redirect('/admin/dang-nhap.html');
                    }
);

passport.use(new LocalStrategy1({
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
                     return done(null, false, { message: 'Tài Khoản Không Đúng' });
            }
          } else{
             return done(null, false, { message: 'Không Tồn Tại Tài Khoản' });
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

router.get('/dang-xuat.html', function (req, res) {
    req.logout();
    res.redirect('/admin/dang-nhap.html');
});


function checkAdmin(req, res, next){
    if(req.isAuthenticated()){
      next();
    }else{
        res.redirect('/admin/dang-nhap.html');
    }
}

module.exports = router;