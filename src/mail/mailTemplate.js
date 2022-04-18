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
                    color: '#319ECD',
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


export const welcomeEmail = (params) => {

    var email = {
        body: {
            name: params.name,
            intro: 'Welcome to DoseTap! We\'re very excited to have you on board.',
            action: {
                instructions: 'Click the button below to go to website',
                button: {
                    color: '#319ECD',
                    text: 'Go to website',
                    link: 'https://www.dosetap.com'
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    var emailBody = mailGenerator.generate(email);

    return emailBody;

}


export const welcomeAdminEmail = (params) => {

    var email = {
        body: {
            name: params.name,
            intro: 'Welcome to DoseTap! We\'re very excited to have you on board. Please find your login credentials below.',
            table: {
                data: [
                    {
                        email: params.email,
                        password: params.password
                    }
                ]
            },
            action: {
                instructions: 'Click the button below to go to the dashboard.',
                button: {
                    color: '#319ECD',
                    text: 'Go to dashboard',
                    link: 'https://portal.dosetap.com'
                }
            },
            outro: 'You can change your password after logging in.<br>Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    var emailBody = mailGenerator.generate(email);

    return emailBody;

}

export const welcomeAdminWithCodeEmail = (params) => {

    var email = {
        body: {
            name: params.name,
            intro: 'Welcome to DoseTap! We\'re very excited to have you on board. Please find your login credentials below.',
            table: [{
                data: [
                    {
                        email: params.email,
                        password: params.password
                    }
                ]
            }, {

                title: 'Find your referral code. ( Code is case sensitive )',
                data: [
                    {
                        Code: params.code,

                    },
                ]
            }],
            action: {
                instructions: 'Click the button below to go to the dashboard.',
                button: {
                    color: '#319ECD',
                    text: 'Go to dashboard',
                    link: 'https://portal.dosetap.com'
                }
            },
            outro: 'You can change your password after logging in.<br>Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    var emailBody = mailGenerator.generate(email);

    return emailBody;

}
