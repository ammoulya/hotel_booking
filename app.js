const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { ListingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const session=require("express-session");
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");

const MONGO_URL="mongodb://127.0.0.1:27017/test";
main().then(()=>{
    console.log("connect to db");
})
.catch((err)=>{
    console.log(err);
});


async function main(){
    await mongoose.connect(MONGO_URL)
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this for handling JSON data
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const sessionOptions={
    secret:"mysupersecretecode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};
app.get("/",(req,res)=>{
    res.send("hi,i m root");
});
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//to serialaize user  into sesion store user info
passport.deserializeUser(User.deserializeUser());//remove user information 

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");  
    res.locals.error = req.flash("error"); 
    res.locals.currUser=req.user;
    console.log(res.locals.success);
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//    let registeredUser=await User.register(fakeUser,"helloWorld");//register is convinet method to registe new user 
//    res.send(registeredUser);
// });
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:"goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesfull testing");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));

});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="somthing went wrong!"}=err;
   // res.status(statusCode).send(message);
   res.render("error.ejs",{message});
});
app.listen(3000,()=>{
    console.log("server is listening to port 3000");
});