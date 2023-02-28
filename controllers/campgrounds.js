const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.createNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampgrounds = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map(f => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user.id;
  campground.user = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Succsessfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampgrounds = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(campground);
  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/show", { campground });
};

module.exports.editCampgrounds = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampgrounds = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map(f => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  req.flash("success", " Successfully updated campground!!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampgrounds = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You dont have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted this campground!");
  res.redirect("/campgrounds");
};