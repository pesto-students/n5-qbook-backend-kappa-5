/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment");

module.exports = {
  login: async function (req, res) {
    try {
      var user = await Users.findOne({
        email: req.param("email"),
      });
      //console.log(req.body);
      if (!user) {
        user = await sails.helpers.createUser.with(req.body);
      }
      // if no errors were thrown, then grant them a new token
      // set these config vars in config/local.js, or preferably in config/env/production.js as an environment variable
      var token = jwt.sign({ user: user.id }, sails.config.jwtSecret, {
        expiresIn: sails.config.jwtExpires,
      });
      // set a cookie on the client side that they can't modify unless they sign out (just for web apps)
      await Users.updateOne({ email: user.email }).set({ accessToken: token,token:req.body.token });

      var data = {
        result: user,
        token: token,
      };
      // provide the token to the client in case they want to store it locally to use in the header (eg mobile/desktop apps)
      return res.ok({
        status: true,
        msg: "User login successfully",
        data: data,
      });
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },

  updateConfig: async function (req, res) {
    try {
      const user = req.user;
      let setting = await Setting.findOne({ userId: user.id });
      if (!setting) {
        let data = req.body;
        data.userId = user.id;
        setting = await Setting.create(req.body).fetch();
      } else {
        setting = await Setting.updateOne({ userId: user.id }).set(req.body);
      }
      return res.ok({
        status: true,
        msg: "User Setting Details",
        data: setting,
      });
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },

  dashboard: async function (req, res) {
    try {
      let user = req.user;
      let setting = {};
      let detail = await Users.findOne({ id: user.id });
      setting = await Setting.findOne({ userId: user.id });

      return res.ok({
        status: true,
        msg: "User Dashboard Details",
        data: {
          record: detail,
          setting: setting,
        },
      });
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },

  generateQRCode: async function (req, res) {
    try {
      const user = req.user;
      let data = {};
      const hash = crypto.randomBytes(30).toString("hex");
      let qrCode = await QRCode.findOne({ userId: user.id });
      if (!qrCode) {
        data.userId = user.id;
        data.uuid = hash;
        data.status = 1;
        qrCode = await QRCode.create(data).fetch();
      } else {
        qrCode = await QRCode.updateOne({ userId: user.id }).set({
          uuid: hash,
        });
      }

      let setting = await Setting.findOne({userId:qrCode.userId});

      if(!setting){
        return res.badRequest({
          status: false,
          msg: "Please add a setting First",
          data: {},
        });
      }

      const url = sails.config.FRONT_END_URL + "booking?uuid=" + qrCode.uuid;
      return res.ok({ status: true, msg: "QR Code Url", data: url });
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: false,
        msg: "Something went wrong !",
        data: {},
      });
    }
  },
  UserSupportRequest: async function (req,res){
    try { 
    const user = req.user;
     let emailObj = {
       name: user.firstname,
       email:user.email,
       subject:req.body.subject,
       query:req.body.query
     }
    await Mailer.sendSupportMail(emailObj);
    return res.ok({ status: true, msg: "Support Mail sent successfully", data:{}});
  } catch (err) {
    console.log(err);
    return res.badRequest({
      status: false,
      msg: "Something went wrong !",
      data: {},
    });
  }
  },
  UserReportData: async function(req,res){
    try{
      const user = req.user;
      let financeData = [];
      let appointmentData = [];
      let bookingRecord = await Booking.find({userId:user.id,status:2});


      bookingRecord && bookingRecord.map((book) => {
         const date = moment(book.bookingDateTime).format('DD-MM-YYYY');
         const day =  moment(book.bookingDateTime).day();
         const month = moment(book.bookingDateTime).month();
         financeData.push({date:date,day:sails.config.MOMENT_WEEK_DAYS[day],month:sails.config.MOMENT_MONTH[month],payment:book.fees});
         appointmentData.push({date:date,day:sails.config.MOMENT_WEEK_DAYS[day],month:sails.config.MOMENT_MONTH[month],appointment:1});
      });

      return res.ok({ status: true, msg: "Reports Data", data:{finance:financeData,appointment:appointmentData}});

    }catch(err){
    console.log(err);
    return res.badRequest({
      status: false,
      msg: "Something went wrong !",
      data: {},
    });
    }
  }
};
