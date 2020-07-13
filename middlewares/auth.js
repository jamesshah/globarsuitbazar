module.exports = {
  checkAgent: function checkAuthAgent(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/agents/login");
    }
  },
  checkAdmin: function checkAuthAdmin(req, res, next) {
    if (req.session.admin) {
      next();
    } else {
      res.status(401).send("401 - Unauthorized");
      // res.redirect("/admin/login");
    }
  },
};
