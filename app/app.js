var domain = require('domain');
var d = domain.create();

var exp = require('express');
var app = exp();
var bodyParser = require('body-parser')

var tls = require('./tools');
var svc = require('./service');
var ctl = require('./controller');
var cors = require('cors')

d.on('error', function(err) {
  tls.logger.error("index : "+err);
});

d.run(function() {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use('/',ctl);
    tls.createFolder("./uploadTemp");   
    svc.getConfig().then(function(res,err){
       tls.createFolder(res.AttachmentFolder);
    });
    svc.connectDB(); 
    var port=3000;
    app.listen(port);
    tls.logger.info("i'm listening to port:"+port);
});

