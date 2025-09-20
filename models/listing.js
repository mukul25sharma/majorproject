const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
  url: String,
  filename : String,
},

  price: Number,
  location: String,
  country: String,
  reviews : [ //adding reviews in listing schema
    {
    type : Schema.Types.ObjectId,
    ref : "review",
    },
  ],
  owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"   
}
//filter implement karne k liy
// category: {
//   type : String,
//   enum :["mountains","Arctic","farms","deserts",]
// }

});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;