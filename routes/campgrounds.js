const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

///////////////////////////
//// Router movement Get put post delete....////
/////////////////

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampgrounds)
  );

router.get("/new", isLoggedIn, campgrounds.createNewForm);


router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampgrounds))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampgrounds)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.editCampgrounds)
);

module.exports = router;
