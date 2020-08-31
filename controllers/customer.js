var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config')

var CustomerSchema = new Schema({
    name: String,
    phoneNo: String,
    note: String
},{collection:config.tables.CUSTOMER})

var Customer = module.exports = mongoose.model('customer',CustomerSchema, config.tables.CUSTOMER);

module.exports.index = (req, res) => {
    res.render('customer', {
        title: "Customer"
    })
}

module.exports.viewById = (req, res) => {
    var cid = req.params['_id']
    
    Customer.findById(cid, {_v:0},(err,customer)=>{
        if(err){
            res.json(retObj)
            }else{
                res.render('customerView', {
                    title: "Customer",
                    cid: cid,
                    name: customer.name,
                    phone: customer.phoneNo,
                    note: customer.note
                })
            }
    });
}
    

module.exports.getAllCustomers = (req,res) => {
    var retObj = {
        status: false,
        message: "Err Querying database while fetching customers, Try again", 
        deatails: []
    };
    Customer.find({}, {_v:0},(err,customers)=>{
        if(err){
            res.json(retObj)
            }else{
                retObj.status = true;
                retObj.message = "Found All Customers";
                retObj.details = customers;
                res.json(retObj)
            }
    });
}

module.exports.getCustomerById = (req,res) => {
    var cId = req.params['_id']
    console.log(cId)
    var retObj = {
        status: false,
        message: "Err Querying database while fetching customers, Try again", 
        deatails: []
    };
    Customer.findById(cId, {_v:0},(err,customer)=>{
        if(err){
            res.json(retObj)
            }else{
                retObj.status = true;
                retObj.message = "Found Customer by Id";
                retObj.details = customer;
                res.json(retObj)
            }
    });
}

module.exports.upsertCustomer = (req,res) => {
    console.log('Error 500')
    var customer = req.body
    console.log(customer);
    var retObj = {
        status: false,
        message: "Err Adding customers, Try again", 
        deatails: []
    };
    var query = {_id: mongoose.Types.ObjectId()};
    if(customer._id){
        query = {_id: customer._id};
    }
    Customer.updateOne(query, customer, {upsert: true},(err,result)=>{
        if(err){
            console.log("Error In Upsert Customer");
            console.log(err);
            res.json(retObj)
            }else{
                if(customer._id){
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

module.exports.searchCustomers = (req, res, next) => {
    var term = req.params['_Term']
    var retObj = {
        message: 'Error Getting Customers',
        status: false,
        details: []
    }

    Customer.find({
        // role: 'customer',
        $or: [
            { name: { "$regex": term, "$options": "i" } }
        ]
    }, { }, (err, customer) => {
        if (err) {
            console.log(retObj.message, err)
            return res.json(retObj);
        } else {
            retObj.message = 'Find customer ' + term
            retObj.status = true
            retObj.details = customer
            return res.json(retObj);
        }
    })

};
