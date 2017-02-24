
const fs = require('fs');
var util = require('util');
var multer  = require('multer');
var colors  = require('colors');
var logDir = "./logs/";
var appDir = __dirname; 

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploadTemp');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now()+ '-' +file.originalname);
  }
});

var upload = multer({ storage : storage}).array('attachment');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function createFolder(folderName)
{
    console.log("Checking Folder : "+folderName);
    if (!fs.existsSync(folderName)) {        
        console.log("Creating Folder : "+folderName); 
        fs.mkdirSync(folderName);               
    }
}

function deleteFile(path)
{
    console.log("unlink : "+path);
    fs.unlink(path);
}
var winston = require('winston');
const tsFormat = () => getDateTimeNow();

var loggerLoc = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: logDir+getDate()+"_"+getHour()+'_Loclog-info.log',
      level: 'info',
      timestamp: tsFormat,
      formatter: function(options) {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ message(options.message,options.meta.message); 
      },
      json: false 
    }),
    new (winston.transports.Console)({
      name: 'info-console',
      level: 'info',
      timestamp: tsFormat,
      formatter: function(options) {
        return colors.bold(options.timestamp()) +' '+ options.level.toUpperCase() +' '
        + colors.bold((colors.green(message(options.message,options.meta.message))));     
      } ,
      colorize: true,
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: logDir+getDate()+"_"+getHour()+'_Loclog-error.log',
      level: 'error',
      timestamp: tsFormat,
      formatter: function(options) {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ message(options.message,options.meta.message) +
        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '\n\t');
      },
      json: false 
    })
  ]
});

var loggerMon = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: logDir+getDate()+"_"+getHour()+'_Monlog-info.log',
      level: 'info',
      timestamp: tsFormat,
      formatter: function(options) {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ message(options.message,options.meta.message); 
      },
      json: false 
    }),
    new (winston.transports.Console)({
      name: 'info-console',
      level: 'info',
      timestamp: tsFormat,
      formatter: function(options) {
        return colors.bold(options.timestamp()) +' '+ options.level.toUpperCase() +' '
        + colors.bold((colors.magenta(message(options.message,options.meta.message))));     
      } ,
      colorize: true,
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: logDir+getDate()+"_"+getHour()+'_Monlog-error.log',
      level: 'error',
      timestamp: tsFormat,
      formatter: function(options) {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ message(options.message,options.meta.message) +
        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '\n\t');
      },
      json: false 
    })
  ]
});

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: logDir+getDate()+"_"+getHour()+'_filelog-info.log',
      level: 'info',
      timestamp: tsFormat,
      formatter: function(options) {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ message(options.message,options.meta.message); 
      },
      json: false 
    }),
    new (winston.transports.Console)({
      name: 'info-console',
      colorize: true,
      level: 'info',
      timestamp: tsFormat,
      formatter: function(options) {
        return colors.bold(options.timestamp()) +' '+ options.level.toUpperCase() +' '
        + colors.bold((colors.cyan(message(options.message,options.meta.message))));    
      } 
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: logDir+getDate()+"_"+getHour()+'_filelog-error.log',
      level: 'error',
      timestamp: tsFormat,
      formatter: function(options) {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ message(options.message,options.meta.message) +
        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '\n\t');
      },
      json: false 
    })
  ]
});

function message(msg,metamsg) {
    var result;
    if(isEmpty(msg)) {
        result = metamsg;
    }else{
        result = msg;
    }
    
    return result;    
}

function isEmpty(obj) {
        if(isSet(obj)) {
            if (obj.length && obj.length > 0) { 
                return false;
            }

            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }
        }
        return true;    
}
function isSet(val) {
    if ((val != undefined) && (val != null)){
        return true;
    }
    return false;
}
function getDate() {

    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "_" + month + "_" + day;

}

function getDateTimeNow() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

}
function getDateTime(milisecond) {
    
    var date = new Date(milisecond);

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

function getHour() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    return hour;

}

module.exports = {
    logger,
    loggerLoc,
    loggerMon,
    isEmpty,
    isSet,
    getDate,
    getHour,
    getDateTimeNow,
    getDateTime,
    createFolder,
    deleteFile,
    upload,
    appDir
};