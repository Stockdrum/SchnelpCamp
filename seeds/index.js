const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection ERROR!!!"));
db.once("open", () => {
  console.log("DATABASE CONNECTED BABY!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 20; i++) {
    // setup for the function
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      // YOUR USERID 
      author: `63f894eeefdf252502dbc972`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [-113.1331, 47.0202]
      },
      images: [
        {
          url: "https://res.cloudinary.com/dxhqe1atq/image/upload/v1677501107/YelpCamp/d6majqmmgepyzftuhhaz.jpg",
          filename: "YelpCamp/d6majqmmgepyzftuhhaz",
        },
        {
          url: "https://res.cloudinary.com/dxhqe1atq/image/upload/v1677501107/YelpCamp/xrzf7sobubhc6md5awbj.jpg",
          filename: "YelpCamp/xrzf7sobubhc6md5awbj",
        },
      ],
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laudantium consequuntur beatae sunt accusantium eos praesentium doloremque fuga ut quod cum omnis cupiditate impedit blanditiis accusamus, dolore, eius animi. Perferendis, libero.",
      price,
    
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
