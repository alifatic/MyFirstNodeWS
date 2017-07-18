
var sql = require('mssql');
var util = require('util');
var path = require('path')
var fs = require('fs');
var Promise = require('promise');
var config = "";

var tls = require('./tools');
var cp; //connectionPool


function getConfig(){   
    return new Promise(function (resolve, reject) {
        fs.readFile('./config/config.json', 'utf8', function (err, data) {     
            if (err) reject(err);
            else resolve(JSON.parse(data));
        });
    });  
}

function connectDB(){    
    getConfig().then(function(res,err){
        cp = new sql.ConnectionPool(res);
        tls.logger.info('Connecting to DB : ' + res.database );
        cp.connect().then(()=> {
            tls.logger.info('Connected to DB : ' + res.database );
        }).catch(function(err) {
            tls.logger.error('Connect to db :'+ err);
        });
    });
}

function getCP(){
    return cp
}

function login(req,res){
    var action = req.originalUrl.split("/")[2];
	var username=req.body.username;
	var password=req.body.password;
    tls.logger.info(util.format("trying to %s user :%s",action,username));     
    new sql.Request(cp)
        .input('username', sql.NVarChar(30), tls.isEmpty(username)?'':username)
        .input('password', sql.NVarChar(999),tls.isEmpty(password)?'':password)
        .execute('[sp_API_CRR_Login]')
        .then((recordsets) => { 
            res.json(recordsets[0]);                
            tls.logger.info(util.format("%s apikey:%s",recordsets[0][0].msg,recordsets[0][0].apikey));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });
}
function logout(req,res){
    var action = req.originalUrl.split("/")[2];
	var apikey=req.body.apikey;
    tls.logger.info(util.format("trying to %s api :%s",action,apikey));   
    new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),tls.isEmpty(apikey)?'':apikey)
        .execute('[sp_API_CRR_Logout]')
        .then(function(recordsets) {                      
            res.json(recordsets[0]);
            tls.logger.info(util.format("%s result:%s",recordsets[0][0].msg,recordsets[0][0].result));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });     
}
function changePassword(req,res){
    var action = req.originalUrl.split("/")[2];
	var username=req.body.username;    
	var password=req.body.password;
	var newpassword=req.body.newpassword;
    var apikey=req.body.apikey;      
    tls.logger.info(util.format("trying to %s user :%s",action,username));   
    new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('username', sql.NVarChar(100),username)
        .input('password', sql.NVarChar(100),password)
        .input('newpassword', sql.NVarChar(999),newpassword)
        .execute('[sp_API_CRR_ChangePassword]')
        .then(function(recordsets) {                      
            res.json(recordsets[0]);//msg & result
            tls.logger.info(util.format("%s:%s",recordsets[0][0].msg,recordsets[0][0].result));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });        
}

function scheduleList(req,res){
    var action = req.originalUrl.split("/")[2];
	var apikey=req.body.apikey;
	var courierid=req.body.courierid;
	var scheduledate=req.body.scheduledate;
    tls.logger.info(util.format("trying to access %s apikey :%s",action,apikey));    
    new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('courierid', sql.NVarChar(999),courierid)
        .input('scheduledate', sql.NVarChar(999),scheduledate)
        .execute('[sp_API_CRR_ScheduleList]')
        .then(function(recordsets) {                      
            res.json(recordsets[0]);//msg & result
            var msg;
            if(recordsets[0].length>0){
                if(recordsets[0][0].result == 0)
                    msg = util.format("%s:%s",recordsets[0][0].msg,recordsets[0][0].result);
                else
                    msg = util.format("Success Load %s",action);
            } else{
                msg = "There is no schedule!";
            }
            tls.logger.info(msg);
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });     
}

function scheduleDetail(req,res,action,callback){
    if (action == "")     
        action = req.originalUrl.split("/")[2];

    var apikey=req.body.apikey;
    if(apikey == undefined) apikey=req.params.apikey;
	var scheduleid=req.body.scheduleid;
    if(scheduleid == undefined) scheduleid = req.params.scheduleid;
    tls.logger.info(util.format("trying to Load %s param scheduleId:%s ",action,scheduleid));    
    new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('scheduleid', sql.NVarChar(999),scheduleid)
        .execute('[sp_API_CRR_ScheduleDetail]')
        .then(function(recordsets) {  
            if(action == "scheduledetail") res.send(recordsets);//msg & result
            if(recordsets[0].length>0){
                if(recordsets[0][0].result == 0){
                    msg = util.format("%s:%s",recordsets[0][0].msg,recordsets[0][0].result);
                    tls.logger.info(msg);
                }
                else{
                    msg = util.format("Success Load %s",action);
                    tls.logger.info(msg);                    
                    if(typeof callback === 'function' ){
                        callback(recordsets[0][0].foldername);
                    };
                }
            }
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });
}

function updateSchedule(req,res){
    var action = req.originalUrl.split("/")[2];
	var apikey=req.body.apikey;
	var scheduleid=req.body.scheduleid;
	var applicationid=req.body.applicationid;
	var reason=req.body.reason;
	var notes=req.body.notes;
	var edcpayment=req.body.edcpayment;    
	var policyreceived=req.body.policyreceived;
	var partialupload=req.body.partialupload;
	var endtime=req.body.endtime;
	var endlocation=req.body.endlocation;
    tls.logger.info(util.format("trying to access %s param scheduleId:%s | appid:%s",action,scheduleid,applicationid));    
    var sqlreq = new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('scheduleid', sql.NVarChar(999),scheduleid)
        .input('applicationid', sql.NVarChar(999),applicationid)
        .input('reason', sql.NVarChar(999),reason)
        .input('notes', sql.NVarChar(999),notes)
        .input('edcpayment', sql.NVarChar(999),edcpayment)
        .input('policyreceived', sql.NVarChar(999),policyreceived)
        .input('partialupload', sql.NVarChar(999),partialupload)
        .input('endtime', sql.NVarChar(999),endtime)
        .input('endlocation', sql.NVarChar(999),endlocation)
        .execute('[sp_API_CRR_UpdateSchedule]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.logger.info(util.format("%s Affected Rows : %s",action,recordsets[0][0].result));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });
}

function startSchedule(req,res){
    var action = req.originalUrl.split("/")[2];
	var apikey=req.body.apikey;
	var scheduleid=req.body.scheduleid;
	var applicationid=req.body.applicationid;
	var starttime=req.body.starttime;
	var startlocation=req.body.startlocation;
    tls.logger.info(util.format("trying to access %s param scheduleId:%s | appid:%s",action,scheduleid,applicationid));    
    var sqlreq = new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('scheduleid', sql.NVarChar(999),scheduleid)
        .input('applicationid', sql.NVarChar(999),applicationid)
        .input('starttime', sql.NVarChar(999),starttime)
        .input('startlocation', sql.NVarChar(999),startlocation)
        .execute('[sp_API_CRR_StartSchedule]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.logger.info(util.format("%s Affected Rows : %s",action,recordsets[0][0].result));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });
}

function updateScheduleDestination(req,res){
    var action = req.originalUrl.split("/")[2];
	var apikey=req.body.apikey;
	var scheduleid=req.body.scheduleid;
	var applicationid=req.body.applicationid;
	var destination=req.body.destination;
    tls.logger.info(util.format("trying to access %s param scheduleId:%s | appid:%s",action,scheduleid,applicationid));    
    var sqlreq = new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('scheduleid', sql.NVarChar(999),scheduleid)
        .input('applicationid', sql.NVarChar(999),applicationid)
        .input('destination', sql.NVarChar(999),destination)
        .execute('[sp_API_CRR_UpdateScheduleDestination]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.logger.info(util.format("%s Affected Rows : %s",action,recordsets[0][0].result));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });
}

function insertAttachment(req,res,filename,i){    
    var action = req.originalUrl.split("/")[2];
	var apikey = req.params.apikey; 
    var scheduleid = req.params.scheduleid;
    var polisno = req.params.polisno;
    var attachmenttype = req.params.docSeq;   
    var fileCount = req.files.length-1; 
    tls.logger.info(util.format("insert attachment to db params scheduleId:%s | polisno:%s",scheduleid,polisno)); 
    new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('scheduleid', sql.NVarChar(999),scheduleid)
        .input('PolisNo', sql.NVarChar(999),polisno)
        .input('attachmenttype', sql.NVarChar(999),attachmenttype)
        .input('attachmentname', sql.NVarChar(999),filename)
        .execute('[sp_API_CRR_InsertAttachment]')
        .then(function(recordsets) {                 
            if(fileCount==i) 
                res.json([{"msg":"success insert attachment to db", "result":fileCount+1}]);
            tls.logger.info(util.format("%s:%s",recordsets[0][0].msg,recordsets[0][0].result));
        }).catch(function(err) {
            tls.logger.error(util.format("Executing %s query: %s",action,err));
        });
}


function location(req,res){
    var locs = req.body;
    var courierid = req.params.courierid;
    var length = locs.length-1;
    tls.loggerLoc.info(util.format("location json :%s",JSON.stringify(req.body)));
    tls.loggerLoc.info(util.format("Preparing Insert location for courierid :%s recCount :%s",courierid,length));
    var i = 0;
    (function loop() { //Sync loop
        if (i <= length) {
            insertLocation(req,res,i);  
            i++;
            loop();
        }
    }());  
}

function insertLocation(req,res,i){
    var action = req.originalUrl.split("/")[2];
    var locs = req.body;
    var courierid = req.params.courierid;
    var apikey = req.params.apikey;
    var length = locs.length-1;
    tls.loggerLoc.info(util.format("Inserting CourierID:%s|time:%s|latitude:%s|longitude:%s"
    ,courierid,locs[i].time,locs[i].latitude,locs[i].longitude));
    new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('courierid', sql.NVarChar(999),courierid)
        .input('longitude', sql.NVarChar(999),locs[i].longitude)
        .input('latitude', sql.NVarChar(999),locs[i].latitude)
        .input('pointtime', sql.NVarChar(999),tls.getDateTime(locs[i].time))
        .execute('[sp_API_CRR_InsertLocation]')
        .then(function(recordsets) {                        
            if(length==i)
                res.json([{"msg":"success insert location to db", "result":length+1}]);
            tls.loggerLoc.info(util.format("%s:%s",recordsets[0][0].msg,recordsets[0][0].result));
        }).catch(function(err) {
            tls.loggerLoc.error(util.format("Executing %s query: %s",action,err));
        });         
}

function uploadFile(req,res){
    tls.upload(req,res,function(err) {
        if(err) {
            tls.logger.error("Upload :"+err);
            return;
        }        
        var fileCount = req.files.length-1; 
        var i = 0;
        (function loop() { //Sync loop
            if (i <= fileCount) {
                moveUploadedFile(req,res,i);  
                i++;
                loop();
            }
        }());               
    });    
}

function moveUploadedFile(req,res,i){  
    var reqfile = req.files[i]; 
    var tmp_path = tls.appDir+'\\'+reqfile.path;
    var filename = Date.now()+path.extname(reqfile.originalname);
    scheduleDetail(req,res,"Attachment Folder",function(scheduleFolder){
        tls.createFolder(config.AttachmentFolder+"\\"+scheduleFolder);
        var target_path = util.format("%s\\%s\\%s",config.AttachmentFolder, scheduleFolder, filename);
        //tls.logger.info("from : "+tmp_path);
        tls.logger.info("to : "+scheduleFolder);                    
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path); 
        src.on('open', function() {                 
            src.pipe(dest);
        });
        src.on('error', function(err) { 
            tls.logger.error("move data to AttachmentFolder") 
        });
        src.on('end', function() { 
            tls.logger.info("Success Upload file to "+target_path); 
            tls.deleteFile(tmp_path);           
            insertAttachment(req,res,filename,i);
        });     
    });             
}

function regionList(req,res){
    var action = req.originalUrl.split("/")[2];       
	var apikey = req.params.apikey; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .execute('[sp_API_MON_GetRegion]')
        .then(function(recordsets) {              
            res.send(recordsets[0]);//msg & result
            tls.loggerMon.info(util.format("%s Affected Rows : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}

function courierList(req,res){
    var action = req.originalUrl.split("/")[2];     
	var apikey = req.params.apikey;      
	var regionid = req.params.regionid; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('apikey', sql.NVarChar(999),apikey)
        .input('regionid', sql.NVarChar(999),regionid)
        .execute('[sp_API_MON_GetCourier]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.loggerMon.info(util.format("%s total Rows : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}

function courierMapPointList(req,res){
    var action = req.originalUrl.split("/")[2];    
	var courierid = req.params.courierid; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('courierid', sql.NVarChar(999),courierid)
        .execute('[sp_API_MON_GetCourierPoint]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.loggerMon.info(util.format("%s total Rows : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}

function courierSchedule(req,res){
    var action = req.originalUrl.split("/")[2];    
	var courierid = req.body.courierid; 
	var regionid = req.body.regionid; 
	var appointmentdate = req.body.appointmentdate; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('courierid', sql.NVarChar(999),courierid)
        .input('regionid', sql.NVarChar(999),regionid)
        .input('appointmentdate', sql.NVarChar(999),appointmentdate)
        .execute('[sp_API_MON_GetCourierSchedule]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.loggerMon.info(util.format("%s total Rows : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}

function insertPointAddress(req,res){
    var action = req.originalUrl.split("/")[2];    
	var polisno = req.body.polisno;   
	var address = req.body.address;   
	var point = req.body.point; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('polisno', sql.NVarChar(999),polisno)
        .input('address', sql.NVarChar(999),address)
        .input('point', sql.NVarChar(999),point)
        .execute('sp_API_MON_InsertPointAddress')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.loggerMon.info(util.format("%s recId : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}
function addressList(req,res){
    var action = req.originalUrl.split("/")[2];   
	var appointmentdate = req.body.appointmentdate; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('appointmentdate', sql.NVarChar(999),appointmentdate)
        .execute('[sp_API_MON_GetAddress]')
        .then(function(recordsets) {                                 
            res.send(recordsets);//msg & result
            tls.loggerMon.info(util.format("%s total Rows : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}
function addressDetail(req,res){
    var action = req.originalUrl.split("/")[2];   
	var applicationid = req.body.applicationid; 
    tls.loggerMon.info(util.format("trying to Load %s ",action));    
    var sqlreq = new sql.Request(cp)
        .input('applicationid', sql.NVarChar(999),applicationid)
        .execute('[sp_API_MON_GetAddressDetail]')
        .then(function(recordsets) {                                 
            res.send(recordsets);//msg & result
            tls.loggerMon.info(util.format("%s total Rows : %s",action,recordsets[0].length));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}

function updateAddress(req,res){
    var action = req.originalUrl.split("/")[2];
    //tls.logger.info(JSON.stringify(req.body));
	var applicationid=req.body.applicationid;
	var status=req.body.status;
	var location=req.body.location;
	var address1=req.body.address1;
	var address2=req.body.address2;
	var address3=req.body.address3;
	var address4=req.body.address4;
	var address5=req.body.address5;
	var kelurahan=req.body.kelurahan;
	var kecamatan=req.body.kecamatan;
	var kodepos=req.body.kodepos;
    tls.loggerMon.info(util.format("trying to access %s param appid:%s",action,applicationid));    
    var sqlreq = new sql.Request(cp)
        .input('applicationid', sql.NVarChar(999),applicationid)
        .input('status', sql.NVarChar(999),status)
        .input('location', sql.NVarChar(999),location)
        .input('address1', sql.NVarChar(999),address1)
        .input('address2', sql.NVarChar(999),address2)
        .input('address3', sql.NVarChar(999),address3)
        .input('address4', sql.NVarChar(999),address4)
        .input('address5', sql.NVarChar(999),address5)
        .input('kelurahan', sql.NVarChar(999),kelurahan)
        .input('kecamatan', sql.NVarChar(999),kecamatan)
        .input('kodepos', sql.NVarChar(999),kodepos)
        .execute('[sp_API_MON_UpdateAddress]')
        .then(function(recordsets) {                                 
            res.send(recordsets[0]);//msg & result
            tls.loggerMon.info(util.format("%s Affected Rows : %s",action,recordsets[0][0].result));
        }).catch(function(err) {
            tls.loggerMon.error(util.format("Executing %s query: %s",action,err));
        });
}


module.exports = {
    login,
    logout,
    changePassword,
    scheduleList,
    scheduleDetail,
    updateSchedule,
    startSchedule,
    insertAttachment,
    location,
    uploadFile,
    connectDB,
    getCP,
    courierList,
    regionList,
    courierMapPointList,
    updateScheduleDestination,
    courierSchedule,
    insertPointAddress,
    addressList,
    addressDetail,
    updateAddress,
    getConfig
};
