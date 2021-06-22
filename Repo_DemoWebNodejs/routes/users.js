var express = require('express');
var router = express.Router();

var Cate = require('../model/Cate.js');
var User = require('../model/User.js');

var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET home page. */

router.get('/dang-nhap-user.html', function(req, res, next) {
  res.redirect('site/login/login');
  // res.redirect('site/login/index');
});

router.post('/dang-nhap-user.html',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/dang-nhap-user.html',
                                   failureFlash: true })
);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },  
    function(username, password, done) {
      User.findOne({email: username}, function(err, username){
          if(err) throw err;
          if(username){
            if (username.password === password && username.role === 'user') {
                      return done(null, username);
            } else {
                     return done(null, false, { message: 'Tài Khoảng Không Đúng' });
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

router.get('/dang-xuat-user.html', function (req, res) {
    req.logout();
    res.redirect('/');
});


function checkAdmin(req, res, next){
    if(req.isAuthenticated()){
      next();
    }else{
        res.redirect('/dang-nhap-user.html');
    }
}

module.exports = router;