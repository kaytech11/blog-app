const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const upload = require("../middleware/multer");
const blogController = require("../controllers/blogcontroller");

// LIST ALL
router.get("/", isLoggedIn, blogController.listBlogs);

// NEW BLOG FORM
router.get("/new", isLoggedIn, blogController.newBlogForm);

// CREATE BLOG
router.post(
  "/",
  isLoggedIn,
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "video", maxCount: 1}]),
  blogController.createBlog
);

// SHOW SINGLE BLOG
router.get("/:id",isLoggedIn, blogController.showBlog);

// EDIT BLOG FORM
router.get("/:id/edit", isLoggedIn, blogController.editBlogForm);

// UPDATE BLOG
router.put("/:id", isLoggedIn, upload.single("photo"), blogController.updateBlog);


// DELETE BLOG
router.delete("/:id", isLoggedIn, blogController.deleteBlog);

// AUTHOR PAGE
router.get("/author/:id", blogController.authorPage);

module.exports = router;
