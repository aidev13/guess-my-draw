const router = require('express').Router();
const { User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, async (req, res) => {
  try {
    const userData = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['wins', 'DESC']],
    });

    const users = userData.map((project) => project.get({ plain: true }));

    res.render('highscores', {
      users,
      logged_in: req.session.logged_in,
      showNav: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }
  res.render('login', {
    showNav: false,
  });
});

router.get('/register', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }
  res.render('register', {
    showNav: false,
  });
});

router.get('/game', (req, res) => {
  if (req.session.logged_in) {
    res.render('game', {
    logged_in: req.session.logged_in,
    user_id: req.session.user_id,
    showNav: true,
    hidePlayGameBtn: true,
  })
    return
  }
  res.redirect("/login")
});

module.exports = router;
