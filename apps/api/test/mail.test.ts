import { describe, expect, test } from "bun:test";

import { sendResend } from "../lib/mail.js";

const config = { apiKey: "re_test_key", from: "onboarding@resend.dev" };
const mail = { to: ["owner@example.test"], subject: "Hola", html: "<p>Hola</p>" };

function recordingFetch(response: Response) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const send = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response;
  }) as unknown as typeof fetch;
  return { calls, send };
}

describe("sendResend", () => {
  test("posts the message to Resend with the key and the sender", async () => {
    const { calls, send } = recordingFetch(Response.json({ id: "1" }));
    await sendResend(config, mail, send);

    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call?.url).toBe("https://api.resend.com/emails");
    expect(call?.init.method).toBe("POST");
    expect(new Headers(call?.init.headers).get("Authorization")).toBe("Bearer re_test_key");
    expect(JSON.parse(String(call?.init.body))).toEqual({ from: "onboarding@resend.dev", ...mail });
  });

  test("a rejected message becomes a 502 that does not echo the key", async () => {
    const { send } = recordingFetch(new Response('{"message":"not allowed"}', { status: 403 }));
    const failure = await sendResend(config, mail, send).catch((error: unknown) => error as Error & { status: number });

    expect(failure).toMatchObject({ message: "Email could not be sent", status: 502 });
    expect(String(failure)).not.toContain("re_test_key");
  });
});
