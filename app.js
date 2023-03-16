if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}



const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const AppError = require("./utilities/AppError");
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds.js");
const reviewRoutes = require("./routes/reviews.js");
const MongoStore = require('connect-mongo');
const dbUrl = 
"mongodb://127.0.0.1:27017/yelp-camp" || process.env.DB_URL

mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


/// Checks to see if an error takes place during the connection

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection ERROR!!!"));
db.once("open", () => {
  console.log("DATABASE CONNECTED BABY!");
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET ||'ihatedrums'

const store = MongoStore.create ({
  mongoUrl: dbUrl, 
  secret: 'ihatedrums',
  touchAfter: 24 * 60 * 60
})

store.on('error', (e) => {
  console.log('Session store error', e)
})

const sessionConfig = {
  store:MongoStore.create({ mongoUrl:"mongodb://127.0.0.1:27017/yelp-camp"}),
  name:'Johnson',
  secret: "ilikedrums",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet(
))


/////////////App. use external plugins////
/////////////IE. session , passport


const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dxhqe1atq/",
              "https://images.unsplash.com",
              'https://source.unsplash.com/random/300x250?camping',
              "https://scontent-fra5-2.xx.fbcdn.net/v/t31.18172-8/10317699_812773778746669_1591844940656593793_o.jpg?_nc_cat=107&ccb=1-7&_nc_sid=730e14&_nc_eui2=AeEyPAvm8F0RoXqRBDkocaQNhaQc9UCRht2FpBz1QJGG3WyrURl39k8YB1QrQQxDda4&_nc_ohc=snOUDcR2df4AX9gIPAB&_nc_ht=scontent-fra5-2.xx&oh=00_AfBG6r1nqQA8qlsLz3rImDuIF1QxNF2Om_lIFUFe1X4_ww&oe=643013CA",
              "https://res.cloudinary.com/douqbebwk/image/upload/v1600103881/YelpCamp/lz8jjv2gyynjil7lswf4.png"
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
 console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get('/favico.ico', (req, res) => {
  res.sendStatus(404);
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/fakeuser", async (req, res) => {
  const user = new User({ email: "trev@gmail.com", username: "drumboy" });
  const newUser = await User.register(user, "coolguy");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//////////////////////////////////////////////
////////// Start Get, Post, Delete ( CRUD) /////
//////////////////
app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new AppError("Page not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on the greatest port that is 3000");
});
