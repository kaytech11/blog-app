
const Blog = require("../models/Blog");
const path = require("path");
const fs = require("fs");

// LIST ALL BLOGS
exports.listBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate("author", "name");
    res.render("blogs/index", { blogs, session: req.session });
  } catch (err) {
    console.log(err);
    res.send("Error loading blogs");
  }
};

// SHOW SINGLE BLOG
exports.showBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name");
    if (!blog) return res.send("Blog not found");

    // increment reads
    blog.reads += 1;
    await blog.save();

    res.render("blogs/show", { blog, session: req.session });
  } catch (err) {
    console.log(err);
    res.send("Error loading blog");
  }
};

// CREATE BLOG FORM
exports.newBlogForm = (req, res) => {
  res.render("blogs/new", { session: req.session });
};

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    blog.author = req.session.userId;

    // save photos
    if (req.files["photo"]) {
      blog.photo = req.files["photo"].map(file => "/uploads/" + file.filename).join(",");
    }

    // save video
    if (req.files["video"]) {
      blog.video = "/uploads/" + req.files["video"][0].filename;
    }

    await blog.save();
    res.redirect("/blogs");
  } catch (err) {
    console.log(err);
    res.send("Error creating blog");
  }
};

// EDIT BLOG FORM
exports.editBlogForm = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.send("Blog not found");

    if (blog.author.equals(req.session.userId)) {
      res.render("blogs/edit", { blog, session: req.session });
    } else {
      res.send("Not authorized");
    }
  } catch (err) {
    console.log(err);
    res.send("Error loading blog");
  }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.send("Blog not found");

    if (!blog.author.equals(req.session.userId)) return res.send("Not authorized");

    blog.title = req.body.title;
    blog.content = req.body.content;

    // If a new photo is uploaded, delete the old one and save new
    if (req.file && blog.photo) {
      const oldPath = path.join(__dirname, "../public", blog.photo);
      fs.unlink(oldPath, err => {
        if (err) console.error("Error deleting old photo:", err);
      });
      blog.photo = "/uploads/" + req.file.filename;
    }

    await blog.save();
    res.redirect("/blogs/" + blog._id);
  } catch (err) {
    console.log(err);
    res.send("Error updating blog");
  }
};

// DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.send("Blog not found");

    if (!blog.author.equals(req.session.userId)) return res.send("Not authorized");

    // delete photo from server
    if (blog.photo) {
      const photoPaths = blog.photo.split(","); // handle multiple photos
      photoPaths.forEach(p => {
        const fullPath = path.join(__dirname, "../public", p);
        fs.unlink(fullPath, err => {
          if (err) console.error("Error deleting photo:", err);
        });
      });
    }

    // delete video from server
    if (blog.video) {
      const videoPath = path.join(__dirname, "../public", blog.video);
      fs.unlink(videoPath, err => {
        if (err) console.error("Error deleting video:", err);
      });
    }

    // delete blog from DB
    await blog.deleteOne();

    res.redirect("/blogs");
  } catch (err) {
    console.log(err);
    res.send("Error deleting blog");
  }
};

// AUTHOR PAGE
exports.authorPage = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.id }).populate("author", "name");
    if (!blogs.length) return res.send("No blogs from this author");

    const author = blogs[0].author;
    res.render("blogs/author", { blogs, author, session: req.session });
  } catch (err) {
    console.log(err);
    res.send("Error loading author page");
  }
};