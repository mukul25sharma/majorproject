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
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  async (req, res) => {
    let newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await newListing.save();

    req.flash("success", "New listing created");
    res.redirect("/listings");
  }
);

//edit rout
router.get("/:id/edit",isLoggedIn, async (req , res)=>{
   let {id} = req.params;
    const listing = await Listing.findById(id);
res.render("listings/edit.ejs", {listing});

});

// update route

router.put(
  "/:id",
  isLoggedIn,
  upload.single("listing[image]"),
  async (req, res) => {
    let { id } = req.params;

    let listingData = req.body.listing;

    let updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...listingData },
      { runValidators: true, new: true }
    );

    // Agar nayi image upload hui hai to update karo
    if (req.file) {
      updatedListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };

      await updatedListing.save();
    }
console.log("Updated Image:", updatedListing.image);
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
  }
);
//delete route
router.delete("/:id", isLoggedIn , async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");
    res.redirect("/listings");

});

module.exports = router;