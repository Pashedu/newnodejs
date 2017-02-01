/**u
 * Created by pashed on 29.12.16.
 */
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/exdb');
mongoose.connection.on('connected', function () {
    console.log("Connected!!!!");
});

var Schema = mongoose.Schema;
var postSchema = new Schema({
    parentId: Schema.Types.ObjectId,
    task: String,
    date: {type: Date, default: Date.now()},
    doneCheck: Boolean,
    priority: {type: Number, min: 1, max: 5, default: 1},
    doneDate: {type: Date, default:null}
});

var monModel = mongoose.model("TaskBase", postSchema, 'TaskBase');

var listByDate = function (formDate,cb) {

    var startdate = new Date(formDate);
    var enddate = new Date(startdate);
    enddate.setDate(startdate.getDate()+1);
    console.log("Start Date: "+startdate+"   End Date: "+enddate);
    monModel.find({date: {'$gte': startdate, '$lt':enddate}},function (err,tasks) {
        if (err) cb(err);
        cb(err,tasks);
    });
};

var listFromDate = function (formDate,cb) {
    var startdate = new Date(formDate);
    var enddate = new Date(startdate);
    var tommorowEndDate = new Date(enddate);
    enddate.setDate(startdate.getDate()+1);
    tommorowEndDate.setDate(enddate.getDate()+1);
    monModel.find({date: {'$lt':startdate}, doneCheck: false}).sort ({date: -1}).exec(function (err,listEarlier) {
        monModel.find({date: {'$gte': startdate, '$lt': enddate}, doneCheck: false}, function (err, listT) {
            monModel.find({date: {'$gte': enddate, '$lt': tommorowEndDate}, doneCheck: false}, function (err, listTm) {
                monModel.find({date: {'$gte': tommorowEndDate}, doneCheck: false}, function (err, listL) {
                    monModel.find({doneCheck: true}).sort({date: -1}).exec(function (err, listDone) {
                        if (err) cb(err);
                        else cb(err, listEarlier, listT, listTm, listL, listDone);
                    });
                });
            });
        });
    });


};

var listAllTasks = function (cb) {

    monModel.find(function(err,persons){
        if (err) {
            console.log(err);
            cb(err);
        }
        else {
            err= null;
            cb(err,persons);
        }
    });
};

var updateTask = function (postId, fields, cb) {
  //  console.log("updateTask:"+postId+'with fields'+fields.toString());
    monModel.findOneAndUpdate({_id: postId}, {$set:fields}, function (err, data) {
        if(err) console.log("update error: "+err);
        cb(err,data);
    });

};

var newTask = function (postId,taskText,taskDate,cb) {
  //  var postObjId=mongoose.Types.ObjectId(postId);

    var newPost= new monModel;
    newPost.parentId=null;
    newPost.task=taskText;
    newPost.date=new Date(taskDate);
    newPost.doneCheck=false;
    newPost.priority=1;
    newPost.doneDate=null;

    monModel.create(newPost, function (err, data) {
        if(err) console.log(err);
        cb(err,data);
    });

};

var deleteTask = function (postId, cb) {
    var postObjId=mongoose.Types.ObjectId(postId);

    monModel.remove({_id: postObjId},function (err) {
        if(err) cb(err);
        else cb (err, postId);

    })
};

var findById = function (id, cb) {
    monModel.findOne({_id: id}, function (err, data) {
        if (err) cb(err);
        else cb(err, data);
    });
};

module.exports.newTask=newTask;
module.exports.findById=findById;
module.exports.listFromDate=listFromDate;
module.exports.listByDate=listByDate;
module.exports.deleteTask=deleteTask;
module.exports.updateTask=updateTask;
module.exports.listAllTasks = listAllTasks;