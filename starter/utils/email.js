const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Criar um transportador

    const transporter = nodemailer.createTransport({
       // service: 'Gmail',
       host: process.env.EMAIL_HOST,
       port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // Ativar configurações do gmail de segurança
    });
    //2)Definir as opções de email

    const mailOptions = {
        from: 'João Otávio Segantini <segantini@joao.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:

    };
    //3)Enviar o email
   await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;