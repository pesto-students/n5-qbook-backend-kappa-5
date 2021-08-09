let admin = require("firebase-admin");
let serviceAccount = require("../../api-project-19685698585-firebase-adminsdk-5prxe-ea6bda607d.json");

module.exports = {
  friendlyName: "Send notification",

  description: "",

  inputs: {
    data: {
      type: "json",
    },
    deviceToken: {
      type: "string",
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "The provided email address and/or password are invalid.",
    },
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    // TODO
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        serviceAccountId:
          "firebase-adminsdk-5prxe@api-project-19685698585.iam.gserviceaccount.com",
      });
    } else {
      admin.app();
    }

    const message = {
      notification: {
        title: "Hello Mumbai",
        body: "Heheheheheheheheheheheh",
      },
      token:
        "e41rJP7ZwinbWjwqdaSyqw:APA91bGVE03bHzKDw1rMIYdqJp9SJHTiVKanFyv0rzkZBWIBFsjcgxkGv-lIMMZl8KC3G9miivIGrfaoyyJTpjHdwsFyOEfG-tdlgDIBnBKwSAzA61yNJOXuVJU1A2U8JJ52XESjpcFz",
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin
      .messaging()
      .send(message)
      .then((response) => {
        // Response is a message ID string.
        return exits.success(response);
      })
      .catch((error) => {
        return exits.invalid("Missing Auth ID.");
      });
  },
};
