const database = require("./database");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require('bcrypt');
const {
  ObjectId
} = require('mongodb');
const sessCook = require('sesscook');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
app.use(cookieParser('sessionsecret'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
const session = sessCook(app, "sessionsecret", "sessionpublickey", 60 * 60 * 2);
database.connect(function(error) {
  if (error) {
    console.log("error")
  }
  app.use("/admin", require("./routes/admin.js"));
  console.log("connected")
  app.get("/", function(req, res) {
    if (!session.isValid(req)) {
      return res.render("index.ejs");
    }
    res.redirect("/profile");
  });
  app.get("/profile", async function(req, res) {
    if (!session.isValid(req)) {
      return res.redirect("/login");
    }
    productdetails = await database.getbuydetails().find({}).toArray();
    console.log(session.isValid(req));
    var valid = session.isValid(req);
    res.render("profile.ejs", {
      email: valid.email,
      fname: valid.fname,
      products: productdetails
    });

  })
  app.get("/login", function(req, res) {
    if (session.isValid(req)) {
      return res.redirect("/profile")
    }
    res.render("login.ejs",{error: false});
  });
  app.post("/login", async function(req, res) {
    email = req.body.email;
    password = req.body.password;
    query = {
      email: email
    };
    user = await database.getusers().findOne(query);
    console.log(user);

    if (await bcrypt.compare(password, user.password)) {
      session.create(res, {
        email: email,
        fname: user.name,
        address: user.address
      });
      res.redirect('/profile')
    } else {
     res.render("login.ejs",{error: "incorrect"});
    }

  });
  app.get("/login" + "/buy", async function(req, res) {
    var valid = session.isValid(req);
    if (!valid) {
      return res.redirect("/login");
    }
    product = await database.getbuydetails().findOne({
      _id: ObjectId(req.query.id)
    });


    console.log(product);

    res.render("buy.ejs", {
      product,
      email: valid.email,
      fname: valid.fname
    });
  });
  app.post("/login" + "/buy", async function(req, res) {
    query = {
      email: email
    };
    user = await database.getusers().findOne(query);

    console.log(user);
  });


  app.post("/signup", async function(req, res) {
    const hashedPassword = await bcrypt.hash(req.body.password, 16);
    fname = req.body.fname;
    email = req.body.email;
    password = hashedPassword;
    address = req.body.address;

    result = await database.getusers().insertOne({
      name: fname,
      email: email,
      password: password,
      address: address
    });
    console.log(result)
    if (result.insertedCount > 0) {
      session.create(res, {
        email: email,
        fname: fname,
        address: address
      });
      res.redirect('/profile');
    }
  });
  app.get("/logout", (req, res) => {
    session.finish(res);
    res.redirect("/");
  });
  app.get("/products", async function(req, res) {
    if (!session.isValid(req)) {
      return res.redirect("/login");
    }
    productdetails = await database.getbuydetails().find({}).toArray();

    console.log(session.isValid(req));
    var valid = session.isValid(req);
    res.render("products.ejs", {
      email: valid.email,
      fname: valid.fname,
      products: productdetails,
    });
  });
  app.get("/cart", async function(req, res) {
    if (!session.isValid(req)) {
      return res.redirect("/login");
    }
  });
  app.get("/purchase", async function(req, res) {
    var valid = session.isValid(req);
    if (!valid) {
      return res.redirect("/login");
    }
    product = await database.getbuydetails().findOne({
      _id: ObjectId(req.query.id)
    });
    res.render("purchase.ejs", {
      product,
      email: valid.email,
      fname: valid.fname,
      address: valid.address
    });
  });
  app.post("/purchase", async function(req, res) {
    query = {
      email: email
    };
    user = await database.getusers().findOne(query);

    console.log(user);
  });
  app.post("/cart", async function(req, res) {
    var valid = session.isValid(req);
    if (!valid) {
      return res.redirect("/login");
    }
    productid = req.body.id;
    emailid = valid.email;
    findproduct = await database.getcart().findOne({emailid: emailid});
    if(!findproduct){
    result = await database.getcart().insertOne({
      productid: [productid],
      emailid: emailid
    });
  return res.json({cart:"cart updated"});}

    if(!findproduct.productid.find((id)=>id==productid))
{

    find = await database.getcart().findOneAndUpdate({emailid: emailid},{$push:{productid:productid}});
  }
res.json({cart: "cart updated"});});
  app.get("/cartview", async function(req, res){
    var valid = session.isValid(req);
  emailid = valid.email;
  findproduct = await database.getcart().findOne({emailid: emailid});
  if(!findproduct){
    return res.render("cart.ejs",{buydetails: false,fname: valid.fname,emailid: valid.emailid});
  }
  findproduct.productid.forEach((id,i)=>{
    findproduct.productid[i]=ObjectId(id)
  });
  buydetails=await database.getbuydetails().find({"_id":{"$in":findproduct.productid}}).toArray();

    res.render("cart.ejs",{
      buydetails,
      fname: valid.fname,
    emailid: valid.emailid,
    address: valid.address});
  } );
  app.get("/delcartitem", async function(req, res) {
    if (!session.isValid(req)) {
      return res.redirect("/login");
    }

  });
  app.post("/delcartitem", async function(req, res) {
    var valid = session.isValid(req);
    if (!valid) {
      return res.redirect("/login");
    }
    productid = req.body.id;
    emailid = valid.email;
    findproduct = await database.getcart().findOne({emailid: emailid});



    find = await database.getcart().update({emailid: emailid},{$pull:{productid:productid}});
    return res.json({delcartitem:"item deleted"});


  });
  app.get("/orders", async function(req, res) {
    if (!session.isValid(req)) {
      return res.redirect("/login");
    }
  });
  app.post("/orders", async function(req, res){
    var valid = session.isValid(req);
    if (!valid) {
      return res.redirect("/login");
    }
    productid= req.body.id;
    emailid= valid.email;
    console.log(productid)
    productid=productid.split(',')
    console.log(productid)
    findproduct = await database.getorders().findOne({emailid: emailid});
    if(!findproduct){
      result = await database.getorders().insertOne({
        productid: productid,
        emailid: emailid
      });
      res.json({cart: "cart updated"});
    }

   else{
     console.log(findproduct)
    productid=findproduct.productid.concat(productid)
    find = await database.getorders().findOneAndUpdate({emailid: emailid},{$set:{productid:productid}});
    res.json({cart: "cart updated"});
};
  });
  app.get("/ordersview", async function(req, res){
    var valid = session.isValid(req);
    if(!valid){
      return res.redirect("/login")
    }
    emailid= valid.email
    findproduct = await database.getorders().findOne({emailid:emailid})
    if(!findproduct){
      return res.render("myorders.ejs",{buydetails:false, emailid:emailid, fname: valid.fname})
    }
    findproduct.productid.forEach((id,i)=>{
      findproduct.productid[i]=ObjectId(id)

    });

    buydetails=await database.getbuydetails().find({"_id":{"$in":findproduct.productid}}).toArray();
    console.log(buydetails)
    res.render("myorders.ejs",{
      buydetails,
      fname: valid.fname,
    emailid: valid.emailid,
    address: valid.address});
  });
app.get("/contact", function(req,res){
  var valid = session.isValid(req);
  if(!valid){
    return res.redirect("/login")
  }

  res.render("contact.ejs",{emailid:valid.email,fname: valid.fname});
})
  app.listen(process.env.PORT || 3000, function() {
    console.log("server has started on 3000 port");
  });
});
