import { describe, expect, it } from "vitest";

import { publishabilityStatus } from "./utils";

describe("publishabilityStatus", () => {
  it("marks a complete active member public", () => {
    expect(publishabilityStatus({ publishable: true, missing: [] })).toMatchObject({ tone: "ready", label: "Público" });
  });

  it("counts the data a member still needs to go public", () => {
    const status = publishabilityStatus({ publishable: false, missing: ["dni", "email"] });

    expect(status.tone).toBe("draft");
    expect(status.label).toBe("Borrador · 2");
    expect(status.reasons).toEqual(["N° DNI / Pasaporte", "Correo electrónico"]);
  });

  it("hides administrators and former members whatever data they lack", () => {
    const status = publishabilityStatus({ publishable: false, missing: ["dni", "roleCode"] });

    expect(status.tone).toBe("hidden");
    expect(status.label).toBe("Oculto");
    expect(status.reasons).toEqual(["Es una cuenta de administrador"]);
  });
});
