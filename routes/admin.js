const database = require("./../database");
const express= require("express");
const app1 = express.Router();
app1.get("/" ,function(req,res){
  res.send("this is admin");
})
module.exports = app1;
