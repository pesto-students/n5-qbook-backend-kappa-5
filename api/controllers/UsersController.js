/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 var jwt = require('jsonwebtoken');

module.exports = {
  
  login: async function (req, res) {
    var user = await Users.findOne({
        email: req.param('email')
    });
    //console.log(req.body);
    if (!user) {
        user = await sails.helpers.createUser.with(req.body);
    }
    // if no errors were thrown, then grant them a new token
    // set these config vars in config/local.js, or preferably in config/env/production.js as an environment variable
    var token = jwt.sign({user: user.id}, sails.config.jwtSecret, {expiresIn: sails.config.jwtExpires})
    // set a cookie on the client side that they can't modify unless they sign out (just for web apps)
    await Users.updateOne({email:user.email}).set({accessToken:token});
    
    // res.cookie('sailsjwt', token, {
    //     signed: true,
    //     domain: 'http://localhost:1337/', // always use this in production to whitelist your domain
    //     maxAge: sails.config.jwtExpires
    // })
    var data = {
        result:user,
        token:token
    }
    res.forbidden();
    // provide the token to the client in case they want to store it locally to use in the header (eg mobile/desktop apps)
    return res.ok(data)
},

updateConfig: async function(req,res){
   return res.ok(req.user);
}


};
