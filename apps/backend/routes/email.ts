import crypto from "node:crypto";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sql } from "kysely";
import { Resend } from "resend";
import { z } from "zod";

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
    to: isDev ? "delivered@resend.dev" : INSTITUTIONAL_EMAIL!,
  };
}

router.post(
  "/send-email",
  zValidator(
    "json",
    z.object({
      nombre: z.string().min(1),
      razon: z.string().min(1),
      correo: z.string().email(),
      telefono: z.string().min(1),
    }),
  ),
  async (c) => {
    const { nombre, razon, correo, telefono } = c.req.valid("json");
    const { from, to } = getEmailConfig();

    const result = await resend.emails.send({
      from,
      to: [to],
      subject: `Solicitud de Ingreso al GMCAN - ${nombre}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Solicitud de ingreso al GMCAN</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>¿A qué te dedicas? ¿Qué te motiva a querer ser parte del GMCAN?</strong></p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">${razon}</div>
          <p><strong>Correo:</strong> <a href="mailto:${correo}">${correo}</a></p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
        </div>
      </div>
    `,
    });

    return c.json({ success: true, emailId: result.data?.id });
  },
);

router.post("/send-password-reset", zValidator("json", z.object({ correo: z.string().email() })), async (c) => {
  const { correo: email } = c.req.valid("json");

  const user = await db
    .selectFrom("usuario")
    .select(["DNI", "nombre", "correo"])
    .where("correo", "=", email)
    .executeTakeFirst();

  // Always return success to avoid revealing if the email exists
  if (!user)
    return c.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace de recuperación en los próximos minutos",
    });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await db
    .updateTable("usuario")
    .set({ reset_token: resetToken, reset_expires: expiresAt, restablecer: 1 })
    .where("DNI", "=", user.DNI)
    .execute();

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;
  const { from } = getEmailConfig();

  await resend.emails.send({
    from,
    to: [email],
    subject: "Recuperación de contraseña - GMCAN",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Recuperación de contraseña</h2>
        <p>Hola <strong>${user.nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p>Este enlace expirará en 24 horas. Si no solicitaste este cambio, ignora este mensaje.</p>
      </div>
    `,
  });

  return c.json({
    success: true,
    message: "Si el correo existe, recibirás un enlace de recuperación en los próximos minutos",
  });
});

router.post("/verify-reset-token", zValidator("json", z.object({ token: z.string().min(1) })), async (c) => {
  const { token } = c.req.valid("json");

  const user = await db
    .selectFrom("usuario")
    .select(["DNI", "nombre", "correo"])
    .where("reset_token", "=", token)
    .where("reset_expires", ">", sql<string>`datetime('now')`)
    .where("restablecer", "=", 1)
    .executeTakeFirst();

  if (!user) return c.json({ success: false, message: "Token inválido o expirado" }, 400);

  return c.json({ success: true, user: { nombre: user.nombre, correo: user.correo } });
});

router.post(
  "/reset-password",
  zValidator(
    "json",
    z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8),
    }),
  ),
  async (c) => {
    const { token, newPassword } = c.req.valid("json");

    const user = await db
      .selectFrom("usuario")
      .select("DNI")
      .where("reset_token", "=", token)
      .where("reset_expires", ">", sql<string>`datetime('now')`)
      .where("restablecer", "=", 1)
      .executeTakeFirst();

    if (!user) return c.json({ success: false, message: "Token inválido o expirado" }, 400);

    await db
      .updateTable("usuario")
      .set({ password: hashPassword(newPassword), reset_token: null, reset_expires: null, restablecer: 0 })
      .where("DNI", "=", user.DNI)
      .execute();

    return c.json({ success: true, message: "Contraseña actualizada exitosamente" });
  },
);

export default router;
