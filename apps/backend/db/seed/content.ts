import { NewsType, PublicationType, Currency, FundingSource, ResearchLine, Event } from "../../lib/enums.js";
import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];

export async function seedNews() {
  await db
    .insertInto("news")
    .values([
      {
        id: 53,
        title: "¿Cómo gestionar tu tiempo como estudiante de ciencias e ingeniería?",
        titleEN: "Managing your Time as a Science & Engineering Student",
        summary:
          '"No tengo tiempo", "Desearía tener más tiempo para presentar este trabajo", "Espero que el profe cambie la fecha de entrega." Estas son frases comunes que hemos escuchado siendo estudiantes de pregrado. Independientemente de la ubicación geográfica, ser estudiante universitario me ha mostrado problemas que los estudiantes de pregrado enfrentan comúnmente referido a su gestión del tiempo.',
        summaryEN:
          "'I don't have enough time', 'I wish I had two more days for doing this', 'I hope the professor gives us an extension.' These are common phrases I heard as an undergraduate student in physics and engineering. Regardless on the location, being a student in both the US and Peru showed me common problems undergrads face regularly.",
        body: '<p>"No tengo tiempo", "Desearía tener más tiempo para presentar este trabajo", "Espero que el profe cambie la fecha de entrega." Estas son frases comunes que hemos escuchado siendo estudiantes de pregrado.</p><p>Independientemente de la ubicación geográfica, ser estudiante universitario me ha mostrado problemas que los estudiantes de pregrado enfrentan comúnmente referido a su gestión del tiempo.</p>',
        bodyEN:
          "<p>'I don't have enough time', 'I wish I had two more days for doing this', 'I hope the professor gives us an extension.' These are common phrases I heard as an undergraduate student in physics and engineering.</p><p>Regardless of location, being a student in both the US and Peru showed me common time-management problems undergrads face regularly.</p>",
        status: 1,
        publishedAt: "2021-01-21",
        updatedAt: null,
        createdAt: null,
        photo: null,
        priority: null,
        authorId: 1,
        newsTypeId: NewsType.GENERAL,
      },
      {
        id: 55,
        title: "¿Cómo puede ayudar el grafeno en la lucha contra el Coronavirus?",
        titleEN: "How can graphene assist in the war on Coronavirus?",
        summary:
          "A medida que los investigadores y las empresas de todo el mundo se dispusieron a luchar contra la pandemia del coronavirus, muchos están revisando el grafeno como un material con potencial para ayudar a ganar esta lucha. Las razones de tal potencial podrían encontrarse en las conocidas propiedades antibacterianas / antivirales del grafeno, sus rasgos beneficiosos para sensores y dispositivos médicos y más.",
        summaryEN:
          "As researchers and companies all over the world set out to battle the Coronavirus pandemic, many are revisiting graphene as a material with potential for helping to win this fight. The reasons for such potential could be found in graphene's known antibacterial/antiviral properties, its beneficial traits for medical sensors and devices and more.",
        body: "<p>A medida que los investigadores y las empresas de todo el mundo se dispusieron a luchar contra la pandemia del coronavirus, muchos están revisando el grafeno como un material con potencial para ayudar a ganar esta lucha.</p><p>Las razones de tal potencial podrían encontrarse en las conocidas propiedades antibacterianas y antivirales del grafeno, así como en sus rasgos beneficiosos para sensores y dispositivos médicos.</p>",
        bodyEN:
          "<p>As researchers and companies around the world set out to battle the Coronavirus pandemic, many are revisiting graphene as a material with potential to help in this fight.</p><p>The reasons include graphene's known antibacterial and antiviral properties, as well as beneficial traits for medical sensors and devices.</p>",
        status: 1,
        publishedAt: "2021-01-22",
        updatedAt: null,
        createdAt: null,
        photo: null,
        priority: null,
        authorId: 1,
        newsTypeId: NewsType.GENERAL,
      },
      {
        id: 56,
        title: "Diseño y simulación de nanomateriales: Fundamento teórico y aplicaciones",
        titleEN: "Nanomaterials Design and Simulation: From overview to applications",
        summary:
          "El Dr. Gustavo Cuba Supanta nos acompañará en la primera sesión de Workshop del Club de Nanotecnología promovido por nuestra universidad y el grupo de Métodos Computacionales Aplicado a Nanomateriales.",
        summaryEN:
          "Dr. Gustavo Cuba Supanta will join us in the first workshop session of the Nanotechnology Club promoted by our university and the GMCAN.",
        body: "<p>El Dr. Gustavo Cuba Supanta nos acompañará en la primera sesión de Workshop del Club de Nanotecnología promovido por nuestra universidad y el GMCAN.</p><p>Durante la sesión se abordarán fundamentos teóricos y aplicaciones del diseño y simulación de nanomateriales.</p>",
        bodyEN:
          "<p>Dr. Gustavo Cuba Supanta will join us in the first workshop session of the Nanotechnology Club promoted by our university and GMCAN.</p><p>The session will cover theoretical foundations and applications of nanomaterials design and simulation.</p>",
        status: 1,
        publishedAt: "2021-01-23",
        updatedAt: null,
        createdAt: null,
        photo: "seed/news/news-56.jpg",
        priority: null,
        authorId: 1,
        newsTypeId: NewsType.GENERAL,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedJournals() {
  await db
    .insertInto("journal")
    .values([
      { id: 1, name: "Applied Surface Science" },
      { id: 2, name: "Revista de Investigación de Física (RIF)" },
      { id: 3, name: "Physical Chemistry Chemical Physics" },
      { id: 4, name: "Physica B: Condensed Matter" },
      { id: 5, name: "Journal of Physics A: Mathematical and Theoretical" },
      { id: 6, name: "Physics Letters A" },
      { id: 7, name: "Momento" },
      { id: 8, name: "Revista Mexicana de Física" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedUniversities() {
  await db
    .insertInto("university")
    .values([
      {
        id: 1,
        name: "Universidad Nacional Mayor San Marcos",
        nameEN: "University",
        createdAt: "2020-02-11",
        updatedAt: "2020-02-11",
      },
      { id: 2, name: "Universidad de Piura", nameEN: "University of Piura", createdAt: null, updatedAt: null },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedEvents() {
  await db
    .insertInto("event")
    .values({
      id: 1,
      name: "Simposio Peruano de Física",
      city: "Trujillo",
      country: "Perú",
      cityEN: "Trujillo",
      countryEN: "Peru",
    })
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedProject() {
  await db
    .insertInto("project")
    .values({
      id: 1,
      title:
        "Influencia de la concentración de carbono sobre las propiedades mecánicas y térmicas en el sistema híbrido y hexagonal de Boro-Nitrógeno-Carbono (h-BNC)",
      titleEN: "xx",
      code: "B20130811",
      fundedAmount: "62000",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.\n\nSuspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.",
      descriptionEN:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.",
      status: null,
      startDate: "2020-04-10",
      endDate: null,
      createdAt: null,
      updatedAt: null,
      researchLineId: ResearchLine.HEXAGONAL,
      currencyId: Currency.SOL,
      fundingSourceId: FundingSource.VRIP,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("member_project")
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
        title:
          "Simulación de curvas M(H) mediante la implementación del algoritmo Metropolis-Hastings basado en el método de cadena de Markov Monte Carlo",
        file: null,
        abstractES:
          "Se expone la aplicación directa de los métodos computacionales de simulación Monte Carlo mediante la implementación del algoritmo Metrópolis-Hastings para la simulación del proceso de generación de curvas M(H) para un material ferromagnético. Se presenta un esquema de un sistema de nanopartículas magnéticas idénticas no interactuantes con distribución aleatoria del momento magnético. Se presenta un estudio sistemático de las curvas de magnetización, la cual varía con el tiempo al verse expuesto a campos magnéticos externos como una función del grado de libertad del momento magnético por paso Monte Carlo. Adicionalmente, el efecto de la temperatura sobre el ángulo de prueba es estudiado. El desarrollo de la implementación fue realizado en Python utilizando código Fortran embebido gracias a la herramienta F2PY.",
        abstractEN:
          "The direct application of the computational Monte Carlo simulation methods through the implementation of the Metropolis-Hastings algorithm for the simulation of the M(H) curve generation process for a ferromagnetic material is exposed. A diagram of a system of non-interacting identical magnetic nanoparticles with random distribution of the magnetic moment is presented. A systematic study of magnetization curves is presented, which varies with time when exposed to external magnetic fields as a function of the degree of freedom of the magnetic moment per Monte Carlo step. Additionally, the effect of temperature on the test angle is studied. The development of the implementation was done in Python using embedded Fortran code thanks to the F2PY tool.",
        journalIssue: null,
        doi: null,
        publishedAt: "2019-11-18",
        updatedAt: null,
        createdAt: null,
        typeId: PublicationType.THESIS,
        journalId: null,
        universityId: null,
        eventId: Event.SIMPOSIO_FISICA,
        thesisTypeId: null,
      },
      {
        id: 2,
        title: "Formaldehyde trapping by radical initiated reaction on hydrogenated boron nitride",
        file: "seed/publications/GymxaQPxRqoXvImvfZcKWAfw.pdf",
        abstractES:
          "Using density functional theory, we have studied the trapping of formaldehyde on hydrogenated boron nitride nanosheets. On the nitrogen terminated side, the formaldehyde molecule is physisorbed at a distance of ~3.1Å on top of a N atom. A calculation of the adsorption energy, as function of vertical separation between the molecule and the substrate, shows that closer to the surface, there is a strong repulsion due to the electronegativity of the N and O atoms. On the other hand, the trapping of formaldehyde by the substrate on the boron terminated surface is very favorable. The reaction of a single molecule is described by calculating the minimum energy pathway. It begins with the formaldehyde molecule and the boron nitride substrate far away from each other. In the following state of the reaction, the molecule attaches to the boron side of the substrate, gaining a large amount of energy. Through this interaction, the double bond of the oxygen atom breaks down, turning the molecule into a highly reactive carbon centered radical. In the final state of the reaction, a neighbor hydrogen atom is abstracted. In this state, there is an additional energy gain of 0.06eV. Once the stable molecule is formed by the abstraction of the hydrogen atom, a new dangling bond is created at a neighbor boron atom, which it may serve as a new site for the following molecule to attach. In this way, a chain reaction is possible. This self-propagating reaction is more viable for hydrogenated boron nitride than for graphane, opening an avenue to use hydrogenated h-BN in the indoor air pollution control. When there are two or more neighboring hydrogen vacancies in the substrate, the formaldehyde molecule prefers to attach forming Osingle bondB and Csingle bondB bonds with the substrate.",
        abstractEN:
          "Using density functional theory, we have studied the trapping of formaldehyde on hydrogenated boron nitride nanosheets. On the nitrogen terminated side, the formaldehyde molecule is physisorbed at a distance of ~3.1Å on top of a N atom. A calculation of the adsorption energy, as function of vertical separation between the molecule and the substrate, shows that closer to the surface, there is a strong repulsion due to the electronegativity of the N and O atoms. On the other hand, the trapping of formaldehyde by the substrate on the boron terminated surface is very favorable. The reaction of a single molecule is described by calculating the minimum energy pathway. It begins with the formaldehyde molecule and the boron nitride substrate far away from each other. In the following state of the reaction, the molecule attaches to the boron side of the substrate, gaining a large amount of energy. Through this interaction, the double bond of the oxygen atom breaks down, turning the molecule into a highly reactive carbon centered radical. In the final state of the reaction, a neighbor hydrogen atom is abstracted. In this state, there is an additional energy gain of 0.06eV. Once the stable molecule is formed by the abstraction of the hydrogen atom, a new dangling bond is created at a neighbor boron atom, which it may serve as a new site for the following molecule to attach. In this way, a chain reaction is possible. This self-propagating reaction is more viable for hydrogenated boron nitride than for graphane, opening an avenue to use hydrogenated h-BN in the indoor air pollution control. When there are two or more neighboring hydrogen vacancies in the substrate, the formaldehyde molecule prefers to attach forming Osingle bondB and Csingle bondB bonds with the substrate.",
        journalIssue: null,
        doi: null,
        publishedAt: "2020-06-18",
        updatedAt: null,
        createdAt: null,
        typeId: PublicationType.JOURNAL,
        journalId: 1,
        universityId: null,
        eventId: null,
        thesisTypeId: null,
      },
      {
        id: 3,
        title: "Doping engineering of thermoelectric transport in BNC heteronanotubes",
        file: "seed/publications/N3eSqMJvE1F0HWXspbEfplB6.pdf",
        abstractES:
          "BNC heteronanotubes are promising materials for the design of nanoscale thermoelectric devices. In particular, the structural BN doping pattern can be exploited to control the electrical and thermal transport properties of BNC nanostructures. We here address the thermoelectric transport properties of (6,6)-BNC heteronanotubes with helical and horizontal BN doping patterns. For this, we use a density functional tight-binding method combined with the Green's function technique. Our results show that the electron transmission is reduced and the electronic bandgap increased as a function of the BN concentration for different doping distribution patterns, so that (6,6)-BNC heteronanotubes become semiconducting with a tunable bandgap. The thermal conductance of helical (6,6)-BNC heteronanotubes, which is dominated by phonons, is weakly dependent on BN concentration in the range of 30–80%. Also, the Seebeck coefficient is enhanced by increasing the concentration of helical BN strips. In particular, helical (6,6)-BNC heteronanotubes with a high BN concentration (>20%) display a larger figure of merit compared to other doping distributions and, for a concentration of 50%, reach values up to 2.3 times and 3.4 times the corresponding values of a CNT at 300 K and 800 K, respectively. Our study yields new insights into the parameters tuning the thermoelectric efficiency and thus provides a starting point for designing thermoelectric devices based on BNC nanostructures.",
        abstractEN:
          "BNC heteronanotubes are promising materials for the design of nanoscale thermoelectric devices. In particular, the structural BN doping pattern can be exploited to control the electrical and thermal transport properties of BNC nanostructures. We here address the thermoelectric transport properties of (6,6)-BNC heteronanotubes with helical and horizontal BN doping patterns. For this, we use a density functional tight-binding method combined with the Green's function technique. Our results show that the electron transmission is reduced and the electronic bandgap increased as a function of the BN concentration for different doping distribution patterns, so that (6,6)-BNC heteronanotubes become semiconducting with a tunable bandgap. The thermal conductance of helical (6,6)-BNC heteronanotubes, which is dominated by phonons, is weakly dependent on BN concentration in the range of 30–80%. Also, the Seebeck coefficient is enhanced by increasing the concentration of helical BN strips. In particular, helical (6,6)-BNC heteronanotubes with a high BN concentration (>20%) display a larger figure of merit compared to other doping distributions and, for a concentration of 50%, reach values up to 2.3 times and 3.4 times the corresponding values of a CNT at 300 K and 800 K, respectively. Our study yields new insights into the parameters tuning the thermoelectric efficiency and thus provides a starting point for designing thermoelectric devices based on BNC nanostructures.",
        journalIssue: null,
        doi: null,
        publishedAt: "2020-08-01",
        updatedAt: null,
        createdAt: null,
        typeId: PublicationType.JOURNAL,
        journalId: null,
        universityId: null,
        eventId: null,
        thesisTypeId: null,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("publication_author")
    .values([
      // Publication 1 (SQL 39) - Simulación de curvas M(H)
      { id: 1, publicationId: 1, isPrincipal: 1, externalName: null, memberId: 16 },
      { id: 2, publicationId: 1, isPrincipal: 2, externalName: null, memberId: 14 },
      { id: 3, publicationId: 1, isPrincipal: 3, externalName: "H. Tarazona", memberId: null },

      // Publication 2 (SQL 41) - Formaldehyde trapping
      { id: 4, publicationId: 2, isPrincipal: 1, externalName: null, memberId: 4 },
      { id: 5, publicationId: 2, isPrincipal: 2, externalName: null, memberId: 14 },
      { id: 6, publicationId: 2, isPrincipal: 3, externalName: null, memberId: 2 },
      { id: 7, publicationId: 2, isPrincipal: 4, externalName: "Leonardo Medrano Sandonas", memberId: null },

      // Publication 3 (SQL 42) - Doping engineering
      { id: 8, publicationId: 3, isPrincipal: 1, externalName: null, memberId: 8 },
      { id: 9, publicationId: 3, isPrincipal: 2, externalName: "Rafael Gutierrez", memberId: null },
      { id: 10, publicationId: 3, isPrincipal: 3, externalName: "C.V. Landauro", memberId: null },
      { id: 11, publicationId: 3, isPrincipal: 4, externalName: null, memberId: 14 },
      { id: 12, publicationId: 3, isPrincipal: 5, externalName: "Gianaurelio Cuniberti", memberId: null },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}
