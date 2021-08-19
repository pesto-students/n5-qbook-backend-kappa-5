module.exports.sendSupportMail = function(obj) {
    sails.hooks.email.send(
    "SupportEmail", 
    {
    name: obj.name,
    email: obj.email,
    subject: obj.subject,
    query: obj.query,
    },
    {
    to: sails.config.ADMIN_SUPPORT_EMAIL,
    subject: 'Support Email From Qbook User'
    },
    function(err) {console.log(err || "Mail Sent!");}
    )
   }