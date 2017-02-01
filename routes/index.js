var express = require('express');
var router = express.Router();
var database1 = require('../middleware/database');

//console.log(monModel);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Менеджер задач' });
});

router.post('/new',function (req, res) {
    console.log('Body from new - '+req.body);

    date1=new Date(req.body.indate);

    database1.newTask(0,req.body.intext,date1,function (error, data) {
        if(error) {
            res.send("internal error occur");
            console.log(error);
        }
        else res.send("record saved");
    })
});

router.post('/delete', function (req, res) {
    console.log(req.body);
    database1.deleteTask(req.body.id, function (err, success) {
        if(err) res.send(err);
        else res.send(JSON.stringify({id:success}));
    });
});

router.post('/donetask', function (req, res) {
    console.log(req.body);

    var dayToday = new Date();
    var dayT = dayToday.getFullYear()+'-'+(dayToday.getMonth()+1)+'-'+dayToday.getDate();

    database1.updateTask(req.body.id,{doneCheck:req.body.check, date: dayT},function (err, success) {
        if(err) res.send(err);
        else res.send(JSON.stringify({id:success}));
    });
});

router.get('/daytasks',function (req, res) {
    var idDate=Date.now();

    var dayToday = new Date();
    var dayT = dayToday.getFullYear()+'-'+(dayToday.getMonth()+1)+'-'+dayToday.getDate();

    database1.listFromDate(dayT,function (err, listE, listT, listTm, listL, listDone) {
        res.render("newview1", {title:'Завдання', jobListEarlier:listE, jobListToday: listT, jobListTomorrow: listTm, jobListLater: listL, jobListDone: listDone});
    });

});
router.get('/getday', function (req,res) {

   // if(!req.body.day) return new Error("Day param missing");
    var day= new Date(2017,01,01);
    console.log('hhhhhhh- '+day);
    if(req.body.day === undefined)
    {
        res.send([]);
    }

    if(day === undefined)
        console.log("DAY - ",day);

   //console.log();
});

router.get('/taskfind',function (req,res) {

    console.log('query '+req.query);
    var taskId = req.query.taskid;

    if(taskId !== undefined)
    {
        database1.findById(taskId,function (err, record) {
           if(err) res.send("Error "+err);
           else
           {
               res.send(JSON.stringify(record));
              // console.log(record);
           }
        });
    }
    else
    {
        res.send("Id - "+taskId+" taskId - "+req.body.taskid);
    }
});

router.post('/save',function (req,res) {
    //console.log(req.body);
    var updateFields = {};
    if(req.body.tasktext){
        updateFields.task=req.body.tasktext;
    }
    if(req.body.taskdate){
      // var newDate=new Date(req.body.taskdate);
        updateFields.date=req.body.taskdate;
    }
    console.log(updateFields);


    database1.updateTask(req.body.id,updateFields,function (err) {
        if(err) res.send(err);
        else res.send(JSON.stringify({id:'success'}));
    });

})

module.exports = router;
