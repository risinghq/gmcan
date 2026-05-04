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
        "<p>La investigaci&oacute;n en el &aacute;rea de nanomateriales es uno de los componentes principales del desarrollo de la nanotecnolog&iacute;a que permite el dominio y la modificaci&oacute;n de las propiedades de los materiales mediante el cambio en sus estructuras at&oacute;micas. El grupo de investigaci&oacute;n de m&eacute;todos computacionales aplicado a nanomateriales (GMCAN), adscrito a la Facultad de Ciencias F&iacute;sicas de la UNMSM, aplica y desarrolla modernas herramientas computacionales para entender, predecir y controlar los procesos f&iacute;sicos y qu&iacute;micos en el rango de Tama&ntilde;os moleculares hasta la mesoescala. Los integrantes del GMCAN vienen realizando investigaciones sobre nuevos materiales en los &uacute;ltimos 15 a&ntilde;os. Hasta la actualidad se han estudiado las propiedades estructurales, energ&eacute;ticas, estructura electr&oacute;nica de diversas nanopart&iacute;culas, propiedades mec&aacute;nicas de nanoestructuras, transiciones de fase y procesos de ordenaci&oacute;n qu&iacute;mica en aleaciones binarias. El GMCAN mantiene&nbsp; estrecha colaboraci&oacute;n con varios laboratorios y grupos de modelamiento y simulaci&oacute;n. Formamos parte de la Red Iberoamericana de Divulgaci&oacute;n&nbsp; y Formaci&oacute;n en Nanotecnolog&iacute;a (NANODYF).</p>",
      descriptionEN:
        "<p>Research in the area of &nbsp;nanomaterials is one of the main components of the development of nanotechnology that allows the domain and modification of the properties of materials by changing their atomic structures. The research group of computational methods applied to nanomaterials (GMCAN), attached to the Faculty of Physical Sciences of the UNMSM, applies and develops modern computational tools to understand, predict and control physical and chemical processes in the range of molecular sizes up to mesoscale. GMCAN members have been conducting research on new materials for the past 15 years. Until now the structural and energetic properties, electronic structure of various nanoparticles, mechanical properties of nanostructures, phase transitions and chemical ordering processes in binary alloys have been studied. GMCAN maintains&nbsp; close collaboration with several laboratories and modeling and simulation groups. We are part of the Iberoamerican Network of Dissemination&nbsp; and Training in Nanotechnology (NANODYF).</p>",
      objectivesES: null,
      objectivesEN: null,
      servicesES: null,
      servicesEN: null,
      createdAt: today,
      updatedAt: today,
      photo: null,
      groupId: 1,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();
}
