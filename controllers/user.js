
const validator = require('validator');
const mailChecker = require('mailchecker');
const config = require('../config')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  role: [String]
},{collection:config.tables.User, timestamps: true})

var User = module.exports.User = mongoose.model('User',UserSchema,config.tables.USER);

/**
 * GET /login
 * Login page.
 */
module.exports.getLogin = (req, res) => {
  console.log(req.user)
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
module.exports.postLogin = (req, res, next) => {
  
  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
  if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/login');
  }
  
  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

  User.findOne({email: req.body.email, password: req.body.password},{}, (err, user_data) => {
    console.log(user_data);
    if(err || !user_data) {
      console.log('Couldnt Find User')
      console.log(user_data);
      console.log(err);
      req.flash('errors', [{msg:'User Not Found'}]);
      res.redirect('/login');
    } else {
      req.logIn(user_data, (err) => {
        if (err) { return next(err); }
        res.redirect(req.session.returnTo || '/');
      });
    }
  })
};

/**
 * GET /logout
 * Log out.
 */
module.exports.logout = (req, res) => {
  req.logout();
  res.redirect('/login')
};