var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config');
var ObjectId = mongoose.ObjectId;

var ShadeSchema = new Schema({
    name: String,
    note: String,
    pageNo: String,
    bookName: String,
    formula: [{
        tinter: String,
        qty: Number,
    }],
    cId: {type: ObjectId, ref: config.tables.CUSTOMER},
    day: Number,
    month: Number,
    year: Number,
    hexCode: String,
    totalQty: Number

},{collection:config.tables.SHADE})

var Shade = module.exports = mongoose.model('Shade',ShadeSchema, config.tables.SHADE);

module.exports.index = (req, res) => {
    res.render('shade', {
        title: "Shade"
    })
}

module.exports.getAllShades = (req,res) => {
    var retObj = {
        status: false,
        message: "Err Querying database while fetching shades, Try again", 
        deatails: []
    };
    var querry = [
        { $lookup: {from: config.tables.CUSTOMER, localField:"cId", foreignField:"_id", as:"customer"}}
    ]
    Shade.aggregate(querry, (err, shades) =>{
        console.log(err)
    //.find({}, {_v:0},(err,shades)=>{
        if(err){
            res.json(retObj)
            }else{
                retObj.status = true;
                retObj.message = "Found All Shades";
                retObj.details = shades;
                res.json(retObj)
            }
    });
}

module.exports.getShadeById = (req,res) => {
    var shadeId = req.params['_id']
    var retObj = {
        status: false,
        message: "Err Querying database while fetching shades, Try again", 
        deatails: []
    };
    Shade.findById(shadeId, {_v:0},(err,shade)=>{
        if(err){
            res.json(retObj)
            }else{
                retObj.status = true;
                retObj.message = "Found All Shades";
                retObj.details = shade;
                res.json(retObj)
            }
    });
}

module.exports.getShadeByCustomerId = (req,res) => {
    var cId = req.params['_cId']
    var retObj = {
        status: false,
        message: "Err Querying database while fetching shades, Try again", 
        deatails: []
    };
    var querry = [
        {$match: {cId:mongoose.Types.ObjectId(cId)}},
        { $lookup: {from: config.tables.CUSTOMER, localField:"cId", foreignField:"_id", as:"customer"}}
    ]
    Shade.aggregate(querry,(err,shade)=>{
        if(err){
            res.json(retObj)
            }else{
                retObj.status = true;
                retObj.message = "Found All Shades By Customers";
                retObj.details = shade;
                res.json(retObj)
            }
    });
}

module.exports.upsertShade = (req,res) => {
    console.log('Error 500')
    var shade = req.body
    console.log(shade);
    var retObj = {
        status: false,
        message: "Err Adding shades, Try again", 
        deatails: []
    };
    var query = {_id: mongoose.Types.ObjectId()};
    if(shade._id){
        query = {_id: shade._id};
    }
    if(shade.formula) {
        shade.formula = JSON.parse(shade.formula)
    }
    Shade.updateOne(query, shade, {upsert: true},(err,result)=>{
        if(err){
            console.log("Error In Upsert Shade");
            console.log(err);
            res.json(retObj)
            }else{
                if(shade._id){
                    retObj.message = "Updated Successfully"
                }else{
                    retObj.message = "Inserted Successfully"
                }
                retObj.status = true;
                retObj.details = result;
                res.json(retObj)
            }
    });
}