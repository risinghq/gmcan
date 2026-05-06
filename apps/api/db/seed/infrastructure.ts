import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];

export async function seedEquipment() {
  await db
    .insertInto("equipment")
    .values([
      {
        id: 1,
        name: "ThinkStation P500",
        cpu: "Xeon E5-2698, 18 cores/36 threads",
        gpu: "Quadro K6000, 384 bits, 12GB, 2880 cudas",
        ram: "256 GB ECC",
        storage: "512GB SSD + 4TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 2,
        name: "ThinkStation P700",
        cpu: "2 x Xeon E5-2690, 24 cores/48 threads",
        gpu: "Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "128 GB ECC",
        storage: "512GB SSD + 4TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 3,
        name: "WorkStation Z640",
        cpu: "Xeon E5-2690, 12 cores/24 threads",
        gpu: "Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "128 GB ECC",
        storage: "1TB SSD + 4TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 4,
        name: "WorkStation Precision 7920",
        cpu: "Xeon Silver 4114, 10 cores/20 threads",
        gpu: "Quadro P6000, 384 bits, 24GB, 3840 cudas",
        ram: "128 GB 2666 ECC",
        storage: "512GB SSD + 2TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 5,
        name: "WorkStation HP Z8",
        cpu: "1 x Xeon Silver 4114, 10 cores/20 threads",
        gpu: "NVIDIA Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "128 GB ECC",
        storage: "512GB SSD + 2TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 6,
        name: "ThinkStation P920 (Lenovo)",
        cpu: "2 x Xeon Gold 5118, 24 cores/48 threads",
        gpu: "NVIDIA Quadro P6000, 384 bits, 24GB, 3840 cudas",
        ram: "128 GB ECC",
        storage: "512GB SSD M2 + 477 GB",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 7,
        name: "ThinkStation P920 (Lenovo)",
        cpu: "2 x Xeon Gold 5120, 28 cores/56 threads",
        gpu: "NVIDIA Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "96 GB ECC",
        storage: "512GB SSD + 476.9 GB",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 8,
        name: "ThinkStation P920 (Lenovo)",
        cpu: "2 x Xeon Gold 5118, 24 cores/48 threads",
        gpu: "NVIDIA Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "32 GB ECC",
        storage: "512GB SSD + 2TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 9,
        name: "ThinkStation P920 (Lenovo)",
        cpu: "2 x Xeon Gold 5118, 24 cores/48 threads",
        gpu: "NVIDIA Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "64 GB ECC",
        storage: "512GB SSD + 2TB 7200 rpm",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 10,
        name: "Servidor PH Proliant ML110",
        cpu: "Gen10 Xeon Bronze 3204, 1.90GHz",
        gpu: null,
        ram: "16 GB",
        storage: "4TB",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 11,
        name: "Servidor Dell Poweredge T40",
        cpu: "Xeon 2224G, 3.50GHz",
        gpu: null,
        ram: "8 GB",
        storage: "1TB",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 12,
        name: "Thinkstation P330 (Lenovo)",
        cpu: "Xeon E-2224G",
        gpu: null,
        ram: "16 GB",
        storage: "1TB",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 13,
        name: "ThinkStation P920 (Lenovo)",
        cpu: "2 x Xeon Gold 6132, 28 cores/56 threads",
        gpu: "NVIDIA Quadro P5000, 256 bits, 16GB, 2560 cudas",
        ram: "64 GB ECC DDR4 2933MHz/2666MHz",
        storage: "512GB SSD + 476.9 GB",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 14,
        name: "Servidor HP Proliant ML350",
        cpu: "Xeon Gold 5118, 2.30GHz, 12 cores/24 threads",
        gpu: null,
        ram: "32 GB ECC",
        storage: "960 GB SSD",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 15,
        name: "PC DELL VOSTRO 3710",
        cpu: "Intel Core i7-12700, 3.6/4.9 GHz, 12 cores",
        gpu: null,
        ram: "16 GB DDR4-3200 MHz",
        storage: "512GB SSD M.2 PCIe",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 16,
        name: "PC DELL PRECISION T7820",
        cpu: "2 x Intel Xeon Silver 4214R, 2.4/3.5 GHz, 24 cores",
        gpu: null,
        ram: "192 GB DDR4-2933 MHz ECC",
        storage: "512GB M.2 PCIe + 2TB HDD",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedSoftware() {
  await db
    .insertInto("software")
    .values([
      {
        id: 1,
        moreInfo: "https://lammps.sandia.gov/",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 2,
        moreInfo: "http://xmd.sourceforge.net/",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 3,
        moreInfo: "http://www.quantum-espresso.org/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 4,
        moreInfo: "https://departments.icmab.es/leem/siesta/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 5,
        moreInfo: "https://vampire.york.ac.uk/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 6,
        moreInfo: "http://jleliaert.github.io/vinamax/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 7,
        moreInfo: "https://mumax.github.io/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 8,
        moreInfo: "https://www.ovito.org/docs/current/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 9,
        moreInfo: "",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("software_translation")
    .values([
      {
        softwareId: 1,
        locale: "es",
        name: "LAMMPS",
        description:
          "Potente programa de simulación atomística/molecular con dinámica molecular a gran escala de Sandia National Laboratories.",
      },
      {
        softwareId: 1,
        locale: "en",
        name: "LAMMPS",
        description:
          "Powerful atomistic/molecular simulation program with large-scale molecular dynamics from Sandia National Laboratories.",
      },
      {
        softwareId: 2,
        locale: "es",
        name: "XMD",
        description: "Programa computacional de dinámica molecular para estudiar metales y cerámicas.",
      },
      {
        softwareId: 2,
        locale: "en",
        name: "XMD",
        description: "Molecular dynamics software useful for metals and ceramics studies.",
      },
      {
        softwareId: 3,
        locale: "es",
        name: "Quantum-Espresso",
        description: "Suite open source para cálculos de estructura electrónica.",
      },
      {
        softwareId: 3,
        locale: "en",
        name: "Quantum-Espresso",
        description: "Open source suite for electronic structure calculations.",
      },
      {
        softwareId: 4,
        locale: "es",
        name: "SIESTA",
        description: "Método y software para estructura electrónica y dinámica molecular.",
      },
      {
        softwareId: 4,
        locale: "en",
        name: "SIESTA",
        description: "Method and software for electronic structure and molecular dynamics.",
      },
      {
        softwareId: 5,
        locale: "es",
        name: "VAMPIRE",
        description: "Software de simulación atomística de materiales magnéticos.",
      },
      {
        softwareId: 5,
        locale: "en",
        name: "VAMPIRE",
        description: "Open source software for atomistic simulation of magnetic materials.",
      },
      {
        softwareId: 6,
        locale: "es",
        name: "Vinamax",
        description: "Herramienta de simulación para nanopartículas basada en macroespín.",
      },
      {
        softwareId: 6,
        locale: "en",
        name: "Vinamax",
        description: "Simulation tool for nanoparticles based on macrospin.",
      },
      { softwareId: 7, locale: "es", name: "mumax3", description: "Programa de simulación micromagnética." },
      { softwareId: 7, locale: "en", name: "mumax3", description: "Micromagnetic simulation software." },
      {
        softwareId: 8,
        locale: "es",
        name: "OVITO",
        description: "Software de análisis y visualización científica de datos.",
      },
      {
        softwareId: 8,
        locale: "en",
        name: "OVITO",
        description: "Scientific data analysis and visualization software.",
      },
      { softwareId: 9, locale: "es", name: "MCANP", description: "Programas propios desarrollados en el grupo." },
      { softwareId: 9, locale: "en", name: "MCANP", description: "In-house programs developed by the group." },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedAbout() {
  await db
    .insertInto("about")
    .values({
      id: 1,
      createdAt: today,
      updatedAt: today,
      groupId: 1,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  const objectivesEs = JSON.stringify({
    introParagraphs: [],
    items: [
      "Estudiar propiedades físicas y químicas de nanopartículas y nanoestructuras.",
      "Aplicar DFT en fenómenos de funcionalización y superficies.",
      "Analizar transformaciones de fase con Monte Carlo y dinámica de espines.",
      "Formar recursos humanos en métodos computacionales para nanomateriales.",
    ],
  });
  const objectivesEn = JSON.stringify({
    introParagraphs: [],
    items: [
      "Study physical and chemical properties of nanoparticles and nanostructures.",
      "Apply DFT to functionalization and surface phenomena.",
      "Analyze phase transformations with Monte Carlo and spin dynamics.",
      "Train highly qualified researchers in computational nanomaterials methods.",
    ],
  });
  const servicesEs = JSON.stringify({
    introParagraphs: [],
    items: [
      "Brindar servicios a grupos experimentales y entidades académicas.",
      "Brindar asesoría a comunidad académica y empresarial.",
      "Diseñar e implementar programas especializados.",
    ],
  });
  const servicesEn = JSON.stringify({
    introParagraphs: [],
    items: [
      "Provide services to experimental groups and academic institutions.",
      "Offer consulting to academic and business communities.",
      "Design and implement specialized software.",
    ],
  });
  const teaserEs = JSON.stringify({
    paragraphs: [
      "Brindamos servicios y asesoría computacional para grupos experimentales, academia y sector empresarial.",
      "También diseñamos e implementamos programas especializados para investigación en nanomateriales.",
    ],
  });
  const teaserEn = JSON.stringify({
    paragraphs: [
      "We provide computational services and consulting for experimental groups, academia, and industry.",
      "We also design and implement specialized software for nanomaterials research.",
    ],
  });

  await db
    .insertInto("about_translation")
    .values([
      {
        aboutId: 1,
        locale: "es",
        description:
          "<p>La investigación en nanomateriales es un componente central del desarrollo nanotecnológico. GMCAN aplica herramientas computacionales modernas para entender y controlar procesos físicos y químicos desde escala molecular hasta mesoescala.</p>",
        objectivesContent: objectivesEs,
        servicesContent: servicesEs,
        homeServicesTeaserContent: teaserEs,
      },
      {
        aboutId: 1,
        locale: "en",
        description:
          "<p>Nanomaterials research is a core component of nanotechnology development. GMCAN applies modern computational tools to understand and control physical and chemical processes from molecular to mesoscale ranges.</p>",
        objectivesContent: objectivesEn,
        servicesContent: servicesEn,
        homeServicesTeaserContent: teaserEn,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}
