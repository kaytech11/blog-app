const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

//register page
router.get('/register', (req, res) => {
    res.render('auth/register');
});



//register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    // check empty
    if (!name || !email || !password || !confirmPassword) {
      return res.render("auth/register", {
        error:"All Fields are required",
      });
    }

    // password match
    if (password !== confirmPassword) {
      return res.send("Passwords do not match");
    }

    // password length
    if (password.length < 6) {
      return res.send("Password must be at least 6 characters");
    }
    
    if (password.length > 15) {
        return res.send("Password must be less than 15 characters");
    }

    // email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("auth/register", {
        error:"email already exits",
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.session.userId = user._id;
    req.session.userName = user.name;
    res.redirect("/blogs");

  } catch (err) {
    console.log(err);
    res.send("Register error");
  }
});


// login page 
router.get("/login", (req, res) => {
  res.render("auth/login", { error: null });
});

// login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("auth/login", {
      error: "All fields are required"
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("auth/login", {
        error: "User not found or you dont have an account"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.render("auth/login", {
        error: "Invalid email or password"
      });
    }

    // create session
    req.session.userId = user._id;
    req.session.userName = user.name;

    res.redirect("/blogs");

  } catch (err) {
    console.log(err);
    res.render("auth/login", {
      error: "Something went wrong"
    });
  }
});




// logout user
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal server error');
        }
        res.redirect('/login');
    });
});

module.exports = router;