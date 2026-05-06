import {
  Currency,
  Event,
  FundingSource,
  Journal,
  NewsKind,
  NewsStatus,
  ProjectStatus,
  PublicationKind,
  ResearchLine,
  ThesisKind,
  University,
} from "../../lib/enums.js";
import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];

export async function seedNews() {
  await db
    .insertInto("news")
    .values([
      {
        id: 53,
        statusCode: NewsStatus.PUBLISHED,
        publishedAt: "2021-01-21",
        priority: null,
        authorId: 1,
        newsKindCode: NewsKind.GENERAL,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 55,
        statusCode: NewsStatus.PUBLISHED,
        publishedAt: "2021-01-22",
        priority: null,
        authorId: 1,
        newsKindCode: NewsKind.GENERAL,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 56,
        statusCode: NewsStatus.PUBLISHED,
        publishedAt: "2021-01-23",
        priority: null,
        authorId: 1,
        newsKindCode: NewsKind.EVENT,
        createdAt: today,
        updatedAt: today,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("news_translation")
    .values([
      {
        newsId: 53,
        locale: "es",
        title: "¿Cómo gestionar tu tiempo como estudiante de ciencias e ingeniería?",
        summary: "Consejos prácticos para estudiantes universitarios sobre gestión del tiempo.",
        body: "<p>Consejos prácticos para estudiantes universitarios sobre gestión del tiempo.</p>",
      },
      {
        newsId: 53,
        locale: "en",
        title: "Managing your Time as a Science & Engineering Student",
        summary: "Practical advice for university students about time management.",
        body: "<p>Practical advice for university students about time management.</p>",
      },
      {
        newsId: 55,
        locale: "es",
        title: "¿Cómo puede ayudar el grafeno en la lucha contra el Coronavirus?",
        summary: "Una revisión del potencial del grafeno en sensores y dispositivos médicos.",
        body: "<p>Una revisión del potencial del grafeno en sensores y dispositivos médicos.</p>",
      },
      {
        newsId: 55,
        locale: "en",
        title: "How can graphene assist in the war on Coronavirus?",
        summary: "A review of graphene potential in sensors and medical devices.",
        body: "<p>A review of graphene potential in sensors and medical devices.</p>",
      },
      {
        newsId: 56,
        locale: "es",
        title: "Diseño y simulación de nanomateriales: Fundamento teórico y aplicaciones",
        summary: "Workshop sobre diseño y simulación de nanomateriales.",
        body: "<p>Workshop sobre diseño y simulación de nanomateriales.</p>",
      },
      {
        newsId: 56,
        locale: "en",
        title: "Nanomaterials Design and Simulation: From overview to applications",
        summary: "Workshop about nanomaterials design and simulation.",
        body: "<p>Workshop about nanomaterials design and simulation.</p>",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedJournals() {
  await db
    .insertInto("journal")
    .values([
      { id: Journal.APPLIED_SURFACE_SCIENCE, name: "Applied Surface Science" },
      { id: Journal.RIF, name: "Revista de Investigación de Física (RIF)" },
      { id: Journal.PCCP, name: "Physical Chemistry Chemical Physics" },
      { id: Journal.PHYSICA_B, name: "Physica B: Condensed Matter" },
      { id: Journal.JPA, name: "Journal of Physics A: Mathematical and Theoretical" },
      { id: Journal.PHYSICS_LETTERS_A, name: "Physics Letters A" },
      { id: Journal.MOMENTO, name: "Momento" },
      { id: Journal.RMF, name: "Revista Mexicana de Física" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedUniversities() {
  await db
    .insertInto("university")
    .values([{ id: University.UNMSM }, { id: University.UDEP }])
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("university_translation")
    .values([
      { universityId: University.UNMSM, locale: "es", name: "Universidad Nacional Mayor San Marcos" },
      { universityId: University.UNMSM, locale: "en", name: "National University of San Marcos" },
      { universityId: University.UDEP, locale: "es", name: "Universidad de Piura" },
      { universityId: University.UDEP, locale: "en", name: "University of Piura" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedEvents() {
  await db
    .insertInto("event")
    .values({ id: Event.SIMPOSIO_FISICA })
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("event_translation")
    .values([
      {
        eventId: Event.SIMPOSIO_FISICA,
        locale: "es",
        name: "Simposio Peruano de Física",
        city: "Trujillo",
        country: "Perú",
      },
      {
        eventId: Event.SIMPOSIO_FISICA,
        locale: "en",
        name: "Peruvian Physics Symposium",
        city: "Trujillo",
        country: "Peru",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedProject() {
  await db
    .insertInto("project")
    .values({
      id: 1,
      code: "B20130811",
      fundedAmountMinor: 6200000,
      statusCode: ProjectStatus.ACTIVE,
      startDate: "2020-04-10",
      endDate: null,
      researchLineId: ResearchLine.HEXAGONAL,
      currencyCode: Currency.PEN,
      fundingSourceCode: FundingSource.VRIP,
      createdAt: today,
      updatedAt: today,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("project_translation")
    .values([
      {
        projectId: 1,
        locale: "es",
        title: "Influencia de la concentración de carbono sobre propiedades mecánicas y térmicas en h-BNC",
        description: "Proyecto de investigación sobre sistemas híbridos y hexagonales de Boro-Nitrógeno-Carbono.",
      },
      {
        projectId: 1,
        locale: "en",
        title: "Influence of carbon concentration on mechanical and thermal properties in h-BNC",
        description: "Research project on hybrid and hexagonal Boron-Nitrogen-Carbon systems.",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("project_member")
    .values([
      { projectId: 1, memberId: 9, createdAt: today, updatedAt: today },
      { projectId: 1, memberId: 8, createdAt: today, updatedAt: today },
      { projectId: 1, memberId: 4, createdAt: today, updatedAt: today },
      { projectId: 1, memberId: 2, createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedPublications() {
  await db
    .insertInto("publication")
    .values([
      {
        id: 1,
        kindCode: PublicationKind.THESIS,
        doi: null,
        publishedAt: "2019-11-18",
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 2,
        kindCode: PublicationKind.JOURNAL_ARTICLE,
        doi: null,
        publishedAt: "2020-06-18",
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 3,
        kindCode: PublicationKind.JOURNAL_ARTICLE,
        doi: null,
        publishedAt: "2020-08-01",
        createdAt: today,
        updatedAt: today,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("thesis")
    .values({ publicationId: 1, universityId: University.UNMSM, thesisKindCode: ThesisKind.MASTERS })
    .onConflict((oc) => oc.doNothing())
    .execute();
  await db
    .insertInto("journal_article")
    .values([
      { publicationId: 2, journalId: Journal.APPLIED_SURFACE_SCIENCE, issue: null },
      { publicationId: 3, journalId: null, issue: null },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("publication_translation")
    .values([
      {
        publicationId: 1,
        locale: "es",
        title: "Simulación de curvas M(H) mediante Metropolis-Hastings",
        abstract: "Tesis sobre simulación Monte Carlo de curvas de magnetización.",
      },
      {
        publicationId: 1,
        locale: "en",
        title: "M(H) curve simulation using Metropolis-Hastings",
        abstract: "Thesis about Monte Carlo simulation of magnetization curves.",
      },
      {
        publicationId: 2,
        locale: "es",
        title: "Formaldehyde trapping by radical initiated reaction on hydrogenated boron nitride",
        abstract: "Artículo sobre captura de formaldehído en nitruro de boro hidrogenado.",
      },
      {
        publicationId: 2,
        locale: "en",
        title: "Formaldehyde trapping by radical initiated reaction on hydrogenated boron nitride",
        abstract: "Article about formaldehyde trapping on hydrogenated boron nitride.",
      },
      {
        publicationId: 3,
        locale: "es",
        title: "Doping engineering of thermoelectric transport in BNC heteronanotubes",
        abstract: "Artículo sobre transporte termoeléctrico en heteronanotubos BNC.",
      },
      {
        publicationId: 3,
        locale: "en",
        title: "Doping engineering of thermoelectric transport in BNC heteronanotubes",
        abstract: "Article about thermoelectric transport in BNC heteronanotubes.",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("publication_author")
    .values([
      { publicationId: 1, authorOrder: 1, memberId: 16, externalName: null },
      { publicationId: 1, authorOrder: 2, memberId: 14, externalName: null },
      { publicationId: 1, authorOrder: 3, memberId: null, externalName: "H. Tarazona" },
      { publicationId: 2, authorOrder: 1, memberId: 4, externalName: null },
      { publicationId: 2, authorOrder: 2, memberId: 14, externalName: null },
      { publicationId: 2, authorOrder: 3, memberId: 2, externalName: null },
      { publicationId: 2, authorOrder: 4, memberId: null, externalName: "Leonardo Medrano Sandonas" },
      { publicationId: 3, authorOrder: 1, memberId: 8, externalName: null },
      { publicationId: 3, authorOrder: 2, memberId: null, externalName: "Rafael Gutierrez" },
      { publicationId: 3, authorOrder: 3, memberId: null, externalName: "C.V. Landauro" },
      { publicationId: 3, authorOrder: 4, memberId: 14, externalName: null },
      { publicationId: 3, authorOrder: 5, memberId: null, externalName: "Gianaurelio Cuniberti" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}
