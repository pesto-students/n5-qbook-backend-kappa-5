module.exports = {


  friendlyName: 'Create user',


  description: '',


  inputs: {
    email:{
      type:'string'
    },
    googleAuthId:{
      type:'string'
    },
    firstname:{
      type:'string'
    },
    lastname:{
      type:'string'
    },
    image:{
      type:'string'
    },
  },


  exits: {
    invalid: {
			responseType: 'badRequest',
			description: 'The provided email address and/or password are invalid.',
		},
    emailAlreadyInUse: {
			statusCode: 409,
			description: 'The provided email address is already in use.',
		},
    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
     console.log(inputs);
		if (inputs.googleAuthId) {
		   var user = await Users.create(inputs)
       .intercept('E_UNIQUE', () => 'emailAlreadyInUse')
      .intercept({name: 'UsageError'}, () => 'invalid')
      .fetch();
       return exits.success(user);
		}
		else {
			return exits.invalid('Missing password.');
		}
  }


};

