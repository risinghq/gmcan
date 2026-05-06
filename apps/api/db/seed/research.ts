import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];

export async function seedResearchGroup() {
  await db
    .insertInto("research_group")
    .values({
      id: 1,
      address: "Germán Amézaga N° 375 - Edificio Jorge Basadre. Ciudad Universitaria, Lima, Perú",
      email: "gmcan@unmsm.edu.pe",
      phone: "+51 989994607",
      name: "GMCAN",
      fullName: "Grupo de Investigación de Métodos Computacionales Aplicado a Nanomateriales",
      createdAt: today,
      updatedAt: today,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("group_translation")
    .values([
      {
        groupId: 1,
        locale: "es",
        summary:
          "El GMCAN aplica y desarrolla modernas herramientas computacionales para entender, predecir y controlar los procesos físicos y químicos en el rango de tamaños moleculares hasta la mesoescala.",
        facilities:
          "El GMCAN se ubica en el tercer piso del edificio del Instituto de Investigación de Física, con espacio para investigadores y tesistas.",
        futureWork: "<p>Continuar estudios de nanomateriales, propiedades magnéticas y simulación atomística.</p>",
        publicationsSection: null,
        projectsSection: null,
      },
      {
        groupId: 1,
        locale: "en",
        summary:
          "GMCAN develops modern computational tools to understand, predict, and control physical and chemical processes from molecular to mesoscale sizes.",
        facilities:
          "GMCAN is located on the third floor of the Physics Research Institute building with workspace for researchers and graduate students.",
        futureWork: "<p>Continue work on nanomaterials, magnetic properties, and atomistic simulation.</p>",
        publicationsSection: null,
        projectsSection: null,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedResearchLines() {
  await db
    .insertInto("research_line")
    .values([
      { id: 1, groupId: 1, createdAt: "2020-03-18", updatedAt: "2020-03-18" },
      { id: 2, groupId: 1, createdAt: "2020-03-18", updatedAt: "2020-03-18" },
      { id: 3, groupId: 1, createdAt: "2020-03-18", updatedAt: "2020-03-18" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("research_line_translation")
    .values([
      {
        researchLineId: 1,
        locale: "es",
        name: "Propiedades Estructurales de Nanopartículas",
        description: "Estudio de propiedades estructurales, térmicas y mecánicas de nanopartículas.",
      },
      {
        researchLineId: 1,
        locale: "en",
        name: "Structural Properties of Nanoparticles",
        description: "Study of structural, thermal, and mechanical properties of nanoparticles.",
      },
      {
        researchLineId: 2,
        locale: "es",
        name: "Nanosistemas hexagonales tipo-grafeno y tipo-nanotubos de carbono",
        description: "Estudio de nanosistemas 2D/1D, transporte electrónico y defectos estructurales.",
      },
      {
        researchLineId: 2,
        locale: "en",
        name: "Hexagonal graphene-type and carbon nanotube-type nano-systems",
        description: "Study of 2D/1D nanosystems, electronic transport, and structural defects.",
      },
      {
        researchLineId: 3,
        locale: "es",
        name: "Nanomagnetismo y aplicaciones de materiales magnéticos",
        description: "Estudio de propiedades magnéticas de nanoestructuras basadas en Fe.",
      },
      {
        researchLineId: 3,
        locale: "en",
        name: "Nanomagnetism and applications of magnetic materials",
        description: "Study of magnetic properties of Fe-based nanostructures.",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedMethods() {
  await db
    .insertInto("method")
    .values([
      { id: 1, groupId: 1, createdAt: "2020-04-09", updatedAt: "2020-04-09" },
      { id: 2, groupId: 1, createdAt: "2020-04-09", updatedAt: "2020-04-09" },
      { id: 3, groupId: 1, createdAt: "2020-04-09", updatedAt: "2020-04-09" },
      { id: 4, groupId: 1, createdAt: "2020-04-09", updatedAt: "2020-04-09" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("method_translation")
    .values([
      {
        methodId: 1,
        locale: "es",
        name: "Dinámica Molecular",
        description: "Integración numérica de ecuaciones de movimiento para simulación atomística.",
      },
      {
        methodId: 1,
        locale: "en",
        name: "Molecular Dynamics",
        description: "Numerical integration of motion equations for atomistic simulation.",
      },
      {
        methodId: 2,
        locale: "es",
        name: "Teoría del Funcional de la Densidad (DFT)",
        description: "Cálculo de estructura electrónica con aproximaciones de funcionales de densidad.",
      },
      {
        methodId: 2,
        locale: "en",
        name: "Density Functional Theory",
        description: "Electronic structure calculation with density functional approximations.",
      },
      {
        methodId: 3,
        locale: "es",
        name: "Método Monte Carlo",
        description: "Simulación estocástica de sistemas físicos con muestreo aleatorio.",
      },
      {
        methodId: 3,
        locale: "en",
        name: "Monte Carlo Method",
        description: "Stochastic simulation of physical systems via random sampling.",
      },
      {
        methodId: 4,
        locale: "es",
        name: "Dinámica de espines",
        description: "Simulación de evolución temporal de espines en materiales magnéticos.",
      },
      {
        methodId: 4,
        locale: "en",
        name: "Spin dynamics",
        description: "Simulation of spin time evolution in magnetic materials.",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}
