const Listing = require("../models/listing.js");

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
};
modules.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
 };
modules.exports.showListing=async(req,res)=>
    {
       let{id}=req.params;
       const listing = await Listing.findById(id).populate("reviews").populate("owner");
    
       if(!listing){
        req.flash("error","listing u requested does not exist !");
        res.redirect("/listings");
       }
       console.log(listing);
      res.render("listings/show.ejs",{listing});
    };
module.exports.createListing=async(req,res,next)=>{
    //  if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing ")
    //  }
    //ListingSchema.validate(req.body);
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","new listing created!");
    res.redirect("/listings");

};
module.exports.renderEditForm=async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","listing u requested does not exist !");
        res.redirect("/listings");
       }
    console.log(listing);
    res.render("listings/edit.ejs",{listing});
   };
