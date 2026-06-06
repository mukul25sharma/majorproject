// restructuring the listings
const express = require("express");
const router = express.Router({mergeParams: true});
const Listing  = require("../models/listing.js");
const flash= require("connect-flash");
const {isLoggedIn}= require("../middleware.js");
const listingController = require("../controllers/listings.js");


const multer  = require('multer');

const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// router.route("/")
// .post(
//   isLoggedIn,
//   upload.single("listing[image]"),
//    //validateListing,
//   (req, res) => {
//     listingController.createListing(req, res);
//   }
// );

//index route
router.get("/", async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs",{allListings});
    });

    //new route
router.get("/new", isLoggedIn, (req, res)=>{
 res.render("listings/new.ejs");
});

//show route
router.get("/:id", async (req , res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
      req.flash("error", "listing you requested for does not exist");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
});


//create route
router.post("/", async (req,res) =>{
    // let {title, description, image, price, country, location} = req.body;  one way another is
    //let listing = req.body.listing;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save(); 
    req.flash("success", "new listing created");
    res.redirect("/listings");
}); 

//edit rout
router.get("/:id/edit",isLoggedIn, async (req , res)=>{
   let {id} = req.params;
    const listing = await Listing.findById(id);
res.render("listings/edit.ejs", {listing});

});

// update route
router.put("/:id",isLoggedIn, async (req, res) => {
  let { id } = req.params;

  // spread data
  let data = { ...req.body.listing };

  // agar image exist hai aur url khali hai → to image ko update mat karo
  if (data.image && data.image.url && data.image.url.trim() === "") {
    delete data.image;
  }

  await Listing.findByIdAndUpdate(id, data, { runValidators: true });
   req.flash("success", "listing updated");
  res.redirect(`/listings/${id}`); // edit ke baad show page pe le jao
});

//delete route
router.delete("/:id", isLoggedIn , async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");

});

module.exports = router;