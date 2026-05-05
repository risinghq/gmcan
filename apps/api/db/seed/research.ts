import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];

export async function seedResearchGroup() {
  await db
    .insertInto("research_group")
    .values({
      id: 1,
      summaryES:
        "El GMCAN aplica y desarrolla modernas herramientas computacionales para entender, predecir y controlar los procesos físicos y químicos en el rango de tamaños moleculares hasta la mesoescala.",
      summaryEN:
        "GMCAN applies and develops modern computational tools to understand, predict and control physical and chemical processes in the range of molecular sizes up to the mesoscale.",
      address: "Germán Amézaga N° 375 - Edificio Jorge Basadre. Ciudad Universitaria, Lima, Perú",
      email: "gmcan@unmsm.edu.pe",
      phone: "+51 989994607",
      name: "GMCAN",
      fullName: "Grupo de Investigación de Métodos Computacionales Aplicado a Nanomateriales",
      facilitiesES:
        "El GMCAN se ubica en el tercer piso del edificio del Instituto de Investigación de Física. Cuenta con un ambiente multiuso con espacio para investigadores, tesistas y estudiantes. Contamos con equipo computacional para el trabajo de las actividades de investigación, tanto de proyectos como de tesis de pre y postgrado. Asimismo, forma parte del grupo el Laboratorio de Modelamiento y Simulación Computacional (LMSC). En el que contamos con recurso computacional, equipados con estaciones de trabajo de alto desempeño. Lo que nos permite garantizar los estudios mediante simulaciones de sistemas complejos.",
      facilitiesEN:
        "The GMCAN is located on the third floor of the Physics Research Institute building. It has a multipurpose environment with space for researchers, thesis students and students. We have computer equipment for the work of research activities, both undergraduate and graduate projects and theses. Likewise, the Computational Modeling and Simulation Laboratory (LMSC) is part of the group. In which we have computational resources, equipped with high-performance workstations. This allows us to guarantee studies through simulations of complex systems.",
      futureWorkES:
        "<p>● Estudiar la influencia de dopantes sobre las propiedades mecánicas y electrónicas de las GNR.</p>\
        <p>● Estudiar las propiedades mecánicas de las nanohojas de grafeno monocapa con nanoporos funcionalizadas de igual tamaño distribuidos aleatoriamente y de forma ordenada.</p>\
        <p>● Estudiar las propiedades mecánicas de las nanohojas de grafeno multicapa con nanoporos funcionalizadas.</p>\
        <p>● Estudiar procesos de transporte del agua por la membrana de grafeno multicapa nanoporoso.</p>\
        <p>● Estudiar las condiciones más óptimas de generación de nanoporos mediante el bombardeo con átomos y iones energéticos mediante la simulación con DM.</p>\
        <p>● Estudiar el efecto del tamaño y forma de las NPs sobre las propiedades magnéticas (Tc, Hc).</p>\
        <p>● Efecto de la anisotropía superficial sobre las propiedades magnéticas.</p>\
        <p>● Procesos de relajación en sistemas SPM.</p>\
        <p>● Estudio de nanopartículas magnéticas inmersa en metales no-magnéticas.</p>\
        <p>● Estudiar las propiedades de multicapas metal magnético/tierra rara.</p>\
        <p>● Estudio de las propiedades superferromagnéticas de sistemas bidimensionales.</p>\
        <p>● Estudio de la formación de skyrmions magnéticos, mediante simulación atomística.</p>",
      futureWorkEN:
        "<p>● Study the influence of dopants on the mechanical and electronic properties of GNRs.</p>\
        <p>● Study the mechanical properties of monolayer graphene sheets with functionalized nanopores of equal size, distributed randomly and in ordered arrangements.</p>\
        <p>● Study the mechanical properties of multilayer graphene sheets with functionalized nanopores.</p>\
        <p>● Study water transport processes through nanoporous multilayer graphene membranes.</p>\
        <p>● Investigate optimal conditions for nanopore generation by bombardment with energetic atoms and ions using MD simulation.</p>\
        <p>● Study the effect of nanoparticle size and shape on magnetic properties (Tc, Hc).</p>\
        <p>● Effect of surface anisotropy on magnetic properties.</p>\
        <p>● Relaxation processes in SPM systems.</p>\
        <p>● Study magnetic nanoparticles embedded in non-magnetic metals.</p>\
        <p>● Study properties of magnetic metal / rare-earth multilayers.</p>\
        <p>● Study superferromagnetic properties of two-dimensional systems.</p>\
        <p>● Study the formation of magnetic skyrmions via atomistic simulation.</p>",
      publicationsSectionES: null,
      publicationsSectionEN: null,
      projectsSectionES: null,
      projectsSectionEN: null,
      createdAt: today,
      updatedAt: today,
    } as any)
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedResearchLines() {
  await db
    .insertInto("research_line")
    .values([
      {
        id: 1,
        name: "Propiedades Estructurales de Nanopartículas",
        nameEN: "Structural Properties of Nanoparticles",
        description:
          "Se estudian las diferentes propiedades físicas de las nanopartículas y nanomateriales tanto de sistemas monocomponentes como multicomponentes, prestando especial atención a las propiedades estructurales, térmicas, mecánicas, superficiales, así como las transiciones de fases. Asimismo, evaluamos la estabilidad térmica de estos nanosistemas variando factores como tamaño, composición y patrón de mezcla (orden químico). Además, este tipo de estudios los realizamos mediante el método de simulación de dinámica molecular. Vale mencionar que las aplicaciones de estos sistemas dependen de las propiedades obtenidas.",
        descriptionEN:
          "The different physical properties of nanoparticles and nanomaterials of both monocomponent and multicomponent systems are studied, paying special attention to structural, thermal, mechanical and surface properties, as well as phase transitions. Likewise, we evaluate the thermal stability of these nanosystems by varying factors such as size, composition and mixing pattern (chemical order). In addition, we carry out this type of study using the molecular dynamics simulation method. It is worth mentioning that the applications of these systems depend on the properties obtained.",
        groupId: 1,
        createdAt: "2020-03-18",
        updatedAt: "2020-03-18",
      },
      {
        id: 2,
        name: "Nanosistemas hexagonales tipo-grafeno y tipo-nanotubos de carbono",
        nameEN: "Hexagonal graphene-type and carbon nanotube-type nano-systems",
        description:
          "En esta línea de investigación estudiamos las propiedades mecánicas y térmicas de nanosistemas hexagonales 2D tipo-grafeno y 1D tipo-nanotubos de carbono (como nitruro de boro, grafano, fosforeno negro, etc). Estos estudios realizamos, por ejemplo, variando la concentración de dopaje o generando defectos estructurales. Por un lado, este tipo de estudios se realizan empleando simulaciones de dinámica molecular. Por otro lado, para el cálculo de propiedades electrónicas y de transporte electrónico de estos nanosistemas hexagonales 2D y 1D realizamos mediante cálculos auto-consistentes DFT. Vale mencionar que las aplicaciones de estos sistemas dependen de las propiedades obtenidas.",
        descriptionEN:
          "In this research line, we study the mechanical and thermal properties of 2D graphene-type hexagonal nanosystems and 1D carbon-nanotube type (such as boron nitride, graphane, black phosphorene, etc.). We carry out these studies, for example, by varying the doping concentration or generating structural defects. On the one hand, these types of studies are carried out using molecular dynamics simulations. On the other hand, for the calculation of electronic properties and electronic transport of these 2D and 1D hexagonal nanosystems we performed DFT through self-consistent calculations. It is worth mentioning that the applications of these systems depend on the properties obtained.",
        groupId: 1,
        createdAt: "2020-03-18",
        updatedAt: "2020-03-18",
      },
      {
        id: 3,
        name: "Nanomagnetismo y aplicaciones de materiales magnéticos",
        nameEN: "Nanomagnetism and applications of magnetic materials",
        description:
          "En esta línea estudiamos las propiedades magnéticas de nanoestructuras magnéticas basadas principalmente en Fe. Sistema de nanopartículas, tipo core-shell, multicapas y aleaciones son estudiadas en función de parámetros controlables como la temperatura y campo magnético aplicado.",
        descriptionEN:
          "In this line, we study the magnetic properties of magnetic nanostructures based mainly on Fe. Nanoparticle system, core-shell type, multilayers and alloys are studied based on controllable parameters such as temperature and applied magnetic field.",
        groupId: 1,
        createdAt: "2020-03-18",
        updatedAt: "2020-03-18",
      },
    ] as any)
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedMethods() {
  await db
    .insertInto("method")
    .values([
      {
        id: 1,
        name: "Dinámica Molecular",
        nameEN: "Molecular Dynamics",
        description:
          "<p>Din&aacute;mica molecular (MD del ingl&eacute;s <em>molecular dynamics</em>) cl&aacute;sica es un potente m&eacute;todo determin&iacute;stico de simulaci&oacute;n computacional que consiste en la integraci&oacute;n num&eacute;rica de las ecuaciones diferenciales de movimiento de Newton de N part&iacute;culas que interact&uacute;an mediante cierto potencial de interacci&oacute;n. Permite determinar las coordenadas y velocidades de todas las part&iacute;culas en cada instante de tiempo discretizado. A partir de las coordenadas y velocidades se calculan las magnitudes de inter&eacute;s como la temperatura, presi&oacute;n, funci&oacute;n de distribuci&oacute;n radial, funciones de correlaci&oacute;n de velocidades, curvas calor&iacute;ficas, calor espec&iacute;fico, etc. Este m&eacute;todo es ampliamente utilizado en diversas disciplinas como física, química, ciencia de materiales, biología, geología, entre otras. Además, MD es útil para estudiar sistemas orgánicos e inorgánicos de gran tamaño, incluyendo otros estados en que se encuentre el sistema en estudio, es decir, se puede determinar las propiedades energéticas, estructurales, mecánicas y térmicas de un sistemas de partículas en equilibrio y fuera de este.</p>",
        descriptionEN:
          "<p>Classical molecular dynamics (MD) is a powerful deterministic method of computational simulation that consists of the numerical integration of Newton's differential equations of motion of N particles that interact through a certain interaction potential. It allows determining the coordinates and velocities of all the particles at each discretized instant of time. From the coordinates and speeds, the quantities of interest are calculated such as temperature, pressure, radial distribution function, speed correlation functions, heat curves, specific heat, etc. This method is widely used in various disciplines such as physics, chemistry, materials science, biology, geology, among others. Additionally, MD is useful for studying organic and inorganic systems of large size, including other states in which the system under study is found, that is, the energetic, structural, mechanical and thermal properties of a system of particles in equilibrium and out of this can be determined.</p>",
        groupId: 1,
        createdAt: "2020-04-09",
        updatedAt: "2020-04-09",
      },
      {
        id: 2,
        name: "Teoría del Funcional de la Densidad (DFT)",
        nameEN: "Density Functional Theory",
        description:
          "<p>La teor&iacute;a del funcional de la densidad (DFT, del ingl&eacute;s density functional theory) es una de las teorías más populares y exitosas en la comunidad de la Física, Química, y Ciencia de materiales y que hoy en día se utiliza ampliamente. Esta teor&iacute;a se refiere a que cualquier propiedad de un sistema de partículas que interactúan en un potencial externo puede describirse mediante una funcional de la densidad electrónica del estado fundamental. P. Hohenberg y W. Kohn dieron en 1964 la prueba de la existencia de tales funcionales, pero sin ninguna sugerencia sobre la metodología a seguir para su implementación. Luego, W. Kohn y L.-J. Sham produjeron un marco interesante en 1965, donde el problema intratable de muchos cuerpos de los electrones que interactúan en un potencial externo estático se reduce a un problema manejable de electrones que no interact&uacute;an que se mueven en un potencial efectivo. Actualmente, la simplicidad del método ha hecho posible estudiar la estructura electrónica de diversos sistemas cuánticos multi-partícula convirti&eacute;ndose en una potente metodología de cálculo.</p>",
        descriptionEN:
          "<p>Density Functional Theory (DFT) is one of the most popular and successful theories in the Physics, Chemistry, and Materials Science community and is widely used today. This theory refers to the fact that any property of a system of particles that interact in an external potential can be described by a functional of the electron density of the ground state. P. Hohenberg and W. Kohn gave proof of the existence of such functionalities in 1964, but without any suggestion about the methodology to be followed for its implementation. Later, W. Kohn and L.-J. Sham produced an interesting framework in 1965, where the intractable problem of many bodies of electrons interacting at a static external potential boils down to a manageable problem of non-interacting electrons moving in an effective potential. Currently, the simplicity of the method has made it possible to study the electronic structure of various multi-particle quantum systems becoming a powerful calculation methodology.</p>",
        groupId: 1,
        createdAt: "2020-04-09",
        updatedAt: "2020-04-09",
      },
      {
        id: 3,
        name: "Método Monte Carlo",
        nameEN: "Monte Carlo Method",
        description:
          "<p>El m&eacute;todo de Monte Carlo (MC) ha tenido gran relevancia en la f&iacute;sica de los &uacute;ltimos tiempos en magnetismo, ya que provee una forma natural para simular los efectos de la temperatura sin usar m&eacute;todos din&aacute;micos debido a que converge r&aacute;pidamente al equilibrio. La t&eacute;cnica requiere generar grandes cantidades de n&uacute;meros aleatorios y contar la fracci&oacute;n de ellos obedeciendo ciertas condiciones. La manera de contar y las condiciones impuestas definen la implementaci&oacute;n del algoritmo num&eacute;rico.</p>",
        descriptionEN:
          "<p>The Monte Carlo (MC) method has had great relevance in recent times in magnetism physics, as it provides a natural way to simulate the effects of temperature without using dynamic methods because it quickly converges to equilibrium. The technique requires generating large amounts of random numbers and counting the fraction of them obeying certain conditions. The way of counting and the conditions imposed define the implementation of the numerical algorithm.</p>",
        groupId: 1,
        createdAt: "2020-04-09",
        updatedAt: "2020-04-09",
      },
      {
        id: 4,
        name: "Dinámica del spin",
        nameEN: "Spin dynamics",
        description:
          "<p>La din&aacute;mica de esp&iacute;n&nbsp; (SD, del ingl&eacute;s <em>spin dynamics</em>) es un m&eacute;todo computacional usado para modelar la evoluci&oacute;n en el tiempo de un sistema magn&eacute;tico. En este m&eacute;todo se incluyen efectos como precesi&oacute;n, procesos ultrarr&aacute;pidos, ciclos de hist&eacute;resis din&aacute;mico. En la simulaci&oacute;n se utiliza la ecuaci&oacute;n de movimiento de Landau-Lifshitz-Gilbert (LLG) junto con la din&aacute;mica de Langevin para realizar simulaciones a temperatura finita.</p>",
        descriptionEN:
          "<p>Spin dynamics (SD) is a computational method used to model the evolution in time of a magnetic system. Effects such as precession, ultra-fast processes, dynamic hysteresis loops are included in this method. In the simulation, the Landau-Lifshitz-Gilbert (LLG) equation of motion is used together with Langevin dynamics to perform simulations at finite temperature.</p>",
        groupId: 1,
        createdAt: today,
        updatedAt: today,
      },
    ] as any)
    .onConflict((oc) => oc.doNothing())
    .execute();
}
