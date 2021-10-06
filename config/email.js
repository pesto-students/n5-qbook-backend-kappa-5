module.exports.email = {
    service: "Mailgun",
    auth: {
        user: "postmaster@sandboxf4881d63c0784791a669454e921ebcc9.mailgun.org", 
        pass: "f3848e3c5a5108a279aad6b22e22115f"
        },
        templateDir: "api/emailTemplates",
        from: "info@qbook.in",
        testMode: false,
        ssl: false
}