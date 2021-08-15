const accountSid = sails.config.TWILLIO_ACCOUNT_ID;
const authToken = sails.config.TWILLIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
let shortUrl = require("node-url-shortener");

module.exports = {
  friendlyName: "Send message",

  description: "",

  inputs: {
    file: {
      type: "string",
    },
    mobile: {
      type: "string",
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    // TODO
    let shorturl = await shortUrl.short(inputs.file, function (err, url) {
      // console.log(url);
      client.messages
        .create({
          body:
            "Thanks for using QBook Appointment Service. Please download your precription/invoice from here " +
            url +
            ".",
          messagingServiceSid: "MGe0f908db8cc3c7ea7ffaa0b46f6e7040",
          to: '+91'+inputs.mobile,
        })
        .then((message) => console.log(message.sid))
        .done();
    });
    //console.log(shorturl);

    return exits.success(true);
  },
};
