const Razorpay = require("razorpay");

module.exports = {


  friendlyName: 'Create transaction',


  description: '',


  inputs: {
    payment_id:{
      type:'string'
    }
  },


  exits: {
    invalid: {
      responseType: "badRequest",
      description: "Order is not created due to some issue.",
    },
    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    // TODO
    let instance = new Razorpay({
      key_id: sails.config.RAZOR_KEY_ID,
      key_secret: sails.config.RAZOR_SECRET_KEY,
    });

    instance.payments.fetch(inputs.payment_id).then((data) => {
      return exits.success(data);  
    })
    .catch((error) => {
      return exits.invalid(error);
    });

  }


};

