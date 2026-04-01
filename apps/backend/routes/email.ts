import crypto from "node:crypto";

import { Hono } from "hono";
import { sql } from "kysely";
import { Resend } from "resend";

import { getFrontendUrl } from "../config.js";
import { db } from "../db/client.js";
import { hashPassword } from "../lib/password.js";

const { RESEND_API_KEY, INSTITUTIONAL_EMAIL, NODE_ENV } = process.env;

const router = new Hono();
const resend = new Resend(RESEND_API_KEY);

function getEmailConfig() {
  const isDev = NODE_ENV === "development" || !NODE_ENV;

  return {
    from: isDev ? "Development <onboarding@resend.dev>" : "GMCAN <gmcan@unmsm.edu.pe>",
    to: isDev ? "delivered@resend.dev" : INSTITUTIONAL_EMAIL,
  };
}

function validateFields(data: Record<string, string>, requiredFields: string[]) {
  const missing = requiredFields.filter((field) => !data[field] || !data[field].trim());

  return {
    isValid: missing.length === 0,
    missing,
  };
}

router.post("/send-email", async (c) => {
  try {
    const data = await c.req.json();
    const { from, to } = getEmailConfig();

    const validation = validateFields(data, ["nombre", "razon", "correo", "telefono"]);
    if (!validation.isValid) {
      return c.json(
        {
          success: false,
          message: "Campos requeridos faltantes",
          missingFields: validation.missing,
        },
        400,
      );
    }

    const result = await resend.emails.send({
      from,
      to: [to!],
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

    return c.json({
      success: true,
      message: "La solicitud fue enviada. Te contactaremos pronto.",
      emailId: result.data?.id,
    });
  } catch (error: any) {
    console.error("Error sending membership application:", error);

    return c.json(
      {
        success: false,
        message: "Error interno del servidor. Por favor intenta nuevamente.",
        error: NODE_ENV === "development" ? error.message : undefined,
      },
      500,
    );
  }
});

router.post("/send-password-reset", async (c) => {
  try {
    const { correo: email } = await c.req.json();

    if (!email?.trim()) {
      return c.json(
        {
          success: false,
          message: "El correo electrónico es requerido",
        },
        400,
      );
    }

    const user = await db
      .selectFrom("usuario")
      .select(["DNI", "nombre", "correo"])
      .where("correo", "=", email)
      .executeTakeFirst();

    if (!user) {
      // We always return success to avoid revealing if the email exists
      return c.json({
        success: true,
        message: "Si el correo existe, recibirás un enlace de recuperación en los próximos minutos",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Store token in database with expiration
    await db
      .updateTable("usuario")
      .set({ reset_token: resetToken, reset_expires: expiresAt, restablecer: 1 })
      .where("DNI", "=", user.DNI)
      .execute();

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

    return c.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace de recuperación en los próximos minutos",
      emailId: result.data?.id,
    });
  } catch (error: any) {
    console.error("Error in password reset:", error);

    return c.json(
      {
        success: false,
        message: "Error interno del servidor. Por favor intenta nuevamente.",
        error: NODE_ENV === "development" ? error.message : undefined,
      },
      500,
    );
  }
});

router.post("/verify-reset-token", async (c) => {
  try {
    const { token } = await c.req.json();

    if (!token?.trim()) {
      return c.json(
        {
          success: false,
          message: "Token requerido",
        },
        400,
      );
    }

    // Find user with valid token — MySQL NOW() replaced with SQLite datetime('now')
    const user = await db
      .selectFrom("usuario")
      .select(["DNI", "nombre", "correo"])
      .where("reset_token", "=", token)
      .where("reset_expires", ">", sql<string>`datetime('now')`)
      .where("restablecer", "=", 1)
      .executeTakeFirst();

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Token inválido o expirado",
        },
        400,
      );
    }

    return c.json({
      success: true,
      message: "Token válido",
      user: {
        nombre: user.nombre,
        correo: user.correo,
      },
    });
  } catch (error: any) {
    console.error("Error verifying reset token:", error);

    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

router.post("/reset-password", async (c) => {
  try {
    const { token, newPassword } = await c.req.json();

    if (!token?.trim() || !newPassword?.trim()) {
      return c.json(
        {
          success: false,
          message: "Token y nueva contraseña son requeridos",
        },
        400,
      );
    }

    if (newPassword.length < 8) {
      return c.json(
        {
          success: false,
          message: "La contraseña debe tener al menos 8 caracteres",
        },
        400,
      );
    }

    // Verify token is still valid — MySQL NOW() replaced with SQLite datetime('now')
    const user = await db
      .selectFrom("usuario")
      .select("DNI")
      .where("reset_token", "=", token)
      .where("reset_expires", ">", sql<string>`datetime('now')`)
      .where("restablecer", "=", 1)
      .executeTakeFirst();

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Token inválido o expirado",
        },
        400,
      );
    }

    // Hash new password and clear reset token
    const hashedPassword = hashPassword(newPassword);

    await db
      .updateTable("usuario")
      .set({ password: hashedPassword, reset_token: null, reset_expires: null, restablecer: 0 })
      .where("DNI", "=", user.DNI)
      .execute();

    console.log("Password reset completed for user DNI:", user.DNI);

    return c.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);

    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default router;
