/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  if (req.user) {
    console.log(req.user);
    if(req.user.role == 'super') {
      console.log('this is a super user');
      res.render('home')
    }
  } else {
    res.redirect('/login')
  }
};
