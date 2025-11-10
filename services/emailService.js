// services/emailService.js - Versión con Nodemailer
const nodemailer = require('nodemailer');

// Verificar que las variables estén configuradas
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: Faltan variables SMTP en .env');
    console.error('Necesitas: SMTP_HOST, SMTP_USER, SMTP_PASS');
}

// Crear transporter de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true para puerto 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // Permite certificados auto-firmados
    }
});

// Verificar conexión al iniciar
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Error al conectar con el servidor SMTP:', error.message);
        console.error('Verifica tus credenciales SMTP en el archivo .env');
    } else {
        console.log('✅ Servidor SMTP listo para enviar emails');
        console.log(`📧 Emails se enviarán desde: ${process.env.SMTP_USER}`);
    }
});

/**
 * Envía email de recuperación de contraseña
 * @param {string} email - Email del destinatario
 * @param {string} resetLink - Link de recuperación
 * @param {string} userName - Nombre del usuario
 */
const sendPasswordResetEmail = async (email, resetLink, userName = 'Usuario') => {
    try {
        console.log('📧 Preparando email de recuperación...');
        console.log('   Destinatario:', email);
        console.log('   Usuario:', userName);
        console.log('   Link:', resetLink.substring(0, 50) + '...');

        const mailOptions = {
            from: {
                name: process.env.APP_NAME || 'Tu Aplicación',
                address: process.env.MAIL_FROM || process.env.SMTP_USER
            },
            to: email,
            subject: 'Recuperación de Contraseña',
            text: `Hola ${userName},

Has solicitado restablecer tu contraseña.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios.

Saludos,
El equipo de ${process.env.APP_NAME || 'Tu Aplicación'}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recuperación de Contraseña</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table role="presentation" style="max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #2c1810 0%, #4a2c1f 100%); text-align: center; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                                🔐 Recuperación de Contraseña
                                            </h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                                Hola <strong style="color: #2c1810;">${userName}</strong>,
                                            </p>
                                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                                            </p>
                                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                                                Haz clic en el siguiente botón para crear una nueva contraseña:
                                            </p>
                                            
                                            <!-- Button -->
                                            <table role="presentation" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="border-radius: 8px; background-color: #2c1810;">
                                                        <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                                            Restablecer Contraseña
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="margin: 30px 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                                                Si el botón no funciona, copia y pega este enlace en tu navegador:
                                            </p>
                                            <p style="margin: 0 0 30px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; font-size: 13px; color: #333333; word-break: break-all; border: 1px solid #e9ecef;">
                                                ${resetLink}
                                            </p>
                                            
                                            <!-- Warning Box -->
                                            <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                                                    <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por seguridad.
                                                </p>
                                            </div>
                                            
                                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #666666;">
                                                Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura. Tu contraseña actual no será modificada.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                                            <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                                                Saludos cordiales,
                                            </p>
                                            <p style="margin: 0 0 20px; font-size: 14px; color: #2c1810; font-weight: bold;">
                                                El equipo de ${process.env.APP_NAME || 'Tu Aplicación'}
                                            </p>
                                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                                Este es un mensaje automático, por favor no respondas a este email.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        console.log('📤 Enviando email...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email enviado exitosamente!');
        console.log('📨 Message ID:', info.messageId);
        console.log('📬 Respuesta:', info.response);
        
        return { 
            success: true, 
            messageId: info.messageId 
        };

    } catch (error) {
        console.error('❌ ERROR AL ENVIAR EMAIL:');
        console.error('   Mensaje:', error.message);
        console.error('   Código:', error.code);
        
        if (error.code === 'EAUTH') {
            console.error('   💡 Solución: Verifica tu SMTP_USER y SMTP_PASS en .env');
            console.error('   💡 Para Gmail, necesitas una "Contraseña de aplicación"');
        }
        
        throw new Error(`Error al enviar email: ${error.message}`);
    }
};

/**
 * Email de bienvenida (opcional)
 */
const sendWelcomeEmail = async (email, userName) => {
    try {
        console.log('📧 Enviando email de bienvenida a:', email);

        const mailOptions = {
            from: {
                name: process.env.APP_NAME || 'Tu Aplicación',
                address: process.env.MAIL_FROM || process.env.SMTP_USER
            },
            to: email,
            subject: '¡Bienvenido a nuestra plataforma!',
            text: `Hola ${userName},\n\n¡Bienvenido! Tu cuenta ha sido creada exitosamente.\n\nGracias por unirte a nosotros.\n\nSaludos,\nEl equipo`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Bienvenido</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="color: #2c1810; text-align: center; margin-bottom: 30px;">¡Bienvenido ${userName}! 🎉</h1>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 20px;">
                            Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte con nosotros.
                        </p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 30px;">
                            Ahora puedes acceder a todas las funcionalidades de nuestra plataforma.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                               style="background-color: #2c1810; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                Iniciar Sesión
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 30px;">
                            Gracias por confiar en nosotros
                        </p>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de bienvenida enviado:', info.messageId);
        return { success: true };

    } catch (error) {
        console.error('❌ Error al enviar email de bienvenida:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Email de confirmación de cambio de contraseña
 */
const sendPasswordChangedEmail = async (email, userName) => {
    try {
        console.log('📧 Enviando confirmación de cambio de contraseña a:', email);

        const mailOptions = {
            from: {
                name: process.env.APP_NAME || 'Tu Aplicación',
                address: process.env.MAIL_FROM || process.env.SMTP_USER
            },
            to: email,
            subject: 'Contraseña actualizada exitosamente',
            text: `Hola ${userName},\n\nTu contraseña ha sido actualizada exitosamente.\n\nSi no realizaste este cambio, contacta con soporte inmediatamente.\n\nSaludos`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c1810; margin-bottom: 20px;">✅ Contraseña Actualizada</h2>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                            Hola <strong>${userName}</strong>,
                        </p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 20px;">
                            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>⚠️ Importante:</strong> Si no realizaste este cambio, contacta con nuestro soporte inmediatamente.
                            </p>
                        </div>
                        <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 30px;">
                            Saludos,<br>
                            <strong>${process.env.APP_NAME || 'Tu Aplicación'}</strong>
                        </p>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de confirmación enviado:', info.messageId);
        return { success: true };

    } catch (error) {
        console.error('❌ Error al enviar email de confirmación:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordChangedEmail
};