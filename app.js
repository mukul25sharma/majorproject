if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

console.log(process.env);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");



//const MONGO_URL = "mongodb://127.0.0.1/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
})
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);//local database k lir dbUrl ki jgh vhi MONGO_url pass karna
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



// app.get("/", (req, res) => {
//     res.send("hyy i am root");
// });

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error", ()=>{
    console.log("error in mongo session store",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req , res)=>{
// let fakeUser = new User ({
//     email: "abc@gmail.com",
//     username: "delta-students"
// });
// let registeredUser = await User.register(fakeUser,"helloworld");
// res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/", userRouter);



//reviews post rout

app.post("/listings/:id/reviews", async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview); //har ek new reiview add hoga listings ke array me

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
});

//delete rout for review
app.delete("/listings/:id/reviews/:reviewId", async (req, res) => {
    let { id, reviewId } = req.params;

    // listing से review हटाओ
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // review document delete करो
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
});

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "My new villa",
//         description : "By new beach",
//         price: 1200,
//         location : "calangute, goa",
//         county : "india",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });

app.listen(8080, () => {
    console.log("listening on port 8080");

});