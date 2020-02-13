// Load required packages
var express = require('express');
var helmet = require('helmet')
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var LOG = require('./logger/logger').logger

var APP_CONFIG = require('./config/config').config
var APIStatus = require('./errors/apistatus')
var Response = require('./models/response')
var daemon = require('./controllers/daemon/daemon');
var StatusCode = require('./errors/statuscodes').StatusCode


process.on('SIGINT', function () {
  LOG.debug("stopping the application")
  process.exit(0);
});


startApp()

daemon.start();
function startApp() {
  var app = express();
  app.set('trust proxy', 1);

  app.use(helmet())
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(methodOverride());
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // req.pipe(req.busboy);
    if ('OPTIONS' === req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    };
  });


  var router = express.Router();
  require('./routes/school/school.route')(router);
  require('./routes/cluster/cluster.route')(router);
  require('./routes/block/block.route')(router);
  require('./routes/district/district.route')(router);
  require('./routes/states/state.route')(router);
  require('./routes/teacher/teacher.route')(router);
  require('./routes/exam/exam.route')(router);
  require('./routes/ocr/ocr.route')(router);
  require('./routes/student/student.route')(router);


  app.use('/text-ocr/v1', router);


  app.use(function (err, req, res, next) {
    if (err && !err.ok) {
      console.log(err)
      return res.status(err.http.status).json(err);
    } else {
      let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, "app").getRspStatus()
      apistatus.message = "We are expriencing issues at our end, kindly try again in sometimes."
      return res.status(apistatus.http.status).json(apistatus);
    }
  });

  var server = app.listen(APP_CONFIG.PORT, function () {
    LOG.debug('Listening on port %d', server.address().port);
  });
  server.timeout = 10000000;
}
