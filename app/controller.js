var exp = require('express');
var app = exp();
var rep = require('./service');


app.get("/api/check/",function(req,response){
	response.send("connected to API successfully");
});

//------------------------------------------------------------

app.post("/api/login/",function(req,res){   
    rep.login(req,res);
});

app.post("/api/logout/",function(req,res){
    rep.logout(req,res);
});

app.post("/api/changepassword/",function(req,res){
    rep.changePassword(req,res);
});

//------------------------------------------------------------

app.post("/api/location/:courierid/:apikey",function(req,res){    
    rep.location(req,res);
});

//------------------------------------------------------------

app.get("/api/courierlist/:apikey/:regionid",function(req,res){    
    rep.courierList(req,res);
});
app.get("/api/regionlist/:apikey",function(req,res){    
    rep.regionList(req,res);
});
app.get("/api/couriermappoint/:courierid",function(req,res){    
    rep.courierMapPointList(req,res);
});

app.post("/api/courierschedule/",function(req,res){    
    rep.courierSchedule(req,res);
});

app.post("/api/insertpointaddress/",function(req,res){    
    rep.insertPointAddress(req,res);
});

//------------------------------------------------------------

app.post("/api/scheduleList",function(req,res){
    rep.scheduleList(req,res);
});

app.post("/api/scheduledetail",function(req,res){
    rep.scheduleDetail(req,res,"");
});

app.post("/api/UpdateSchedule",function(req,res){
    rep.updateSchedule(req,res);
});

app.post("/api/StartSchedule",function(req,res){
    rep.startSchedule(req,res);
});

app.post("/api/UpdateScheduleDestination",function(req,res){
    rep.updateScheduleDestination(req,res);
});

app.post("/api/UploadAttachment/:apikey/:scheduleid/:polisno/:docSeq",function(req,res){   
    rep.uploadFile(req,res);
});

//------------------------------------------------------------

app.post("/api/addresslist/",function(req,res){    
    rep.addressList(req,res);
});

app.post("/api/addressdetail/",function(req,res){    
    rep.addressDetail(req,res);
});

app.post("/api/updateaddress/",function(req,res){    
    rep.updateAddress(req,res);
});

//------------------------------------------------------------


module.exports = app;
