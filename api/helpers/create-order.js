const Razorpay = require('razorpay');

module.exports = {


  friendlyName: 'Create order',


  description: '',


  inputs: {
    amount:{
      type:'number'
    },
    currency:{
      type:'string'
    },
    receipt:{
      type:'string'
    },
    notes:{
      type:'string'
    },
  },


  exits: {
    invalid: {
			responseType: 'badRequest',
			description: 'The provided email address and/or password are invalid.',
		},
    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    // TODO
    var instance = new Razorpay({
      key_id: sails.config.RAZOR_KEY_ID,
      key_secret: sails.config.RAZOR_SECRET_KEY
    });

    instance.orders.create(inputs).then((data) => {
      return exits.success(data);
    }).catch((error) => {
      return exits.invalid(error);
    });

  }


};

