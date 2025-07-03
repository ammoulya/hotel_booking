const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {ListingSchema,reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn}=require("../middleware.js");
const listingController = require("../controllers/listings.js");





const validateListing=(req,res,next)=>
    {
        let { error } = ListingSchema.validate(req.body);
        if(error){
            let errMsg=error.details.map((el)=el.message).join(",");
            throw new ExpressError(400,errMsg);
    
    }else{
        next();
    }
    };
//index 
router.get("/",wrapAsync(listingController.index));
//new rouate
router.get("/new",isLoggedIn,listingController.renderNewForm);
//show route
router.get("/:id",wrapAsync(listingController.showListing));
//create route
router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.createListing));
//editing rout
router.get("/:id/edit",isLoggedIn,wrapAsync(listingController.renderEditForm
));
//update Rout
router.put("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing ")
     }
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","listing updated");
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","listing deletes!");
    res.redirect("/listings");
}));
module.exports=router;