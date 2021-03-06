/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var Razorpay = require("razorpay");

module.exports = {
  createOrder: async function (req, res) {
    try {
      var instance = new Razorpay({
        key_id: sails.config.RAZOR_KEY_ID,
        key_secret: sails.config.RAZOR_SECRET_KEY,
      });

      var requestAttr = {
        amount: "500",
        currency: "INR",
        receipt: "receipt#1",
        notes: "Appointment",
      };

      instance.orders
        .create(requestAttr)
        .then((data) => {
          return res.ok(data);
        })
        .catch((error) => {
          console.log("error", error);
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
};
