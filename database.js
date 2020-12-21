var db
const {
  MongoClient
} = require("mongodb");
module.exports = {
  connect: function(callback) {
    MongoClient.connect("mongodb+srv://prateek:prateek448@cluster0.wubds.mongodb.net/<dbname>?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, function(error, client) {
      db = client.db("ecommerce");
      return callback(error);
    })
  }, getusers: function() {
    return db.collection("users")
  }, getbuydetails: function(){
    return db.collection("buydetails")
  }, getfashion: function(){
    return db.collection("fashion")
  },getcart: function(){
    return db.collection("cart")
  },getorders: function(){
    return db.collection("orders")
  }}
