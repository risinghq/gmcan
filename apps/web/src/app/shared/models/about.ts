export interface AboutSectionContent {
  introParagraphs: string[];
  items: string[];
}

export interface HomeServicesTeaserContent {
  paragraphs: string[];
}

export interface LocalizedAboutSectionContent {
  es: AboutSectionContent;
  en: AboutSectionContent;
}

export interface LocalizedHomeServicesTeaserContent {
  es: HomeServicesTeaserContent;
  en: HomeServicesTeaserContent;
}

export interface About {
  id: number;
  description: string;
  objectivesContent: AboutSectionContent;
  servicesContent: AboutSectionContent;
  homeServicesTeaserContent: HomeServicesTeaserContent;
  asset: string | null;
  groupId: number;
  createdAt: string | null;
  updatedAt: string | null;
}
