var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Post = require("../models/Post");
var Content = require("../models/content");
const passport = require("passport");
const async = require("async");
var crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
var bcrypt =  require('bcryptjs');
var validateRegisterInput = require("../validation/register");
var validateLoginInput = require("../validation/login");
var validateCompleteProfile = require("../validation/profile");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
var hasher = require('wordpress-hash-node');
const config = require("../config/auth");

sgMail.setApiKey(config.sendgrid.apiKey);
//Download documents previously uploaded
router.get('/get', function (req, res) {
  Content.find({}, (err, doc) => {
    res.send(doc);
  })
});

router.post('/download/:id', function (req, res) {
  var type = req.query.type;
  var id = req.params.id;
  query[`${type}.id`] = id;
  Content.findOne({ query }, function (err, doc) {
    res.download(path.join(__dirname, "../uploads/downloads/", doc[type].value));
  })
});

// Forgot Password Mailing System
router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ username: req.body.email }, function (err, user) {
        if (!user) {
          res.json({ success: false, msg: 'No account with that email address exists.'});
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },

    function (token, user, done) {

      const msg = {
        to: user.username,
        from: 'prakash@bidgely.com',
        subject: 'Verify your account!',
        html: `Please click on the <a href="https://vigilant-mayer-030069.netlify.app/reset/${token}">link</a> to reset your password`,
      };

      sgMail.send(msg, false, function (err) {
        console.log(err);
       // res.json({ error: true, msg:' An e-mail has been sent to ' + user.username + ' with further instructions.'});
        done(err, 'done');
      });
    }
  ], function (err) {

    if (err) return next(err);
    res.json({ error: false, msg: "Mail Sent Successfully"});
  });


});

//Password Reset Option
router.post('/reset', async function (req, res) {
  var pass = req.body.password;
  var confirm = req.body.confirmPass;
  if (pass !== confirm)
    res.render('resetPass', { error: 'Passwords don\'t match' });
  var user = User.findOne({ 'username': req.user.username });

  await bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(result.value.password, salt, (err, hash) => {
      if (err) throw err;
      user.password = hash;
      user.save();
    });
  });

});

//Signup Option
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({'username': req.body.username }).then(user => {
    if (user) {
      errors.username = 'Email already exists';
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.username, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post('/complete',  (req,res) => {
  const { errors, isValid } = validateCompleteProfile(req.body.employment);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const username = req.body.username;
  const employment = req.body.employment;

  User.findOne({ username }).then(user => {
    if (!user) {
      errors.username = 'User not found';
      return res.status(404).json(errors);
    }

    user._doc.employment = employment;
    var userObj = new User(user);
    userObj.save().then(doc => {
      console.log(doc);
      res.json(doc);
    }).catch(err => res.send(500));
  })
});

router.get("/members", (req, res) => {
  User.find({}).select({ "name": 1, "username": 1, "points": 1, "avatar": 1}).then((doc) => {
    res.send(doc);
  })
});

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username }).then(user => {
    if (!user) {
      errors.username = 'User not found';
      return res.status(404).json(errors);
    }

    var checked = hasher.CheckPassword(password, user.password); //This will return true;
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch || checked) {
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload

        jwt.sign(
            payload,
            'secret',
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                user: user,
                success: true,
                token: 'Bearer ' + token
              });
            }
        );
      } else {
        errors.password = 'Password incorrect';
        return res.status(400).json(errors);
      }
    });
  });
});

router.post("/follow/:source/:dest", passport.authenticate('jwt', { session: false }),
    (req, res) => {
      User.findByIdAndUpdate(req.params.dest, { $push: { followers: req.params.source }}, { new: true, useFindAndModify: false })
          .then(user => res.json({ user }))
          .catch(error => res.send(500))
    }
);

router.post(
    '/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
      User.findOne({username: req.body.username}, async (err, doc) =>
      {
        if(err)
          res.send(500);
        var questions = await Post.find({isQuestion: true, user: doc._id });
        var posts = await Post.find({isQuestion: false, user: doc._id });
        doc._doc.questions = questions;
        doc._doc.posts = posts;
        res.json(doc);
      })
    }
);

///////////////////////////////////////////////
/**             Import scripts            **/
//////////////////////////////////////////////
router.post('/import', (req,res) => {
  const newUser = new User(req.body);
  newUser.save().then(response => res.send(response)).catch(err => res.send("error BE"))
});

router.get("/allq", (req, res) => {
  Post.find({isQuestion: true}, (err, doc) => {
    res.send(doc);
  })
});

router.get("/alla", (req, res) => {
  Post.find({isQuestion: false}, (err, doc) => {
    res.send(doc);
  })
});

router.post('/import2', (req,res) => {
  const posts = new Post(req.body);
  posts.save().then(response => {
    res.send(response);
  }).catch(err => {
    console.log(err);
    res.send(`Error in ${req.body.uid}`)
  });
});

router.post('/import3/:parent', (req,res) => {
  const posts = new Post(req.body);
    Post.findOneAndUpdate( { _id: req.params.parent },
        { $push: { comments: posts  } },{ new: true, useFindAndModify: false })
        .then(post => {
          console.log(post);
          res.json({ post })
        })
        .catch(error => res.send(500))
});


module.exports = router;
