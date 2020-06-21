const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys');
const requireLogin = require('../middleware/requireLogin');

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    res.status(422).json({ error: 'please add all thefields' });
  }
  User.findOne({ email: email })
    .then(savedUser => {
      if (savedUser) {
        res.status(422).json({ error: 'User already exists with that email' });
      }
      bcrypt.hash(password, 12).then(hashedpassword => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
        });
        user
          .save()
          .then(user => {
            res.json({ message: 'saved successfully' });
          })
          .catch(err => {
            console.loglog(err);
          });
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: 'please add email or password' });
  }
  User.findOne({ email: email }).then(savedUser => {
    if (!savedUser) {
      return res.status(422).json({ error: 'Invalid Email or Password' });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then(doMatch => {
        if (doMatch) {
          // res.json({ message: 'successfully signed in' });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          res.json({ token });
        } else {
          return res.status(422).json({ error: 'Invalid Email or Password' });
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

module.exports = router;
