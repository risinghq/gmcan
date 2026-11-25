import type { Capability } from "@app/shared/models/capabilities";
import { describe, expect, it } from "vitest";

import { DASHBOARD_NAV, visibleNav } from "./nav";

const granted =
  (...capabilities: Capability[]) =>
  (capability: Capability) =>
    capabilities.includes(capability);

const paths = (capabilities: Capability[]) =>
  visibleNav(DASHBOARD_NAV, granted(...capabilities)).flatMap((section) => section.links.map((link) => link.path));

const titles = (capabilities: Capability[]) =>
  visibleNav(DASHBOARD_NAV, granted(...capabilities)).map((section) => section.title);

describe("visibleNav", () => {
  it("shows a member without capabilities only the dashboard and their own profile", () => {
    expect(paths([])).toEqual([
      "/dashboard",
      "/dashboard/perfil",
      "/dashboard/my-articles",
      "/dashboard/my-thesis",
      "/dashboard/my-abstracts",
    ]);
  });

  it("drops a section whose links the member may not open", () => {
    expect(titles([])).toEqual([undefined, "Mi perfil"]);
  });

  it("adds a section when the member gains its capability", () => {
    expect(titles(["projects.write"])).toEqual([undefined, "Proyectos", "Mi perfil"]);
    expect(paths(["projects.write"])).toContain("/dashboard/proyectos-concluidos");
  });

  it("shows every link to a member with every capability", () => {
    const all = DASHBOARD_NAV.flatMap((section) => section.links.map((link) => link.path));
    expect(paths(["news.write", "members.read", "publications.write", "projects.write", "content.write"])).toEqual(all);
  });
});
