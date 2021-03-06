var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSession = require('express-session');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/config');
var port = process.env.PORT || config.port;
var user = require('./app/routers/user');
var chat = require('./app/routers/chat');
var chatRoomRouter = require('./app/routers/chatRoomRouter');
var limaIndexRouter = require('./app/routers/limaIndexRouter');
var app = express();
var server = http.createServer(app);
var socketioServer = socketio.listen(server);
var expressValidatorOptions = require('./app/validators/custom');
var winston = require('winston');
var expressWinston = require('express-winston');


mongoose.connect(config.dburl);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(expressSession({secret: 'markfordream', saveUninitialized: true, resave: true, cookie: {maxAge: 3600000}}));
app.use(expressValidator(expressValidatorOptions));
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

// logger for http request and response (should be declared before routers middleware)
app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ],
      // meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      // msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
      colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
      ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
 }));

// app.use('/api', user(express, require('./config/passport')(passport)));
// app.use('/api', chat(express));
// app.use(chatRoomRouter(express));
app.use(limaIndexRouter(express));
// logger for error (should be declared afoter souters middleware)
app.use(expressWinston.errorLogger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ]
 }));

require('./config/socket')(socketioServer);

server.listen(port, function() {
	console.log('Running on port ' + port);
});
