const passport = require('passport');
const refresh = require('passport-oauth2-refresh');
const { Strategy: LocalStrategy } = require('passport-local');
const jwt = require('jsonwebtoken')
const _ = require('lodash');
const moment = require('moment');
const config = require('../config')
const User = require('../controllers/user').User;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    if (!user.password) {
      return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));
// passport.use('fusionauth', new OAuth2Strategy({
//   authorizationURL: config.FUSION_AUTH_AUTHORIZE_URL,
//   tokenURL: config.FUSION_AUTH_TOKEN_URL,
//   clientID: config.FUSION_AUTH_CLIENT_ID,
//   clientSecret: config.FUSION_AUTH_CLIENT_SECRET,
//   callbackURL: config.CALLBACK_URL,
//   passReqToCallback: true
// },
// (req, accessToken, refreshToken, profile, done) => {
//   //try{
//   console.log('Secret: '+config.FUSION_AUTH_CLIENT_SECRET)
//   var decoded = jwt.decode(accessToken, config.FUSION_AUTH_CLIENT_SECRET);
//   // } catch(err) {
//   //   console.log('Decoded Error: ')
//   //   console.log(err);
//   // }

//     console.log('Decoded')
//     console.log(decoded)
//     try {
//       console.log(accessToken);
      
//       var decoded_v = jwt.verify(accessToken, config.FUSION_AUTH_CLIENT_SECRET);
//     } catch(err) {
//       // err
//       console.log('Error in decoded_v');
//       console.log(err);
      
      
//     }
//     console.log(decoded.email);
    
//     User.findOne({email: decoded.email}, (err, user) => {
//       if (err) { return done(err); }
//       user.token  = accessToken;
//       req.logIn({user: user}, function (data) {
//         console.log('Login Callback')
//         console.log(data)
//         console.log('Tokennn');
//         console.log(accessToken)
//         console.log(req.token)
//         console.log(refreshToken)
//         console.log(profile)
//         user.save((err) => {
//           done(err, user);
//         });
//       })
      
//     });
// }));

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.json({
      status: false,
      message: 'Not Authorised To Access This',
      details: []
    });
  }
  
};

/**
 * Authorization Required middleware.
 */
// exports.isAuthorized = (req, res, next) => {
//   const provider = 'fusionauth'
  
//   if (req.user) {
//     const token = req.user.tokens.find((token) => token.kind === provider);
//     if (token) {
//       // Is there an access token expiration and access token expired?
//       // Yes: Is there a refresh token?
//       //     Yes: Does it have expiration and if so is it expired?
//       //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
//       //       No, Quickbooks and Google- refresh token and save, and then go to next();
//       //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
//       // No: we are good, go to next():
//       if (token.accessTokenExpires && moment(token.accessTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
//         if (token.refreshToken) {
//           if (token.refreshTokenExpires && moment(token.refreshTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
//             res.redirect(`/auth/${provider}`);
//           } else {
//             refresh.requestNewAccessToken(`${provider}`, token.refreshToken, (err, accessToken, refreshToken, params) => {
//               User.findById(req.user.id, (err, user) => {
//                 user.tokens.some((tokenObject) => {
//                   if (tokenObject.kind === provider) {
//                     tokenObject.accessToken = accessToken;
//                     if (params.expires_in) tokenObject.accessTokenExpires = moment().add(params.expires_in, 'seconds').format();
//                     return true;
//                   }
//                   return false;
//                 });
//                 req.user = user;
//                 user.markModified('tokens');
//                 user.save((err) => {
//                   if (err) console.log(err);
//                   next();
//                 });
//               });
//             });
//           }
//         } else {
//           res.redirect(`/auth/${provider}`);
//         }
//       } else {
//         next();
//       }
//     } else {
//       res.redirect(`/auth/${provider}`);
//     }
//   }
//   else {
//     res.redirect(`/auth/${provider}`);
//   }
// };
