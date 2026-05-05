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
        name: "LAMMPS",
        description:
          "Potente programa de simulación atomística/molecular con dinámica molecular a gran escala de Sandia National Laboratories. LAMMPS utiliza la interfaz MPI para la comunicación en paralelo y es un software gratuito y de código abierto, distribuido según los términos de la licencia pública general GNU.",
        descriptionEN:
          "Powerful atomistic/molecular simulation program with large-scale molecular dynamics from Sandia National Laboratories. LAMMPS uses the MPI interface for parallel communication and is free and open source software, distributed under the terms of the GNU General Public License.",
        moreInfo: "https://lammps.sandia.gov/",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 2,
        name: "XMD",
        description:
          "Programa computacional para realizar la simulación con el método de dinámica molecular, especialmente útil para estudiar metales y cerámicas. XMD fue desarrollado por Jon Rifkin de University of Connecticut.",
        descriptionEN:
          "Computer program to perform simulation with the molecular dynamics method, especially useful for studying metals and ceramics. XMD was developed by Jon Rifkin of University of Connecticut.",
        moreInfo: "http://xmd.sourceforge.net/",
        groupId: 1,
        createdAt: "2020-04-10",
        updatedAt: "2020-04-10",
      },
      {
        id: 3,
        name: "Quantum-Espresso",
        description:
          "Es un conjunto integrado de códigos informáticos de código abierto para cálculos de estructuras electrónicas y modelado de materiales a nanoescala. Se basa en la teoría funcional de la densidad, ondas planas y pseudopotenciales.",
        descriptionEN:
          "It is an integrated set of open source computer codes for calculations of electronic structures and modeling of materials at the nanoscale. It is based on the functional theory of density, plane waves and pseudopotentials.",
        moreInfo: "http://www.quantum-espresso.org/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 4,
        name: "SIESTA",
        description:
          "Es un método original y una implementación de software para effecting calculations of electronic structure and molecular dynamics simulations for molecules and solids. Usa un código de teoría funcional de la densidad que predice las propiedades de una agrupación de átomos.",
        descriptionEN:
          "It is an original method and software implementation to perform ab initio electronic structure calculations and molecular dynamics simulations for molecules and solids. Use a code of density functional theory that predicts the properties of a grouping of atoms.",
        moreInfo: "https://departments.icmab.es/leem/siesta/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 5,
        name: "VAMPIRE",
        description: "Software de código abierto para simulación atomística de materiales magnéticos",
        descriptionEN: "Open source software for atomistic simulation of magnetic materials",
        moreInfo: "https://vampire.york.ac.uk/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 6,
        name: "Vinamax",
        description:
          "Herramienta para simulación para nanopartículas basado en macroespín, Herramienta escrito en golang.",
        descriptionEN: "Tool for simulation for nanoparticles based on macrospin, Tool written in golang.",
        moreInfo: "http://jleliaert.github.io/vinamax/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 7,
        name: "mumax3",
        description: "Es un programa de simulación micro magnética desarrollado por DyNaMats",
        descriptionEN: "It is a micro magnetic simulation program developed by DyNaMats",
        moreInfo: "https://mumax.github.io/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 8,
        name: "OVITO",
        description:
          "Software de análisis y visualización científica de datos. Datos generalmente obtenidos por simulación numérica en ciencia de materiales, física y química.",
        descriptionEN:
          "Scientific data analysis and visualization software. Data generally obtained by numerical simulation in materials science, physics, and chemistry.",
        moreInfo: "https://www.ovito.org/docs/current/",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 9,
        name: "MCANP",
        description: "Programas propios que fueron desarrollados en el grupo.",
        descriptionEN: "Own programs that were developed in the group.",
        moreInfo: "",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedAbout() {
  await db
    .insertInto("about")
    .values({
      id: 1,
      descriptionES:
        "<p>La investigación en el área de nanomateriales es uno de los componentes principales del desarrollo de la nanotecnología que permite el dominio y la modificación de las propiedades de los materiales mediante el cambio en sus estructuras atómicas. El grupo de investigación de métodos computacionales aplicado a nanomateriales (GMCAN), adscrito a la Facultad de Ciencias Físicas de la UNMSM, aplica y desarrolla modernas herramientas computacionales para entender, predecir y controlar los procesos físicos y químicos en el rango de tamaños moleculares hasta la mesoescala. Los integrantes del GMCAN vienen realizando investigaciones sobre nuevos materiales en los últimos 15 años. Hasta la actualidad se han estudiado las propiedades estructurales, energéticas, estructura electrónica de diversas nanopartículas, propiedades mecánicas de nanoestructuras, transiciones de fase y procesos de ordenación química en aleaciones binarias. El GMCAN mantiene estrecha colaboración con varios laboratorios y grupos de modelamiento y simulación. Formamos parte de la Red Iberoamericana de Divulgación y Formación en Nanotecnología (NANODYF).</p>",
      descriptionEN:
        "<p>Research in the area of nanomaterials is one of the main components of the development of nanotechnology, enabling control and modification of material properties by changing their atomic structures. The research group on computational methods applied to nanomaterials (GMCAN), affiliated with the Faculty of Physical Sciences at UNMSM, develops and applies modern computational tools to understand, predict and control physical and chemical processes from molecular scales up to the mesoscale. GMCAN members have been carrying out research on new materials for the past 15 years. To date, we have studied structural and energetic properties, electronic structure of various nanoparticles, mechanical properties of nanostructures, phase transitions and chemical ordering processes in binary alloys. GMCAN maintains close collaboration with several laboratories and modeling and simulation groups. We are part of the Iberoamerican Network for Dissemination and Training in Nanotechnology (NANODYF).</p>",
      objectivesContent: JSON.stringify({
        es: {
          introParagraphs: [],
          items: [
            "Estudiar mediante la simulación con Dinámica Molecular (MD) diferentes propiedades físicas y químicas de las nanopartículas y nanoestructuras.",
            "Estudiar mediante la teoría del funcional de la densidad (DFT) procesos de funcionalización y fenómenos superficiales de nanosistemas.",
            "Estudiar mediante Monte Carlo (MC) y dinámica de espín (SD) los procesos de transformaciones de fase en sistemas magnéticos nanoestructurados.",
            "Contribuir con la formación de recursos humanos altamente calificados en el estudio de diversos sistemas nanoestructurados empleando diversas herramientas computacionales.",
          ],
        },
        en: {
          introParagraphs: [],
          items: [
            "Study, via Molecular Dynamics (MD) simulation, different physical and chemical properties of nanoparticles and nanostructures.",
            "Study functionalization processes and surface phenomena of nanosystems using Density Functional Theory (DFT).",
            "Investigate phase transformation processes in nanostructured magnetic systems using Monte Carlo (MC) and spin dynamics (SD).",
            "Contribute to the training of highly qualified human resources in the study of various nanostructured systems using diverse computational tools.",
          ],
        },
      }),
      servicesContent: JSON.stringify({
        es: {
          introParagraphs: [],
          items: [
            "Brindar servicios a los grupos experimentales de la Universidad Nacional Mayor de San Marcos y otras instituciones académicas.",
            "Brindar servicios y asesoría a la comunidad académica y empresarial.",
            "Brindar el servicio de diseño e implementación de programas especializados.",
            "Promover los métodos computacionales de investigación de los nanomateriales en los diferentes niveles de enseñanza secundaria y universitaria.",
          ],
        },
        en: {
          introParagraphs: [],
          items: [
            "Provide services to experimental groups at Universidad Nacional Mayor de San Marcos and other academic institutions.",
            "Offer services and consultancy to the academic and business community.",
            "Provide design and implementation of specialized software programs.",
            "Promote computational research methods for nanomaterials at secondary and university education levels.",
          ],
        },
      }),
      homeServicesTeaserContent: JSON.stringify({
        es: {
          paragraphs: [
            "Brindamos servicios y asesoría computacional para grupos experimentales, academia y sector empresarial.",
            "También diseñamos e implementamos programas especializados para necesidades de investigación en nanomateriales.",
          ],
        },
        en: {
          paragraphs: [
            "We provide computational services and consulting for experimental groups, academia, and industry.",
            "We also design and implement specialized software for nanomaterials research needs.",
          ],
        },
      }),
      createdAt: today,
      updatedAt: today,
      groupId: 1,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();
}
