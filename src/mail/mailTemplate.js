const Mailgen = require('mailgen');

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Dosetap',
        link: 'https://dosetap.com/',
        // Optional product logo
        logo: 'https://dosetap-document.s3.ap-south-1.amazonaws.com/dose-logo.png'
    }
});



// Generate an HTML email with the provided contents


export const passwordResetEmail = (params) => {

    var email = {
        body: {
            name: params.name,
            intro: 'You have received this email because a password reset request for your account was received.',
            action: {
                instructions: 'Click the button below to reset your password:',
                button: {
                    color: '#DC4D2F',
                    text: 'Reset your password',
                    link: params.link
                }
            },
            outro: 'If you did not request a password reset, no further action is required on your part.'
        }
    };

    var emailBody = mailGenerator.generate(email);

    return emailBody;

}
