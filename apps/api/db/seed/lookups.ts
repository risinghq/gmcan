import {
  Currency,
  FundingSource,
  Gender,
  MemberType,
  NewsKind,
  Prefix,
  PublicationKind,
  Role,
  ThesisKind,
} from "../../lib/enums.js";
import { SUPPORTED_LOCALES } from "../../lib/locales.js";
import { db } from "../client.js";

export async function seedLocales() {
  await db
    .insertInto("locale")
    .values(SUPPORTED_LOCALES.map((code) => ({ code })))
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedLookups() {
  await db
    .insertInto("gender")
    .values([
      { code: Gender.MALE, name: "Male" },
      { code: Gender.FEMALE, name: "Female" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("prefix")
    .values([
      { code: Prefix.DR, label: "Dr." },
      { code: Prefix.DRA, label: "Dra." },
      { code: Prefix.MG, label: "Mg." },
      { code: Prefix.LIC, label: "Lic." },
      { code: Prefix.BACH, label: "Bach." },
      { code: Prefix.ING, label: "Ing." },
      { code: Prefix.NONE, label: "-" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("role")
    .values([
      { code: Role.ADMINISTRATOR, name: "Administrator" },
      { code: Role.RESEARCHER, name: "Researcher" },
      { code: Role.VISITOR, name: "Visitor" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("member_type")
    .values(Object.values(MemberType).map((code) => ({ code })))
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("member_type_translation")
    .values([
      { memberTypeCode: MemberType.RESEARCHER, locale: "es", name: "Investigadores", nameSingular: "Investigador" },
      { memberTypeCode: MemberType.RESEARCHER, locale: "en", name: "Researchers", nameSingular: "Researcher" },
      {
        memberTypeCode: MemberType.PHD_STUDENT,
        locale: "es",
        name: "Estudiantes de Doctorado",
        nameSingular: "Estudiante de Doctorado",
      },
      { memberTypeCode: MemberType.PHD_STUDENT, locale: "en", name: "PhD Students", nameSingular: "PhD Student" },
      {
        memberTypeCode: MemberType.MASTER_STUDENT,
        locale: "es",
        name: "Estudiantes de Maestría",
        nameSingular: "Estudiante de Maestría",
      },
      {
        memberTypeCode: MemberType.MASTER_STUDENT,
        locale: "en",
        name: "Master Students",
        nameSingular: "Master Student",
      },
      {
        memberTypeCode: MemberType.UNDERGRADUATE_STUDENT,
        locale: "es",
        name: "Estudiantes de Pregrado",
        nameSingular: "Estudiante de Pregrado",
      },
      {
        memberTypeCode: MemberType.UNDERGRADUATE_STUDENT,
        locale: "en",
        name: "Undergraduate Students",
        nameSingular: "Undergraduate Student",
      },
      { memberTypeCode: MemberType.COLLABORATOR, locale: "es", name: "Colaboradores", nameSingular: "Colaborador" },
      { memberTypeCode: MemberType.COLLABORATOR, locale: "en", name: "Collaborators", nameSingular: "Collaborator" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("publication_kind")
    .values(Object.values(PublicationKind).map((code) => ({ code })))
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("publication_kind_translation")
    .values([
      { publicationKindCode: PublicationKind.JOURNAL_ARTICLE, locale: "es", name: "Artículo de revista" },
      { publicationKindCode: PublicationKind.JOURNAL_ARTICLE, locale: "en", name: "Journal Article" },
      { publicationKindCode: PublicationKind.CONFERENCE_PAPER, locale: "es", name: "Artículo de conferencia" },
      { publicationKindCode: PublicationKind.CONFERENCE_PAPER, locale: "en", name: "Conference Paper" },
      { publicationKindCode: PublicationKind.THESIS, locale: "es", name: "Tesis" },
      { publicationKindCode: PublicationKind.THESIS, locale: "en", name: "Thesis" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("thesis_kind")
    .values(Object.values(ThesisKind).map((code) => ({ code })))
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("thesis_kind_translation")
    .values([
      { thesisKindCode: ThesisKind.PHD, locale: "es", name: "Doctorado" },
      { thesisKindCode: ThesisKind.PHD, locale: "en", name: "PhD" },
      { thesisKindCode: ThesisKind.MASTERS, locale: "es", name: "Maestría" },
      { thesisKindCode: ThesisKind.MASTERS, locale: "en", name: "Master's" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("news_kind")
    .values(Object.values(NewsKind).map((code) => ({ code })))
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("news_kind_translation")
    .values([
      { newsKindCode: NewsKind.GENERAL, locale: "es", name: "General" },
      { newsKindCode: NewsKind.GENERAL, locale: "en", name: "General" },
      { newsKindCode: NewsKind.RESEARCH, locale: "es", name: "Investigación" },
      { newsKindCode: NewsKind.RESEARCH, locale: "en", name: "Research" },
      { newsKindCode: NewsKind.EVENT, locale: "es", name: "Evento" },
      { newsKindCode: NewsKind.EVENT, locale: "en", name: "Event" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("currency")
    .values([
      { code: Currency.PEN, symbol: "S/" },
      { code: Currency.USD, symbol: "$" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("funding_source")
    .values([
      { code: FundingSource.VRIP, name: "VRIP" },
      { code: FundingSource.NONE, name: "Sin fuente" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}
