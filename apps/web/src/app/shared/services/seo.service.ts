import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import type { Group } from "@app/shared/models/group";
import { LANGUAGE_PARAM, type SiteLanguage } from "@app/shared/site-language";

import { GLOBAL } from "./global";
import { SessionService } from "./session.service";

type StructuredData = Record<string, unknown>;

const OG_LOCALES: Record<SiteLanguage, string> = { es: "es_PE", en: "en_US" };

/** Spanish is the default language and owns the bare URL; English adds `?lang=en`. */
export function languageUrl(path: string, language: SiteLanguage): string {
  const url = new URL(path, GLOBAL.appUrl);
  url.search = "";
  url.hash = "";
  if (language === "en") url.searchParams.set(LANGUAGE_PARAM, "en");
  return url.toString();
}

/** Owns the head tags that describe the current page to crawlers and link previews. */
@Injectable({ providedIn: "root" })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly session = inject(SessionService);
  private siteDescription = "";
  private pageDescribed = false;

  private language(): SiteLanguage {
    return this.session.language().locale === "en" ? "en" : "es";
  }

  setPageTitle(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ property: "og:title", content: title });
    this.meta.updateTag({ name: "twitter:title", content: title });
  }

  setDescription(description: string): void {
    this.pageDescribed = true;
    this.writeDescription(description);
  }

  private writeDescription(description: string): void {
    const content = description.replace(/\s+/g, " ").trim().slice(0, 300);
    if (!content) return;
    this.meta.updateTag({ name: "description", content });
    this.meta.updateTag({ property: "og:description", content });
    this.meta.updateTag({ name: "twitter:description", content });
  }

  setImage(url: string | null | undefined): void {
    const content = url || GLOBAL.app("img/gmcan.jpg");
    this.meta.updateTag({ property: "og:image", content });
    this.meta.updateTag({ name: "twitter:image", content });
  }

  setStructuredData(data: StructuredData | null): void {
    this.writeJsonLd("page-ld", data);
  }

  /** The group's own details: the site-wide description and the Organization record. */
  setGroup(group: Group): void {
    this.siteDescription = group.summary ?? "";
    if (!this.pageDescribed) this.writeDescription(this.siteDescription);
    this.writeJsonLd("site-ld", {
      "@context": "https://schema.org",
      "@type": "ResearchOrganization",
      name: group.fullName,
      alternateName: group.name,
      url: GLOBAL.appUrl,
      logo: GLOBAL.app("img/gmcan.jpg"),
      email: group.email,
      telephone: group.phone || undefined,
      address: group.address,
      parentOrganization: { "@type": "CollegeOrUniversity", name: "Universidad Nacional Mayor de San Marcos" },
    });
  }

  /** Resets the page-level tags for a new route; the page then overrides what it knows better. */
  startPage(path: string): void {
    const language = this.language();
    const canonical = languageUrl(path, language);
    this.document.documentElement.lang = language;
    this.setLink("canonical", canonical);
    this.setLink("alternate", languageUrl(path, "es"), "es");
    this.setLink("alternate", languageUrl(path, "en"), "en");
    this.setLink("alternate", languageUrl(path, "es"), "x-default");
    this.meta.updateTag({ property: "og:url", content: canonical });
    this.meta.updateTag({ property: "og:locale", content: OG_LOCALES[language] });
    this.meta.updateTag({ property: "og:type", content: "website" });
    this.meta.updateTag({ property: "og:site_name", content: "GMCAN" });
    this.meta.updateTag({ name: "twitter:card", content: "summary_large_image" });
    this.pageDescribed = false;
    this.writeDescription(this.siteDescription);
    this.setImage(null);
    this.setStructuredData(null);
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let link = this.document.head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement("link");
      link.rel = rel;
      if (hreflang) link.hreflang = hreflang;
      this.document.head.appendChild(link);
    }
    link.href = href;
  }

  private writeJsonLd(id: string, data: StructuredData | null): void {
    let script = this.document.getElementById(id);
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.document.createElement("script");
      script.id = id;
      script.setAttribute("type", "application/ld+json");
      this.document.head.appendChild(script);
    }
    // Escaping `<` keeps content such as `</script>` from closing the element.
    script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
  }
}
