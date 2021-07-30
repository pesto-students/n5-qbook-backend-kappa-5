/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to require an authenticated user, or else redirect to login page
 *                 Looks for an Authorization header bearing a valid JWT token
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  sails.helpers
    .verifyToken.with({
      req: req,
      res: res,
    })
    .switch({
      error: function (err) {
        return res.serverError(err);
      },
      invalid: function (err) {
        if (req.wantsJSON) {
          return res.sendStatus(401);
        }
      },
      success: function () {
        // user has been attached to the req object (ie logged in) so we're set, they may proceed
        return next();
      },
    });
};
