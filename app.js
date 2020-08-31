//taskkill /F /IM node.exe
/**
 * Module dependencies.
 */
var createError  = require('http-errors');
var express = require('express');
var path = require('path');
var compression = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var chalk = require('chalk');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var dotenv = require('dotenv');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressStatusMonitor = require('express-status-monitor');
var sass = require('node-sass-middleware');
var multer = require('multer');

var upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var customerController = require('./controllers/customer');
var shadeController = require('./controllers/shade');

/**
 * API keys and Passport configuration.
 */
var passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
*/
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.ONLINE_MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});


/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT  || 12345);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.ONLINE_MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  //res.header("Access-Control-Allow-Origin", "http://localhost:"+config.client);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,HEAD");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
// app.use(lusca.xframe('SAMEORIGIN'));
// app.use(lusca.xssProtection(false));
// app.disable('x-powered-by');
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/api/fusionauth'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */

//app.get('/api/fusionauth', passportConfig.isAuthorized, apiController.getFusionAuth);
// app.get('/auth/fusionauth', passport.authorize('fusionauth'));
// app.get('/auth/fusionauth/callback', passport.authorize('fusionauth', { failureRedirect: '/auth/fusionauth' }), (req, res) => {
//   console.log('Came To Callback')
//   console.log(req.token)
//   res.redirect('/');
// });
// TODO Check For Roles In API before returning data
app.get('/', homeController.index);
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin)
app.get('/customer', customerController.index)
app.get('/customer/:_id', customerController.viewById)
app.get('/api/customer/all', customerController.getAllCustomers)
app.get('/api/customer/id/:_id', customerController.getCustomerById)
app.post('/api/customer', customerController.upsertCustomer)
app.get('/api/customer/search/name/:_Term', customerController.searchCustomers)

app.get('/shade', shadeController.index)
app.get('/api/shade/all', shadeController.getAllShades)
app.get('/api/shade/id/:_id', shadeController.getShadeById)
app.get('/api/shade/customer/:_cId', shadeController.getShadeByCustomerId)
app.post('/api/shade', shadeController.upsertShade)


// app.post('/signup', userController.postSignup)
app.get('/logout', userController.logout);

/**
 * OAuth authorization routes. (API examples)
 */

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
