const { Resend } = require("resend");
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { promisify } = require("node:util");

const mysqlConnection = require("../connection");
const { getFrontendUrl } = require("../config");

const { RESEND_API_KEY, INSTITUTIONAL_EMAIL, NODE_ENV } = process.env;

const router = express.Router();
const resend = new Resend(RESEND_API_KEY);
const queryDb = promisify(mysqlConnection.query).bind(mysqlConnection);

function getEmailConfig() {
  const isDev = NODE_ENV === "development" || !NODE_ENV;

  return {
    from: isDev
      ? "Development <onboarding@resend.dev>"
      : "GMCAN <gmcan@unmsm.edu.pe>",
    to: isDev ? "delivered@resend.dev" : INSTITUTIONAL_EMAIL,
  };
}

function validateFields(data, requiredFields) {
  const missing = requiredFields.filter(
    (field) => !data[field] || !data[field].trim(),
  );

  return {
    isValid: missing.length === 0,
    missing,
  };
}

router.post("/send-email", async (req, res) => {
  try {
    const data = req.body;
    const { from, to } = getEmailConfig();

    const validation = validateFields(data, [
      "nombre",
      "razon",
      "correo",
      "telefono",
    ]);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos faltantes",
        missingFields: validation.missing,
      });
    }

    const result = await resend.emails.send({
      from,
      to: [to],
      subject: `Solicitud de Ingreso al GMCAN - ${data.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Solicitud de ingreso al GMCAN</h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
            <p><strong>Nombre:</strong> ${data.nombre}</p>
            
            <p><strong>¿A qué te dedicas? ¿Qué te motiva a querer ser parte del GMCAN?</strong></p>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">
              ${data.razon}
            </div>
            
            <p><strong>Correo:</strong> <a href="mailto:${data.correo}">${data.correo}</a></p>
            <p><strong>Teléfono:</strong> ${data.telefono}</p>
          </div>
        </div>
      `,
    });

    console.log("Membership application sent:", result.data?.id);

    res.json({
      success: true,
      message: "La solicitud fue enviada. Te contactaremos pronto.",
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error("Error sending membership application:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor. Por favor intenta nuevamente.",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/send-password-reset", async (req, res) => {
  try {
    const { correo: email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
      });
    }

    const users = await queryDb(
      "SELECT DNI, nombre, correo FROM usuario WHERE correo = ?",
      [email],
    );

    if (!users.length) {
      // We always return success to avoid revealing if the email exists
      return res.json({
        success: true,
        message:
          "Si el correo existe, recibirás un enlace de recuperación en los próximos minutos",
      });
    }

    const user = users[0];

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database with expiration
    await queryDb(
      "UPDATE usuario SET reset_token = ?, reset_expires = ?, restablecer = 1 WHERE DNI = ?",
      [resetToken, expiresAt, user.DNI],
    );

    const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;
    const { from } = getEmailConfig();

    const result = await resend.emails.send({
      from,
      to: [email],
      subject: "Recuperación de contraseña - GMCAN",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          
          <p>Hola <strong>${user.nombre}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>

          <p><strong>Importante:</strong></p>
          <ul>
            <li>Este enlace expirará en 24 horas por seguridad</li>
            <li>Si no solicitaste este cambio, puedes ignorar este mensaje</li>
            <li>Tu contraseña actual permanece segura hasta que completes el proceso</li>
          </ul>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Si tienes problemas con el enlace, copia y pega esta URL en tu navegador:<br>
            <code style="background-color: #f1f1f1; padding: 2px 4px;">${resetUrl}</code>
          </p>
        </div>
      `,
    });

    console.log("Password reset email sent:", result.data?.id);

    res.json({
      success: true,
      message:
        "Si el correo existe, recibirás un enlace de recuperación en los próximos minutos",
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error("Error in password reset:", error);

    if (error.code?.startsWith("ER_")) {
      console.error("Database error:", error.sqlMessage);
      return res.status(503).json({
        success: false,
        message: "Error de base de datos. Por favor intenta más tarde.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor. Por favor intenta nuevamente.",
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Token requerido",
      });
    }

    // Find user with valid token
    const users = await queryDb(
      "SELECT DNI, nombre, correo FROM usuario WHERE reset_token = ? AND reset_expires > NOW() AND restablecer = 1",
      [token],
    );

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    res.json({
      success: true,
      message: "Token válido",
      user: {
        nombre: users[0].nombre,
        correo: users[0].correo,
      },
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token?.trim() || !newPassword?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Token y nueva contraseña son requeridos",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    // Verify token is still valid
    const users = await queryDb(
      "SELECT DNI FROM usuario WHERE reset_token = ? AND reset_expires > NOW() AND restablecer = 1",
      [token],
    );

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    const userDNI = users[0].DNI;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await queryDb(
      "UPDATE usuario SET password = ?, reset_token = NULL, reset_expires = NULL, restablecer = 0 WHERE DNI = ?",
      [hashedPassword, userDNI],
    );

    console.log("Password reset completed for user DNI:", userDNI);

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error resetting password:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
