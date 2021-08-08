const fs = require('fs');
const AWS = require('aws-sdk');


module.exports = {


  friendlyName: 'Upload file',


  description: '',


  inputs: {
    data:{
      type:'string'
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    // TODO
    const s3 = new AWS.S3({
      accessKeyId: sails.config.AWS_KEY_ID,
      secretAccessKey: sails.config.AWS_SECRET_KEY_ID
  });

  const fileData = fs.readFileSync(inputs.data);


  const randomValue =  Math.floor(Math.random() * 90000) + 10000;

  const params = {
    Bucket: sails.config.AWS_BUCKET, // pass your bucket name
    Key: 'prescription/Report-'+randomValue+'.pdf', // file will be saved as testBucket/contacts.csv
    ACL: 'public-read-write',
    Body: fileData
};

  s3.upload(params, function(s3Err, data) {
    if (s3Err) throw s3Err
    return exits.success(data);
    //console.log(`File uploaded successfully at ${data.Location}`)
});

  }


};

