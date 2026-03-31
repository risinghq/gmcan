-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30-0ubuntu0.20.04.2 - (Ubuntu)
-- Server OS:                    Linux
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table tesis.autor
CREATE TABLE IF NOT EXISTS `autor` (
  `idAutor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idAutor`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.autor: ~11 rows (approximately)
/*!40000 ALTER TABLE `autor` DISABLE KEYS */;
INSERT INTO `autor` (`idAutor`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(28, 'Pepito', NULL, NULL),
	(29, 'Jean Perez', NULL, NULL),
	(30, 'H. Tarazona', NULL, NULL),
	(31, 'J Guerrero-Sanchez', NULL, NULL),
	(32, 'C.V. Landauro', NULL, NULL),
	(33, 'Noboru Takeuchi', NULL, NULL),
	(34, 'Leonardo Medrano Sandonas', NULL, NULL),
	(35, 'Rafael Gutierrez', NULL, NULL),
	(36, 'Gianaurelio Cuniberti', NULL, NULL),
	(37, 'Pelusas', NULL, NULL),
	(38, 'pelusas', NULL, NULL);
/*!40000 ALTER TABLE `autor` ENABLE KEYS */;

-- Dumping structure for table tesis.equipo
CREATE TABLE IF NOT EXISTS `equipo` (
  `idEquipo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `cpu` varchar(150) DEFAULT NULL,
  `gpu` varchar(150) DEFAULT NULL,
  `ram` varchar(150) DEFAULT NULL,
  `hd` varchar(150) DEFAULT NULL,
  `grupo_idGrupo` int NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idEquipo`),
  KEY `fk_facilidades_grupo1_idx` (`grupo_idGrupo`),
  CONSTRAINT `fk_facilidades_grupo1` FOREIGN KEY (`grupo_idGrupo`) REFERENCES `grupo` (`idGrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.equipo: ~4 rows (approximately)
/*!40000 ALTER TABLE `equipo` DISABLE KEYS */;
INSERT INTO `equipo` (`idEquipo`, `nombre`, `cpu`, `gpu`, `ram`, `hd`, `grupo_idGrupo`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'ThinkStation P500', 'Xeon E5-2698, 18 cores/36 threads', '256 GB ECC', 'Quadro K6000, 384 bits, 12GB, 2880 cudas', '512GB SSD + 4TB 7200 rpm', 1, '2020-04-10', '2020-04-10'),
	(2, 'ThinkStation P700', '2 x Xeon E5-2690, 24 cores/48 threads', '128 GB ECC', 'Quadro P5000, 256 bits, 16GB, 2560 cudas', '512GB SSD + 4TB 7200 rpm', 1, '2020-04-10', '2020-04-10'),
	(3, 'WorkStation Z640', 'Xeon E5-2690, 12 cores/24 threads', '128 GB ECC', 'Quadro P5000, 256 bits, 16GB, 2560 cudas', '1TB SSD + 4TB 7200 rpm', 1, '2020-04-10', '2020-04-10'),
	(4, 'WorkStation Precision 7920  ', 'Xeon Silver  4114, 10 cores/20 threads', '128 GB 2666 ECC', 'Quadro P6000, 384 bits, 24GB, 3840 cudas', '512GB SSD + 2TB 7200 rpm', 1, '2020-04-10', '2020-04-10');
/*!40000 ALTER TABLE `equipo` ENABLE KEYS */;

-- Dumping structure for table tesis.evento
CREATE TABLE IF NOT EXISTS `evento` (
  `idEvento` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(500) NOT NULL,
  `ciudad` varchar(45) DEFAULT NULL,
  `pais` varchar(45) DEFAULT NULL,
  `ciudadEN` varchar(45) DEFAULT NULL,
  `paisEN` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idEvento`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.evento: ~1 rows (approximately)
/*!40000 ALTER TABLE `evento` DISABLE KEYS */;
INSERT INTO `evento` (`idEvento`, `nombre`, `ciudad`, `pais`, `ciudadEN`, `paisEN`) VALUES
	(1, 'Simposio Peruano de Física', 'Trujillo', 'Perú', 'Trujillo', 'Peru');
/*!40000 ALTER TABLE `evento` ENABLE KEYS */;

-- Dumping structure for table tesis.fuentefinanciamiento
CREATE TABLE IF NOT EXISTS `fuentefinanciamiento` (
  `idFuenteFinanciamiento` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`idFuenteFinanciamiento`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.fuentefinanciamiento: ~2 rows (approximately)
/*!40000 ALTER TABLE `fuentefinanciamiento` DISABLE KEYS */;
INSERT INTO `fuentefinanciamiento` (`idFuenteFinanciamiento`, `nombre`) VALUES
	(1, 'VRIP'),
	(4, 'Sin fuente');
/*!40000 ALTER TABLE `fuentefinanciamiento` ENABLE KEYS */;

-- Dumping structure for table tesis.genero
CREATE TABLE IF NOT EXISTS `genero` (
  `idGenero` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idGenero`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.genero: ~2 rows (approximately)
/*!40000 ALTER TABLE `genero` DISABLE KEYS */;
INSERT INTO `genero` (`idGenero`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Masculino', '2020-06-18', '2020-06-18'),
	(2, 'Femenino', '2020-06-18', '2020-06-18');
/*!40000 ALTER TABLE `genero` ENABLE KEYS */;

-- Dumping structure for table tesis.grupo
CREATE TABLE IF NOT EXISTS `grupo` (
  `idGrupo` int NOT NULL AUTO_INCREMENT,
  `quienesSomosResumenEN` longtext NOT NULL,
  `quienesSomosResumen` varchar(3000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `direccion` varchar(500) DEFAULT NULL,
  `correo` varchar(45) DEFAULT NULL,
  `telefono` varchar(45) DEFAULT NULL,
  `nombreGrupo` varchar(200) DEFAULT NULL,
  `nombreGrupo2` varchar(200) DEFAULT NULL,
  `facilidadesRecursosFoto` varchar(45) DEFAULT NULL,
  `facilidadesRecursos` varchar(1000) DEFAULT NULL,
  `facilidadesRecursosEN` varchar(1000) DEFAULT NULL,
  `trabajosFuturos` longtext,
  `trabajosFuturosEN` longtext,
  `logoFooter` varchar(45) DEFAULT NULL,
  `logoHeader` varchar(45) DEFAULT NULL,
  `seccionPublicaciones` varchar(300) DEFAULT NULL,
  `seccionPublicacionesEN` varchar(300) DEFAULT NULL,
  `seccionProyectos` varchar(300) DEFAULT NULL,
  `seccionProyectosEN` varchar(300) DEFAULT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaActualizacion` date NOT NULL,
  PRIMARY KEY (`idGrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.grupo: ~1 rows (approximately)
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
INSERT INTO `grupo` (`idGrupo`, `quienesSomosResumenEN`, `quienesSomosResumen`, `direccion`, `correo`, `telefono`, `nombreGrupo`, `nombreGrupo2`, `facilidadesRecursosFoto`, `facilidadesRecursos`, `facilidadesRecursosEN`, `trabajosFuturos`, `trabajosFuturosEN`, `logoFooter`, `logoHeader`, `seccionPublicaciones`, `seccionPublicacionesEN`, `seccionProyectos`, `seccionProyectosEN`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'GMCAN applies and develops modern computational tools to understand, predict and control physical and chemical processes in the range of molecular sizes up to the mesoscale.', 'El GMCAN aplica y desarrolla modernas herramientas computacionales para entender, predecir y controlar los procesos físicos y químicos en el rango de tamaños moleculares hasta la mesoescala.', 'Germán Amézaga N° 375 - Edificio Jorge Basadre.\r\nCiudad Universitaria, Lima, Perú', 'gmcan@unmsm.edu.pe', '+51 989994607', 'GMCAN', 'GMCAN', 'lv3RQ7s_-nrrdEheuxaHCy1l.png', 'El GMCAN se ubica en el tercer piso del edificio del Instituto de Investigación de Física. Cuenta con un ambiente multiuso con espacio para investigadores, tesistas y estudiantes. Contamos con equipo computacional para el trabajo de las actividades de investigación, tanto de proyectos como de tesis de pre y postgrado.  Asimismo, forma parte del grupo el Laboratorio de Modelamiento y Simulación Computacional (LMSC). En el que contamos con recurso computacional, equipados con estaciones de trabajo de alto desempeño. Lo que nos permite garantizar los estudios mediante simulaciones de sistemas complejos.', 'The GMCAN is located on the third floor of the Physics Research Institute building. It has a multipurpose environment with space for researchers, thesis students and students. We have computer equipment for the work of research activities, both undergraduate and graduate projects and theses. Likewise, the Computational Modeling and Simulation Laboratory (LMSC) is part of the group. In which we have computational resources, equipped with high-performance workstations. This allows us to guarantee studies through simulations of complex systems.', '<p>● Estudiar la influencia de dopantes sobre las propiedades mec&aacute;nicas y electr&oacute;nicas de las GNR.</p>\n\n<p>● Estudiar las propiedades mec&aacute;nicas de las nanohojas de grafeno monocapa con nanoporos funcionalizadas de igual tama&ntilde;o distribuidos aleatoriamente y de forma ordenada.</p>\n\n<p>●&nbsp;Estudiar las propiedades mec&aacute;nicas de las nanohojas de grafeno multicapa con nanoporos funcionalizadas.</p>\n\n<p>●&nbsp;Estudiar procesos de transporte del agua por la membrana de grafeno multicapa nanoporoso.</p>\n\n<p>●&nbsp;Estudiar las condiciones m&aacute;s &oacute;ptimas de generaci&oacute;n de nanoporos mediante el bombardeo con &aacute;tomos y iones energ&eacute;ticos mediante la simulaci&oacute;n con DM</p>\n\n<p>●&nbsp;Estudiar el efecto del tama&ntilde;o y forma de las NPs sobre las propiedades magn&eacute;ticas (Tc, Hc).</p>\n\n<p>● Efecto de la anisotrop&iacute;a superficial sobre las propiedades magn&eacute;ticas .</p>\n\n<p>●&nbsp;Procesos de relajaci&oacute;n en sistemas SPM.</p>\n\n<p>●&nbsp;Estudio de nanopart&iacute;culas magn&eacute;ticas inmersa en metales no-magn&eacute;ticas.</p>\n\n<p>●&nbsp;Estudiar las propiedades de multicapas metal magn&eacute;tico/tierra rara.</p>\n\n<p>●&nbsp;Estudio de las propiedades superferromagn&eacute;ticas de sistemas bidimensionales.</p>\n\n<p>●&nbsp;Estudio de la formaci&oacute;n de skyrmions magn&eacute;ticos, mediante simulaci&oacute;n atom&iacute;stica</p>\n', '<p>● Study the influence of dopants on the mechanical and electronic properties of GNR.</p>\n\n<p>● Study the mechanical properties of monolayer graphene nanosheets with functionalized nanopores of the same size randomly distributed in an orderly manner.</p>\n\n<p>● Study the mechanical properties of multilayer graphene nanosheets with functionalized nanopores.</p>\n\n<p>● Study water transport processes through the nanoporous multilayer graphene membrane.</p>\n\n<p>● Study the most optimal conditions for the generation of nanopores through bombardment with energetic atoms and ions through simulation with DM</p>\n\n<p>● Study the effect of the size and shape of NPs on the magnetic properties (Tc, Hc).</p>\n\n<p>● Effect of surface anisotropy on magnetic properties.</p>\n\n<p>● Relaxation processes in SPM systems.</p>\n\n<p>● Study of magnetic nanoparticles immersed in non-magnetic metals.</p>\n\n<p>● Study the properties of magnetic metal / rare earth multilayers.</p>\n\n<p>● Study of the superferromagnetic properties of two-dimensional systems.</p>\n\n<p>● Study of the formation of magnetic skyrmions, through atomistic simulation</p>\n', 'kbmXMFYegNKu49-_y84LUyIR.png', 'Q9RKNAmaT21wPRKDGxn6HQci.png', 'Los resultados de nuestras investigaciones son publicadas en libros/artículos revistas indexadas de alto impacto.', 'The results of our research are published in high impact indexed books / journal articles.', 'Nuestro grupo desarrolla proyectos de investigación regularmente con fondos concursables locales y externos. Fondos que también incluyen para el desarrollo de tesis de estudiantes de pre y posgrado.', 'Our group develops research projects regularly with local and external competitive funds. Funds that also include for the development of theses of undergraduate and graduate students.', '2020-01-28', '2020-01-19');
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;

-- Dumping structure for table tesis.lineasinvestigacion
CREATE TABLE IF NOT EXISTS `lineasinvestigacion` (
  `idLineasInvestigacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(500) NOT NULL,
  `nombreEN` varchar(500) NOT NULL,
  `descripcion` varchar(5000) DEFAULT NULL,
  `descripcionEN` varchar(5000) DEFAULT NULL,
  `foto` varchar(150) DEFAULT NULL,
  `grupo_idGrupo` int NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idLineasInvestigacion`),
  KEY `fk_lineasInvestigacion_grupo1_idx` (`grupo_idGrupo`),
  CONSTRAINT `fk_lineasInvestigacion_grupo1` FOREIGN KEY (`grupo_idGrupo`) REFERENCES `grupo` (`idGrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.lineasinvestigacion: ~3 rows (approximately)
/*!40000 ALTER TABLE `lineasinvestigacion` DISABLE KEYS */;
INSERT INTO `lineasinvestigacion` (`idLineasInvestigacion`, `nombre`, `nombreEN`, `descripcion`, `descripcionEN`, `foto`, `grupo_idGrupo`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Propiedades Estructurales de Nanopartículas', 'Structural Properties of Nanoparticles', 'Se estudian las diferentes propiedades físicas de las nanopartículas y nanomateriales tanto de sistemas monocomponentes como multicomponentes, prestando especial atención a las propiedades estructurales, térmicas, mecánicas, superficiales , así como las transiciones de fases. Asimismo, evaluamos la estabilidad térmica de estos nanosistemas variando factores como tamaño, composición y patrón de mezcla (orden químico). Además, este tipo de estudios los realizamos mediante el método de simulación de dinámica molecular. Vale mencionar que las aplicaciones de estos sistemas dependen de las propiedades obtenidas.', 'The different physical properties of nanoparticles and nanomaterials of both monocomponent and multicomponent systems are studied, paying special attention to structural, thermal, mechanical and surface properties, as well as phase transitions. Likewise, we evaluate the thermal stability of these nanosystems by varying factors such as size, composition and mixing pattern (chemical order). In addition, we carry out this type of study using the molecular dynamics simulation method. It is worth mentioning that the applications of these systems depend on the properties obtained.', '21xQ9KAslQQONJZR1Rl918WV.jpg', 1, '2020-03-18', '2020-03-18'),
	(2, 'Nanosistemas hexagonales tipo-grafeno y tipo-nanotubos de carbono', 'Hexagonal graphene-type and carbon nanotube-type nano-systems', 'En esta línea de investigación estudiamos las propiedades mecánicas y térmicas de nanosistemas hexagonales 2D tipo-grafeno y 1D tipo-nanotubos de carbono (como nitruro de boro, grafano, fosforeno negro, etc). Estos estudios realizamos, por ejemplo, variando la concentración de dopaje o generando defectos estructurales. Por un lado, este tipo de estudios se realizan empleando simulaciones de dinámica molecular. Por otro lado, para el cálculo de propiedades electrónicas y de transporte electrónico de estos nanosistemas hexagonales 2D y 1D realizamos mediante cálculos auto-consistentes DFT. Vale mencionar que las aplicaciones de estos sistemas dependen de las propiedades obtenidas.', 'In this research line, we study the mechanical and thermal properties of 2D graphene-type hexagonal nanosystems and 1D carbon-nanotube type (such as boron nitride, graphane, black phosphorene, etc.). We carry out these studies, for example, by varying the doping concentration or generating structural defects. On the one hand, these types of studies are carried out using molecular dynamics simulations. On the other hand, for the calculation of electronic properties and electronic transport of these 2D and 1D hexagonal nanosystems we performed DFT through self-consistent calculations. It is worth mentioning that the applications of these systems depend on the properties obtained.', '-pWaIueHn6fFig0zkw7WO8CS.jpg', 1, '2020-03-18', '2020-03-18'),
	(3, 'Nanomagnetismo y aplicaciones de materiales magnéticos', 'Nanomagnetism and applications of magnetic materials', 'En esta línea estudiamos las propiedades magnéticas de nanoestructuras magnéticas basadas principalmente en Fe. Sistema de nanopartículas, tipo core-shell, multicapas y aleaciones son estudiadas en función de parámetros controlables como la temperatura y campo magnético aplicado.', 'In this line, we study the magnetic properties of magnetic nanostructures based mainly on Fe. Nanoparticle system, core-shell type, multilayers and alloys are studied based on controllable parameters such as temperature and applied magnetic field.', 'r9nFSdE3KQLD7eUw4jbhHn9n.jpg', 1, '2020-03-18', '2020-03-18');
/*!40000 ALTER TABLE `lineasinvestigacion` ENABLE KEYS */;

-- Dumping structure for table tesis.metodo
CREATE TABLE IF NOT EXISTS `metodo` (
  `idMetodo` int NOT NULL AUTO_INCREMENT,
  `nombreEN` varchar(500) NOT NULL,
  `nombre` varchar(500) NOT NULL,
  `descripcion` varchar(5000) NOT NULL,
  `descripcionEN` varchar(5000) DEFAULT NULL,
  `foto` varchar(300) DEFAULT NULL,
  `grupo_idGrupo` int NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idMetodo`),
  KEY `fk_metodos_grupo1_idx` (`grupo_idGrupo`),
  CONSTRAINT `fk_metodos_grupo1` FOREIGN KEY (`grupo_idGrupo`) REFERENCES `grupo` (`idGrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.metodo: ~4 rows (approximately)
/*!40000 ALTER TABLE `metodo` DISABLE KEYS */;
INSERT INTO `metodo` (`idMetodo`, `nombreEN`, `nombre`, `descripcion`, `descripcionEN`, `foto`, `grupo_idGrupo`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Molecular Dynamics', 'Dinámica Molecular', '<p>Din&aacute;mica molecular (MD del ingl&eacute;s <em>molecular dynamics</em>) cl&aacute;sica es un potente m&eacute;todo determin&iacute;stico de simulaci&oacute;n computacional que consiste en la integraci&oacute;n num&eacute;rica de las ecuaciones diferenciales de movimiento de Newton de N part&iacute;culas que interact&uacute;an mediante cierto potencial de interacci&oacute;n. Permite determinar las coordenadas y velocidades de todas las part&iacute;culas en cada instante de tiempo discretizado. A partir de las coordenadas y velocidades se calculan las magnitudes de inter&eacute;s como la temperatura, presi&oacute;n, funci&oacute;n de distribuci&oacute;n radial, funciones de correlaci&oacute;n de velocidades, curvas calor&iacute;ficas, calor espec&iacute;fico, etc. Este m&eacute;todo es ampliamente utilizado en diversas disciplinas como física, química, ciencia de materiales, biología, geología, entre otras. Además, MD es útil para estudiar sistemas orgánicos e inorgánicos de gran tamaño, incluyendo otros estados en que se encuentre el sistema en estudio, es decir, se puede determinar las propiedades energéticas, estructurales, mecánicas y térmicas de un sistemas de partículas en equilibrio y fuera de este.</p>\n', '<p>Classical molecular dynamics (MD) is a powerful deterministic method of computational simulation that consists of the numerical integration of Newton&#39;s differential equations of motion of N particles that interact through a certain interaction potential. It allows determining the coordinates and velocities of all the particles at each discretized instant of time. From the coordinates and speeds, the quantities of interest are calculated such as temperature, pressure, radial distribution function, speed correlation functions, heat curves, specific heat, etc. This method is widely used in various disciplines such as physics, chemistry, materials science, biology, geology, among others. In addition, MD is useful to study large organic and inorganic systems, including other states in which the system under study is found, that is, it is possible to determine the energetic, structural, mechanical and thermal properties of a systems of particles in equilibrium and out of this.</p>\n', '8PFyFWOrD5Njhv-cIEyW3oJG.jpg', 1, '2020-04-09', '2020-04-09'),
	(2, 'Density Functional Theory', 'Teoría del Funcional de la Densidad (DFT)', '<p>La teor&iacute;a del funcional de la densidad (DFT, del ingl&eacute;s density functional theory) es una de las teorías más populares y exitosas en la comunidad de la Física, Química, y Ciencia de materiales y que hoy en día se utiliza ampliamente. Esta teor&iacute;a se refiere a que cualquier propiedad de un sistema de partículas que interactúan en un potencial externo puede describirse mediante una funcional de la densidad electrónica del estado fundamental. P. Hohenberg y W. Kohn dieron en 1964 la prueba de la existencia de tales funcionales, pero sin ninguna sugerencia sobre la metodología a seguir para su implementación. Luego, W. Kohn y L.-J. Sham produjeron un marco interesante en 1965, donde el problema intratable de muchos cuerpos de los electrones que interactúan en un potencial externo estático se reduce a un problema manejable de electrones que no interact&uacute;an que se mueven en un potencial efectivo. Actualmente, la simplicidad del método ha hecho posible estudiar la estructura electrónica de diversos sistemas cuánticos multi-partícula convirti&eacute;ndose en una potente metodología de cálculo.</p>\n', '<p>Density Functional Theory (DFT) is one of the most popular and successful theories in the Physics, Chemistry, and Materials Science community and is widely used today. This theory refers to the fact that any property of a system of particles that interact in an external potential can be described by a functional of the electron density of the ground state. P. Hohenberg and W. Kohn gave proof of the existence of such functionalities in 1964, but without any suggestion about the methodology to be followed for their implementation. Later, W. Kohn and L.-J. Sham produced an interesting framework in 1965, where the intractable problem of many bodies of electrons interacting at a static external potential boils down to a manageable problem of non-interacting electrons moving at an effective potential. Currently, the simplicity of the method has made it possible to study the electronic structure of various multi-particle quantum systems, becoming a powerful calculation methodology.</p>\n', 'Sh_G7dIrHcM2n8efXkh1zOvP.jpg', 1, '2020-04-09', '2020-04-09'),
	(3, 'Monte Carlo Method', 'Método Monte Carlo', '<p>El m&eacute;todo de Monte Carlo (MC) ha tenido gran relevancia en la f&iacute;sica de los &uacute;ltimos tiempos en magnetismo, ya que provee una forma natural para simular los efectos de la temperatura sin usar m&eacute;todos din&aacute;micos debido a que converge r&aacute;pidamente al equilibrio. La t&eacute;cnica requiere generar grandes cantidades de n&uacute;meros aleatorios y contar la fracci&oacute;n de ellos obedeciendo ciertas condiciones. La manera de contar y las condiciones impuestas definen la implementaci&oacute;n del algoritmo num&eacute;rico.</p>\n', '<p>The Monte Carlo (MC) method has had great relevance in recent times in magnetism physics, as it provides a natural way to simulate the effects of temperature without using dynamic methods because it quickly converges to equilibrium. The technique requires generating large amounts of random numbers and counting the fraction of them obeying certain conditions. The way of counting and the conditions imposed define the implementation of the numerical algorithm.</p>\n', 'zeXAU4ovZqZlv5eTYXx6gRTf.jpeg', 1, '2020-04-09', '2020-04-09'),
	(8, 'Spin dynamics', 'Dinámica del spin', '<p>La din&aacute;mica de esp&iacute;n&nbsp; (SD, del ingl&eacute;s <em>spin dynamics</em>) es un m&eacute;todo computacional usado para modelar la evoluci&oacute;n en el tiempo de un sistema magn&eacute;tico. En este m&eacute;todo se incluyen efectos como precesi&oacute;n, procesos ultrarr&aacute;pidos, ciclos de hist&eacute;resis din&aacute;mico. En la simulaci&oacute;n se utiliza la ecuaci&oacute;n de movimiento de Landau-Lifshitz-Gilbert (LLG) junto con la din&aacute;mica de Langevin para realizar simulaciones a temperatura finita.</p>\n', '<p>Spin dynamics (SD) is a computational method used to model the evolution in time of a magnetic system. Effects such as precession, ultra-fast processes, dynamic hysteresis loops are included in this method. In the simulation, the Landau-Lifshitz-Gilbert (LLG) equation of motion is used together with Langevin dynamics to perform simulations at finite temperature.</p>\n', 'EJ7bWHqYMIZtMJtvo6_nQlFm.jpg', 1, NULL, NULL);
/*!40000 ALTER TABLE `metodo` ENABLE KEYS */;

-- Dumping structure for table tesis.moneda
CREATE TABLE IF NOT EXISTS `moneda` (
  `idMoneda` int NOT NULL AUTO_INCREMENT,
  `simbolo` varchar(10) NOT NULL,
  PRIMARY KEY (`idMoneda`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.moneda: ~2 rows (approximately)
/*!40000 ALTER TABLE `moneda` DISABLE KEYS */;
INSERT INTO `moneda` (`idMoneda`, `simbolo`) VALUES
	(1, 'S/.'),
	(2, '$');
/*!40000 ALTER TABLE `moneda` ENABLE KEYS */;

-- Dumping structure for table tesis.noticia
CREATE TABLE IF NOT EXISTS `noticia` (
  `idNoticia` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(300) DEFAULT NULL,
  `tituloEN` varchar(300) DEFAULT NULL,
  `resumen` varchar(3000) DEFAULT NULL,
  `resumenEN` varchar(3000) DEFAULT NULL,
  `cuerpo` varchar(5000) DEFAULT NULL,
  `cuerpoEN` varchar(5000) DEFAULT NULL,
  `estado` tinyint DEFAULT NULL,
  `fechaPublicacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `foto` varchar(45) DEFAULT NULL,
  `prioridad` int DEFAULT NULL,
  `autorPublicacion` varchar(15) DEFAULT NULL,
  `tipoNoticia_idtipoNoticia` int DEFAULT NULL,
  PRIMARY KEY (`idNoticia`),
  KEY `fk_noticia_usuario1_idx` (`autorPublicacion`),
  KEY `fk_noticia_tipoNoticia1_idx` (`tipoNoticia_idtipoNoticia`),
  CONSTRAINT `fk_noticia_tipoNoticia1` FOREIGN KEY (`tipoNoticia_idtipoNoticia`) REFERENCES `tiponoticia` (`idtipoNoticia`),
  CONSTRAINT `fk_noticia_usuario1` FOREIGN KEY (`autorPublicacion`) REFERENCES `usuario` (`DNI`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.noticia: ~6 rows (approximately)
/*!40000 ALTER TABLE `noticia` DISABLE KEYS */;
INSERT INTO `noticia` (`idNoticia`, `titulo`, `tituloEN`, `resumen`, `resumenEN`, `cuerpo`, `cuerpoEN`, `estado`, `fechaPublicacion`, `fechaActualizacion`, `fechaCreacion`, `foto`, `prioridad`, `autorPublicacion`, `tipoNoticia_idtipoNoticia`) VALUES
	(50, 'Esta es otra noticia de prueba, ¡muy pronto habrán novedades!', 'This is another test news. Upgrades soon!', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&nbsp;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&nbsp;x2x^2</p>\n', 0, '2020-10-01', NULL, NULL, '-Qyq56wp6Jn7aSGDRvmpgOlJ.jpg', NULL, '74819923', 83),
	(51, 'Esta es la última noticia de prueba', 'This is the last test news', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&nbsp;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&nbsp;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n', 0, '2020-08-04', NULL, NULL, 'AlbjXiUPZG-bxG-t0d5kzAAj.jpg', NULL, '73184556', 83),
	(52, 'Esta es la última noticia de prueba', 'test', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '<p>Test</p>\n', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n', 0, '2020-09-29', NULL, NULL, 'Eag0PVtvp5COjORPisCzR6VA.jpg', NULL, '73184556', 1),
	(53, '¿Cómo gestionar tu tiempo como estudiante de ciencias e ingeniería?', 'Managing your Time as a Science & Engineering Student', '"No tengo tiempo", "Desearía tener más tiempo para presentar este trabajo", "Espero que el profe cambie la fecha de entrega." Estas son frases comunes que hemos escuchado siendo estudiantes de pregrado. Independientemente de la ubicación geográfica, ser estudiante universitario me ha mostrado problemas que los estudiantes de pregrado enfrentan comúnmente referido a su gestión del tiempo. ', '\'I don\'t have enough time\', \'I wish I had two more days for doing this\', \'I hope the professor gives us an extension.\' These are common phrases I heard as an undergraduate student in physics and engineering. Regardless on the location, being a student in both the US and Peru showed me common problems undergrads face regularly.', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.</p>\n\n<p>Suspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.</p>\n', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.</p>\n\n<p>Suspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.</p>\n', 1, '2021-01-08', NULL, NULL, '3ptnN7cFuw4DCtFXsGh8THC_.jpg', NULL, '73184556', 85),
	(55, '¿Cómo puede ayudar el grafeno en la lucha contra el Coronavirus?', 'How can graphene assist in the war on Coronavirus?', 'A medida que los investigadores y las empresas de todo el mundo se dispusieron a luchar contra la pandemia del coronavirus, muchos están revisando el grafeno como un material con potencial para ayudar a ganar esta lucha. Las razones de tal potencial podrían encontrarse en las conocidas propiedades antibacterianas / antivirales del grafeno, sus rasgos beneficiosos para sensores y dispositivos médicos y más.', 'As researchers and companies all over the world set out to battle the Coronavirus pandemic, many are revisiting graphene as a material with potential for helping to win this fight. The reasons for such potential could be found in graphene\'s known antibacterial/antiviral properties, its beneficial traits for medical sensors and devices and more.', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.</p>\n\n<p>Suspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.</p>\n', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.</p>\n\n<p>Suspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.</p>\n', 1, '2020-12-29', NULL, NULL, 'bb9DUeii6XSjPfVvZHqQWT1m.jpg', NULL, '06766048', 84),
	(56, 'Diseño y simulación de nanomateriales: Fundamento teórico y aplicaciones', 'Nanomaterials Design and Simulation: From overview to applications', 'El Dr. Gustavo Cuba Supanta nos acompañará en la primera sesión de Workshop del Club de Nanotecnología promovido por nuestra universidad y el grupo de Métodos Computacionales Aplicado a Nanomateriales.', 'Dr. Gustavo Cuba Supanta will join us in the first workshop session of the Nanotechnology Club promoted by our university and the GMCAN.', '<ul>\n	<li>F&iacute;sico por la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC).</li>\n	<li>Magister y doctor en F&iacute;sica por la Universidad Nacional Mayor de San Marcos (UNMSM), su &aacute;rea de investigaci&oacute;n es el estudio de las propiedades f&iacute;sicas y de transporte de materiales mediante m&eacute;todos computacionales.</li>\n	<li>Actualmente, es integrante del grupo de m&eacute;todos computacionales aplicados a nanomateriales (GMCAN) de la Facultad de Ciencias F&iacute;sicas de la UNMSM.</li>\n</ul>\n', '<ul>\n	<li>Physicist by the National University of San Antonio Abad del Cusco (UNSAAC).</li>\n	<li>Magister and PhD in Physics from the Universidad Nacional Mayor de San Marcos (UNMSM), his research area is the study of the physical and transport properties of materials through computational methods.</li>\n	<li>Currently, he is a member of the group of computational methods applied to nanomaterials (GMCAN) of the Faculty of Physical Sciences of the UNMSM.</li>\n</ul>\n', 1, '2021-01-23', NULL, NULL, 'ndKNxjxt9rHPMFfKdWDqYbgn.jpg', NULL, '06766048', 85);
/*!40000 ALTER TABLE `noticia` ENABLE KEYS */;

-- Dumping structure for table tesis.permiso
CREATE TABLE IF NOT EXISTS `permiso` (
  `idPermiso` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaActualización` date NOT NULL,
  PRIMARY KEY (`idPermiso`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.permiso: ~6 rows (approximately)
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` (`idPermiso`, `nombre`, `fechaCreacion`, `fechaActualización`) VALUES
	(1, 'Noticias', '2020-05-03', '2020-05-03'),
	(2, 'Proyectos', '2020-05-03', '2020-05-03'),
	(3, 'Publicaciones', '2020-05-03', '2020-05-03'),
	(4, 'Miembros', '2020-05-03', '2020-05-03'),
	(5, 'Contenidos', '2020-05-03', '2020-05-03'),
	(6, 'Analíticas', '2020-05-03', '2020-05-03');
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;

-- Dumping structure for table tesis.prefijo
CREATE TABLE IF NOT EXISTS `prefijo` (
  `idPrefijo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idPrefijo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.prefijo: ~6 rows (approximately)
/*!40000 ALTER TABLE `prefijo` DISABLE KEYS */;
INSERT INTO `prefijo` (`idPrefijo`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Dr.', '2020-02-15', '2020-02-15'),
	(2, 'Mgtr.', NULL, NULL),
	(3, 'Lic.', '2020-02-15', '2020-02-15'),
	(4, 'Ing.', '2020-02-15', '2020-02-15'),
	(5, 'Bachiller', NULL, NULL),
	(6, 'Ninguno', NULL, NULL);
/*!40000 ALTER TABLE `prefijo` ENABLE KEYS */;

-- Dumping structure for table tesis.proyecto
CREATE TABLE IF NOT EXISTS `proyecto` (
  `idProyecto` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(3000) NOT NULL,
  `tituloEN` varchar(3000) DEFAULT NULL,
  `codigo` varchar(45) NOT NULL,
  `montoFinanciado` varchar(100) NOT NULL,
  `descripcion` varchar(4000) NOT NULL,
  `descripcionEN` varchar(4000) DEFAULT NULL,
  `estado` int DEFAULT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date DEFAULT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `lineasInvestigacion_idLineasInvestigacion` int NOT NULL,
  `moneda_idMoneda` int NOT NULL,
  `fuenteFinanciamiento_idFuenteFinanciamiento` int NOT NULL,
  PRIMARY KEY (`idProyecto`),
  KEY `fk_proyectos_lineasInvestigacion1_idx` (`lineasInvestigacion_idLineasInvestigacion`),
  KEY `fk_proyecto_moneda1_idx` (`moneda_idMoneda`),
  KEY `fk_proyecto_fuenteFinanciamiento1_idx` (`fuenteFinanciamiento_idFuenteFinanciamiento`),
  CONSTRAINT `fk_proyecto_fuenteFinanciamiento1` FOREIGN KEY (`fuenteFinanciamiento_idFuenteFinanciamiento`) REFERENCES `fuentefinanciamiento` (`idFuenteFinanciamiento`),
  CONSTRAINT `fk_proyecto_moneda1` FOREIGN KEY (`moneda_idMoneda`) REFERENCES `moneda` (`idMoneda`),
  CONSTRAINT `fk_proyectos_lineasInvestigacion1` FOREIGN KEY (`lineasInvestigacion_idLineasInvestigacion`) REFERENCES `lineasinvestigacion` (`idLineasInvestigacion`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.proyecto: ~1 rows (approximately)
/*!40000 ALTER TABLE `proyecto` DISABLE KEYS */;
INSERT INTO `proyecto` (`idProyecto`, `titulo`, `tituloEN`, `codigo`, `montoFinanciado`, `descripcion`, `descripcionEN`, `estado`, `fechaInicio`, `fechaFin`, `fechaCreacion`, `fechaActualizacion`, `lineasInvestigacion_idLineasInvestigacion`, `moneda_idMoneda`, `fuenteFinanciamiento_idFuenteFinanciamiento`) VALUES
	(28, 'Influencia de la concentración de carbono sobre las propiedades mecánicas y térmicas en el sistema híbrido y hexagonal de Boro-Nitrógeno-Carbono (h-BNC)', 'xx', 'B20130811', '62000', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.\n\nSuspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non libero congue, facilisis massa sed, tempus neque. Cras et venenatis arcu, vel feugiat nulla. Duis tincidunt, ex vel porta mattis, eros nulla bibendum dui, vitae varius ipsum arcu eu dolor. Mauris lobortis erat id turpis consequat iaculis. Duis dignissim sapien sed urna volutpat, vel feugiat enim sollicitudin. Ut non lorem non risus iaculis venenatis at nec ipsum. Suspendisse potenti. Vivamus est sapien, placerat eu velit vel, pretium rutrum nulla. Cras sit amet purus id lectus tempor consequat. Nunc pretium vel tortor eu aliquam. Suspendisse vestibulum est ut est tempus porta. Nulla pretium rhoncus finibus. Quisque pretium dui nec libero pharetra rutrum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec eleifend felis sit amet molestie auctor.\n\nSuspendisse accumsan tincidunt libero, eget semper ligula tincidunt eget. Sed eu orci nulla. Donec neque arcu, euismod commodo sapien in, dapibus consequat est. Sed mauris est, pulvinar id ipsum non, congue faucibus massa. Cras euismod elit ac quam placerat, eget blandit odio euismod. Donec molestie tortor nec lectus pretium ultrices. Quisque lobortis mauris non justo pellentesque, nec vestibulum nisl viverra. Sed molestie lectus sed lectus tristique gravida.', 1, '2020-06-01', NULL, NULL, NULL, 2, 1, 1);
/*!40000 ALTER TABLE `proyecto` ENABLE KEYS */;

-- Dumping structure for table tesis.publicacion
CREATE TABLE IF NOT EXISTS `publicacion` (
  `idPublicacion` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(2200) NOT NULL,
  `archivo` varchar(45) DEFAULT NULL,
  `resumen` varchar(5000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `resumenEN` varchar(5000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nroRevista` int DEFAULT NULL,
  `DOI` varchar(45) DEFAULT NULL,
  `fechaPublicacion` date NOT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `tipoPublicacion_idTipoPublicacion` int NOT NULL,
  `revista_idRevista` int DEFAULT NULL,
  `universidad_idUniversidad` int DEFAULT NULL,
  `evento_idEvento` int DEFAULT NULL,
  `tipoTesis_idTipoTesis` int DEFAULT NULL,
  PRIMARY KEY (`idPublicacion`),
  KEY `fk_publicacion_tipoPublicacion1_idx` (`tipoPublicacion_idTipoPublicacion`),
  KEY `fk_publicacion_revista1_idx` (`revista_idRevista`),
  KEY `fk_publicacion_universidad1_idx` (`universidad_idUniversidad`),
  KEY `fk_publicacion_evento1_idx` (`evento_idEvento`),
  KEY `fk_publicacion_tipoTesis1_idx` (`tipoTesis_idTipoTesis`),
  CONSTRAINT `fk_publicacion_evento1` FOREIGN KEY (`evento_idEvento`) REFERENCES `evento` (`idEvento`),
  CONSTRAINT `fk_publicacion_revista1` FOREIGN KEY (`revista_idRevista`) REFERENCES `revista` (`idRevista`),
  CONSTRAINT `fk_publicacion_tipoPublicacion1` FOREIGN KEY (`tipoPublicacion_idTipoPublicacion`) REFERENCES `tipopublicacion` (`idTipoPublicacion`),
  CONSTRAINT `fk_publicacion_tipoTesis1` FOREIGN KEY (`tipoTesis_idTipoTesis`) REFERENCES `tipotesis` (`idTipoTesis`),
  CONSTRAINT `fk_publicacion_universidad1` FOREIGN KEY (`universidad_idUniversidad`) REFERENCES `universidad` (`idUniversidad`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.publicacion: ~3 rows (approximately)
/*!40000 ALTER TABLE `publicacion` DISABLE KEYS */;
INSERT INTO `publicacion` (`idPublicacion`, `titulo`, `archivo`, `resumen`, `resumenEN`, `nroRevista`, `DOI`, `fechaPublicacion`, `fechaActualizacion`, `fechaCreacion`, `tipoPublicacion_idTipoPublicacion`, `revista_idRevista`, `universidad_idUniversidad`, `evento_idEvento`, `tipoTesis_idTipoTesis`) VALUES
	(39, 'Simulación de curvas M(H) mediante la implementación del algoritmo Metropolis-Hastings basado en el método de cadena de Markov Monte Carlo', NULL, 'Se expone la aplicación directa de los métodos computacionales de simulación Monte Carlo mediante la implementación del algoritmo Metrópolis-Hastings para la simulación del proceso de generación de curvas M(H) para un material ferromagnético. Se presenta un esquema de un sistema de nanopartículas magnéticas idénticas no interactuantes con distribución aleatoria del momento magnético. Se presenta un estudio sistemático de las curvas de magnetización, la cual varía con el tiempo al verse expuesto a campos magnéticos externos como una función del grado de libertad del momento magnético por paso Monte Carlo. Adicionalmente, el efecto de la temperatura sobre el ángulo de prueba es estudiado. El desarrollo de la implementación fue realizado en Python utilizando código Fortran embebido gracias a la herramienta F2PY.', 'The direct application of the computational Monte Carlo simulation methods through the implementation of the Metropolis-Hastings algorithm for the simulation of the M (H) curve generation process for a ferromagnetic material is exposed. A diagram of a system of non-interacting identical magnetic nanoparticles with random distribution of the magnetic moment is presented. A systematic study of magnetization curves is presented, which varies with time when exposed to external magnetic fields as a function of the degree of freedom of the magnetic moment per Monte Carlo step. Additionally, the effect of temperature on the test angle is studied. The development of the implementation was done in Python using embedded Fortran code thanks to the F2PY tool.', NULL, NULL, '2019-11-18', NULL, NULL, 3, NULL, NULL, 1, NULL),
	(41, 'Formaldehyde trapping by radical initiated reaction on hydrogenated boron nitride ', 'GymxaQPxRqoXvImvfZcKWAfw.pdf', 'Using density functional theory, we have studied the trapping of formaldehyde on hydrogenated boron nitride nanosheets. On the nitrogen terminated side, the formaldehyde molecule is physisorbed at a distance of ~3.1 Å on top of a N atom. A calculation of the adsorption energy, as function of vertical separation between the molecule and the substrate, shows that closer to the surface, there is a strong repulsion due to the electronegativity of the N and O atoms. On the other hand, the trapping of formaldehyde by the substrate on the boron terminated surface is very favorable. The reaction of a single molecule is described by calculating the minimum energy pathway. It begins with the formaldehyde molecule and the boron nitride substrate far away from each other. In the following state of the reaction, the molecule attaches to the boron side of the substrate, gaining a large amount of energy. Through this interaction, the double bond of the oxygen atom breaks down, turning the molecule into a highly reactive carbon centered radical. In the final state of the reaction, a neighbor hydrogen atom is abstracted. In this state, there is an additional energy gain of 0.06 eV. Once the stable molecule is formed by the abstraction of the hydrogen atom, a new dangling bond is created at a neighbor boron atom, which it may serve as a new site for the following molecule to attach. In this way, a chain reaction is possible. This self-propagating reaction is more viable for hydrogenated boron nitride than for graphane, opening an avenue to use hydrogenated h-BN in the indoor air pollution control. When there are two or more neighboring hydrogen vacancies in the substrate, the formaldehyde molecule prefers to attach forming Osingle bondB and Csingle bondB bonds with the substrate.', 'Using density functional theory, we have studied the trapping of formaldehyde on hydrogenated boron nitride nanosheets. On the nitrogen terminated side, the formaldehyde molecule is physisorbed at a distance of ~3.1 Å on top of a N atom. A calculation of the adsorption energy, as function of vertical separation between the molecule and the substrate, shows that closer to the surface, there is a strong repulsion due to the electronegativity of the N and O atoms. On the other hand, the trapping of formaldehyde by the substrate on the boron terminated surface is very favorable. The reaction of a single molecule is described by calculating the minimum energy pathway. It begins with the formaldehyde molecule and the boron nitride substrate far away from each other. In the following state of the reaction, the molecule attaches to the boron side of the substrate, gaining a large amount of energy. Through this interaction, the double bond of the oxygen atom breaks down, turning the molecule into a highly reactive carbon centered radical. In the final state of the reaction, a neighbor hydrogen atom is abstracted. In this state, there is an additional energy gain of 0.06 eV. Once the stable molecule is formed by the abstraction of the hydrogen atom, a new dangling bond is created at a neighbor boron atom, which it may serve as a new site for the following molecule to attach. In this way, a chain reaction is possible. This self-propagating reaction is more viable for hydrogenated boron nitride than for graphane, opening an avenue to use hydrogenated h-BN in the indoor air pollution control. When there are two or more neighboring hydrogen vacancies in the substrate, the formaldehyde molecule prefers to attach forming Osingle bondB and Csingle bondB bonds with the substrate.\n\n', 484, '10.1016/j.apsusc.2019.04.001', '2019-01-18', NULL, NULL, 1, 1, NULL, NULL, NULL),
	(42, 'Doping engineering  of thermoelectric transport in BNC heteronanotubes', 'N3eSqMJvE1F0HWXspbEfplB6.pdf', 'BNC heteronanotubes are promising materials for the design of nanoscale thermoelectric devices. In particular, the structural BN doping pattern can be exploited to control the electrical and thermal transport properties of BNC nanostructures. We here address the thermoelectric transport properties of (6,6)-BNC heteronanotubes with helical and horizontal BN doping patterns. For this, we use a density functional tight-binding method combined with the Green\'s function technique. Our results show that the electron transmission is reduced and the electronic bandgap increased as a function of the BN concentration for different doping distribution patterns, so that (6,6)-BNC heteronanotubes become semiconducting with a tunable bandgap. The thermal conductance of helical (6,6)-BNC heteronanotubes, which is dominated by phonons, is weakly dependent on BN concentration in the range of 30–80%. Also, the Seebeck coefficient is enhanced by increasing the concentration of helical BN strips. In particular, helical (6,6)-BNC heteronanotubes with a high BN concentration (>20%) display a larger figure of merit compared to other doping distributions and, for a concentration of 50%, reach values up to 2.3 times and 3.4 times the corresponding values of a CNT at 300 K and 800 K, respectively. Our study yields new insights into the parameters tuning the thermoelectric efficiency and thus provides a starting point for designing thermoelectric devices based on BNC nanostructures.', 'BNC heteronanotubes are promising materials for the design of nanoscale thermoelectric devices. In particular, the structural BN doping pattern can be exploited to control the electrical and thermal transport properties of BNC nanostructures. We here address the thermoelectric transport properties of (6,6)-BNC heteronanotubes with helical and horizontal BN doping patterns. For this, we use a density functional tight-binding method combined with the Green\'s function technique. Our results show that the electron transmission is reduced and the electronic bandgap increased as a function of the BN concentration for different doping distribution patterns, so that (6,6)-BNC heteronanotubes become semiconducting with a tunable bandgap. The thermal conductance of helical (6,6)-BNC heteronanotubes, which is dominated by phonons, is weakly dependent on BN concentration in the range of 30–80%. Also, the Seebeck coefficient is enhanced by increasing the concentration of helical BN strips. In particular, helical (6,6)-BNC heteronanotubes with a high BN concentration (>20%) display a larger figure of merit compared to other doping distributions and, for a concentration of 50%, reach values up to 2.3 times and 3.4 times the corresponding values of a CNT at 300 K and 800 K, respectively. Our study yields new insights into the parameters tuning the thermoelectric efficiency and thus provides a starting point for designing thermoelectric devices based on BNC nanostructures.', 21, '10.1039/C8CP05592K', '2018-01-18', NULL, NULL, 1, 12, NULL, NULL, NULL);
/*!40000 ALTER TABLE `publicacion` ENABLE KEYS */;

-- Dumping structure for table tesis.publicacion_has_autor
CREATE TABLE IF NOT EXISTS `publicacion_has_autor` (
  `autores_idAutor` int NOT NULL,
  `publicacion_idPublicacion` int NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `isPrincipal` int NOT NULL,
  KEY `fk_publicacion_has_autores_autores1_idx` (`autores_idAutor`),
  KEY `fk_publicacion_has_autores_publicacion1_idx` (`publicacion_idPublicacion`),
  CONSTRAINT `fk_publicacion_has_autores_autores1` FOREIGN KEY (`autores_idAutor`) REFERENCES `autor` (`idAutor`),
  CONSTRAINT `fk_publicacion_has_autores_publicacion1` FOREIGN KEY (`publicacion_idPublicacion`) REFERENCES `publicacion` (`idPublicacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.publicacion_has_autor: ~8 rows (approximately)
/*!40000 ALTER TABLE `publicacion_has_autor` DISABLE KEYS */;
INSERT INTO `publicacion_has_autor` (`autores_idAutor`, `publicacion_idPublicacion`, `fechaCreacion`, `fechaActualizacion`, `isPrincipal`) VALUES
	(34, 42, NULL, NULL, 0),
	(32, 42, NULL, NULL, 3),
	(35, 42, NULL, NULL, 2),
	(36, 42, NULL, NULL, 5),
	(31, 41, NULL, NULL, 1),
	(32, 41, NULL, NULL, 3),
	(33, 41, NULL, NULL, 4),
	(30, 39, NULL, NULL, 1);
/*!40000 ALTER TABLE `publicacion_has_autor` ENABLE KEYS */;

-- Dumping structure for table tesis.publicacion_has_usuario
CREATE TABLE IF NOT EXISTS `publicacion_has_usuario` (
  `publicacion_idPublicacion` int NOT NULL,
  `usuario_DNI` varchar(15) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `isPrincipal` int NOT NULL,
  KEY `fk_publicacion_has_usuario_publicacion1_idx` (`publicacion_idPublicacion`),
  KEY `fk_publicacion_has_usuario_usuario1_idx` (`usuario_DNI`),
  CONSTRAINT `fk_publicacion_has_usuario_publicacion1` FOREIGN KEY (`publicacion_idPublicacion`) REFERENCES `publicacion` (`idPublicacion`),
  CONSTRAINT `fk_publicacion_has_usuario_usuario1` FOREIGN KEY (`usuario_DNI`) REFERENCES `usuario` (`DNI`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.publicacion_has_usuario: ~7 rows (approximately)
/*!40000 ALTER TABLE `publicacion_has_usuario` DISABLE KEYS */;
INSERT INTO `publicacion_has_usuario` (`publicacion_idPublicacion`, `usuario_DNI`, `fechaCreacion`, `fechaActualizacion`, `isPrincipal`) VALUES
	(42, '41827493', NULL, NULL, 1),
	(42, '06766048', NULL, NULL, 4),
	(41, '41827493', NULL, NULL, 0),
	(41, '06766048', NULL, NULL, 2),
	(39, '73184556', NULL, NULL, 0),
	(39, '06766048', NULL, NULL, 2),
	(39, '09934476', NULL, NULL, 3);
/*!40000 ALTER TABLE `publicacion_has_usuario` ENABLE KEYS */;

-- Dumping structure for table tesis.revista
CREATE TABLE IF NOT EXISTS `revista` (
  `idRevista` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  PRIMARY KEY (`idRevista`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.revista: ~9 rows (approximately)
/*!40000 ALTER TABLE `revista` DISABLE KEYS */;
INSERT INTO `revista` (`idRevista`, `nombre`) VALUES
	(1, 'Applied Surface Science '),
	(11, 'Revista de Investigación de Física (RIF)'),
	(12, 'Physical Chemistry Chemical Physics'),
	(13, 'Physica B: Condensed Matter'),
	(14, 'Journal of Physics A: Mathematical and Theoretical'),
	(15, 'Physics Letters A'),
	(16, 'Momento'),
	(17, 'Revista Mexicana de Física '),
	(18, 'Physics Letters A');
/*!40000 ALTER TABLE `revista` ENABLE KEYS */;

-- Dumping structure for table tesis.sobrenosotros
CREATE TABLE IF NOT EXISTS `sobrenosotros` (
  `idSobreNosotros` int NOT NULL AUTO_INCREMENT,
  `quienesSomos` longtext NOT NULL,
  `quienesSomosEN` longtext NOT NULL,
  `objetivos` longtext,
  `objetivosEN` varchar(4000) DEFAULT NULL,
  `servicios` varchar(4000) DEFAULT NULL,
  `serviciosEN` varchar(4000) DEFAULT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `foto` varchar(45) DEFAULT NULL,
  `grupo_idGrupo` int NOT NULL,
  PRIMARY KEY (`idSobreNosotros`),
  KEY `fk_sobreNosotros_grupo1_idx` (`grupo_idGrupo`),
  CONSTRAINT `fk_sobreNosotros_grupo1` FOREIGN KEY (`grupo_idGrupo`) REFERENCES `grupo` (`idGrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.sobrenosotros: ~1 rows (approximately)
/*!40000 ALTER TABLE `sobrenosotros` DISABLE KEYS */;
INSERT INTO `sobrenosotros` (`idSobreNosotros`, `quienesSomos`, `quienesSomosEN`, `objetivos`, `objetivosEN`, `servicios`, `serviciosEN`, `fechaCreacion`, `fechaActualizacion`, `foto`, `grupo_idGrupo`) VALUES
	(1, '<p>La investigaci&oacute;n en el &aacute;rea de nanomateriales es uno de los componentes principales del desarrollo de la nanotecnolog&iacute;a que permite el dominio y la modificaci&oacute;n de las propiedades de los materiales mediante el cambio en sus estructuras at&oacute;micas. El grupo de investigaci&oacute;n de m&eacute;todos computacionales aplicado a nanomateriales (GMCAN), adscrito a la Facultad de Ciencias F&iacute;sicas de la UNMSM, aplica y desarrolla modernas herramientas computacionales para entender, predecir y controlar los procesos f&iacute;sicos y qu&iacute;micos en el rango de tama&ntilde;os moleculares hasta la mesoescala. Los integrantes del GMCAN vienen realizando investigaciones sobre nuevos materiales en los &uacute;ltimos 15 a&ntilde;os. Hasta la actualidad se han estudiado las propiedades estructurales, energ&eacute;ticas, estructura electr&oacute;nica de diversas nanopart&iacute;culas, propiedades mec&aacute;nicas de nanoestructuras, transiciones de fase y procesos de ordenaci&oacute;n qu&iacute;mica en aleaciones binarias. El GMCAN mantiene&nbsp; estrecha colaboraci&oacute;n con varios laboratorios y grupos de modelamiento y simulaci&oacute;n. Formamos parte de la Red Iberoamericana de Divulgaci&oacute;n&nbsp; y Formaci&oacute;n en Nanotecnolog&iacute;a (NANODYF).</p>\n', '<p>Research in the area of ​​nanomaterials is one of the main components of the development of nanotechnology that allows the domain and modification of the properties of materials by changing their atomic structures. The research group of computational methods applied to nanomaterials (GMCAN), attached to the Faculty of Physical Sciences of the UNMSM, applies and develops modern computational tools to understand, predict and control physical and chemical processes in the range of molecular sizes up to mesoscale. GMCAN members have been conducting research on new materials for the past 15 years. Until now the structural and energetic properties, electronic structure of various nanoparticles, mechanical properties of nanostructures, phase transitions and chemical ordering processes in binary alloys have been studied. GMCAN maintains close collaboration with various laboratories and modeling and simulation groups. We are part of the Ibero-American Network for Disclosure and Training in Nanotechnology (NANODYF).</p>\n', '<p>Estudiar mediante la simulaci&oacute;n con Din&aacute;mica Molecular (MD) diferentes propiedades f&iacute;sicas y qu&iacute;micas de las nanopart&iacute;culas y nanoestructuras.<br />\nEstudiar mediante la teor&iacute;a del funcional de la densidad (DFT) procesos de funcionalizaci&oacute;n y fen&oacute;menos superficiales de nanosistemas.<br />\nEstudiar mediante Monte Carlo (MC) y din&aacute;mica de esp&iacute;n&nbsp; (SD) los procesos de transformaciones de fase en sistemas magn&eacute;ticos nanoestructurados.<br />\nContribuir con la formaci&oacute;n de recursos humanos altamente calificados en el estudio de diversos sistemas nanoestructurados empleando diversas herramientas computacionales.</p>\n', '<p>Study by simulation with Molecular Dynamics (MD) different physical and chemical properties of nanoparticles and nanostructures.<br />\nTo study through the density functional theory (DFT) functionalization processes and surface phenomena of nanosystems.<br />\nStudy by means of Monte Carlo (MC) and spin dynamics (SD) the processes of phase transformations in nanostructured magnetic systems.<br />\nContribute to the training of highly qualified human resources in the study of various nanostructured systems using various computational tools.</p>\n', '<p>Brindar servicios a los <strong>grupos experimentales</strong> de la Universidad Nacional Mayor de San Marcos y otras instituciones acad&eacute;micas.<br />\nBrindar servicios y asesor&iacute;a a la <strong>comunidad acad&eacute;mica y empresarial</strong>.<br />\nBrindar el servicio de <strong>dise&ntilde;o e implementaci&oacute;n de programas especializados</strong>.<br />\nPromover los m&eacute;todos computacionales de investigaci&oacute;n de los nanomateriales en los diferentes <strong>niveles de ense&ntilde;anza secundaria y universitaria</strong>.</p>\n', '<p>Provide services to the<strong> experimental groups</strong> of the National University of San Marcos and other academic institutions.<br />\nProvide services and advice to the <strong>academic and business community.</strong><br />\nProvide the <strong>design and implementation service of specialized programs</strong>.<br />\nPromote computational research methods for nanomaterials at different<strong> levels of secondary and university education.</strong></p>\n', '2020-03-31', '2020-03-31', 'Nt1TaWGbHaMJ4Xo8jNf54iGl.jpg', 1);
/*!40000 ALTER TABLE `sobrenosotros` ENABLE KEYS */;

-- Dumping structure for table tesis.software
CREATE TABLE IF NOT EXISTS `software` (
  `idSoftware` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) DEFAULT NULL,
  `descripcion` varchar(5000) DEFAULT NULL,
  `descripcionEN` varchar(5000) DEFAULT NULL,
  `moreInfo` varchar(150) DEFAULT NULL,
  `grupo_idGrupo` int NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idSoftware`),
  KEY `fk_software_grupo1_idx` (`grupo_idGrupo`),
  CONSTRAINT `fk_software_grupo1` FOREIGN KEY (`grupo_idGrupo`) REFERENCES `grupo` (`idGrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.software: ~9 rows (approximately)
/*!40000 ALTER TABLE `software` DISABLE KEYS */;
INSERT INTO `software` (`idSoftware`, `nombre`, `descripcion`, `descripcionEN`, `moreInfo`, `grupo_idGrupo`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'LAMMPS   ', 'Potente programa de simulación atomística/molecular   con dinámica molecular a gran escala de Sandia National Laboratories. LAMMPS utiliza la interfaz MPI para la comunicación en paralelo y es un software gratuito y de código abierto, distribuido según los términos de la licencia pública general GNU. ', 'Powerful atomistic / molecular simulation program with large-scale molecular dynamics from Sandia National Laboratories. LAMMPS uses the MPI interface for parallel communication and is free and open source software, distributed under the terms of the GNU General Public License.', 'https://lammps.sandia.gov/', 1, '2020-04-10', '2020-04-10'),
	(2, 'XMD', 'Programa computacional para realizar la simulación con el método de dinámica molecular, especialmente útil para estudiar metales y cerámicas. XMD fue desarrollado por  Jon Rifkin  de University of Connecticut.   ', 'Computer program to perform simulation with the molecular dynamics method, especially useful for studying metals and ceramics. XMD was developed by Jon Rifkin of the University of Connecticut.', 'http://xmd.sourceforge.net/', 1, '2020-04-10', '2020-04-10'),
	(4, 'Quantum-Espresso   ', 'Es un conjunto integrado de códigos informáticos de código abierto para cálculos de estructuras electrónicas y modelado de materiales a nanoescala. Se basa en la teoría funcional de la densidad, ondas planas y pseudopotenciales.   ', 'It is an integrated set of open source computer codes for calculations of electronic structures and modeling of materials at the nanoscale. It is based on the functional theory of density, plane waves and pseudopotentials.', 'http://www.quantum-espresso.org/', 1, NULL, NULL),
	(5, 'SIESTA ', 'Es un método original y una implementación de software para efectuar cálculos de estructura electrónica y simulaciones de dinámica molecular ab initio para moléculas y sólidos. Usa un código de teoría  funcional de la densidad que predice las propiedades de una agrupación de átomos.', 'It is an original method and software implementation to perform ab initio electronic structure calculations and molecular dynamics simulations for molecules and solids. Use a code of density functional theory that predicts the properties of a grouping of atoms.', 'https://departments.icmab.es/leem/siesta/', 1, NULL, NULL),
	(6, 'VAMPIRE ', 'Software de código abierto para simulación atomística de materiales magnéticos  ', 'Open source software for atomistic simulation of magnetic materials', 'https://vampire.york.ac.uk/', 1, NULL, NULL),
	(7, 'Vinamax  ', 'Herramienta para simulación para nanopartículas basado en macroespín, Herramienta escrito el golang. ', 'Tool for simulation for nanoparticles based on macrospin, Tool written in golang.', 'http://jleliaert.github.io/vinamax/', 1, NULL, NULL),
	(8, 'mumax3 ', 'Es un programa de simulación micro magnética desarrollado por DyNaMats', 'It is a micro magnetic simulation program developed by DyNaMats', 'https://mumax.github.io/', 1, NULL, NULL),
	(9, 'OVITO ', 'Software de análisis y visualización científica de datos. Datos generalmente obtenidos por simulación numérica en ciencia de materiales, física  y química.  ', 'Scientific data analysis and visualization software. Data generally obtained by numerical simulation in materials science, physics, and chemistry.', 'https://www.ovito.org/docs/current/', 1, NULL, NULL),
	(10, 'MCANP ', 'Programas propios que fueron desarrollados en el grupo.', 'Own programs that were developed in the group.', '', 1, NULL, NULL);
/*!40000 ALTER TABLE `software` ENABLE KEYS */;

-- Dumping structure for table tesis.tipomiembro
CREATE TABLE IF NOT EXISTS `tipomiembro` (
  `idTipoMiembro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `nombreEN` varchar(45) NOT NULL,
  `nombreSingular` varchar(45) NOT NULL,
  `nombreSingularEN` varchar(45) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idTipoMiembro`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.tipomiembro: ~5 rows (approximately)
/*!40000 ALTER TABLE `tipomiembro` DISABLE KEYS */;
INSERT INTO `tipomiembro` (`idTipoMiembro`, `nombre`, `nombreEN`, `nombreSingular`, `nombreSingularEN`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Docentes Investigadores', 'Research professors', 'Docente Investigador', 'Research professor', '2020-02-14', '2020-02-14'),
	(2, 'Estudiantes de Doctorado', 'PhD students', 'Estudiante de Doctorado', 'PhD student', '2020-02-14', '2020-02-14'),
	(3, 'Estudiantes de Maestría', 'Master\'s students', 'Estudiante de Maestría', 'Master student', '2020-02-14', '2020-02-14'),
	(4, 'Estudiantes de Pregrado', 'Undergraduate students', 'Estudiante de Pregrado', 'Undergraduate student', '2020-02-14', '2020-02-14'),
	(5, 'Colaboradores Externos', 'External collaborators', 'Colaborador Externo', 'External collaborator', '2020-02-14', '2020-02-14');
/*!40000 ALTER TABLE `tipomiembro` ENABLE KEYS */;

-- Dumping structure for table tesis.tiponoticia
CREATE TABLE IF NOT EXISTS `tiponoticia` (
  `idtipoNoticia` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `nombreEN` varchar(45) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idtipoNoticia`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.tiponoticia: ~5 rows (approximately)
/*!40000 ALTER TABLE `tiponoticia` DISABLE KEYS */;
INSERT INTO `tiponoticia` (`idtipoNoticia`, `nombre`, `nombreEN`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Simposio', 'Simposium', '2020-05-30', '2020-05-30'),
	(3, 'Congreso', 'Congress', '2020-05-30', '2020-05-30'),
	(83, 'Prueba', 'Test', NULL, NULL),
	(84, 'Noticias científicas ', 'Science news', NULL, NULL),
	(85, 'Workshop', 'Workshop', NULL, NULL);
/*!40000 ALTER TABLE `tiponoticia` ENABLE KEYS */;

-- Dumping structure for table tesis.tipopublicacion
CREATE TABLE IF NOT EXISTS `tipopublicacion` (
  `idTipoPublicacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `nombreEN` varchar(45) NOT NULL,
  `fechaActualizacion` date NOT NULL,
  `fechaCreacion` date NOT NULL,
  PRIMARY KEY (`idTipoPublicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.tipopublicacion: ~3 rows (approximately)
/*!40000 ALTER TABLE `tipopublicacion` DISABLE KEYS */;
INSERT INTO `tipopublicacion` (`idTipoPublicacion`, `nombre`, `nombreEN`, `fechaActualizacion`, `fechaCreacion`) VALUES
	(1, 'Artículo', 'Article', '2020-01-15', '2020-01-15'),
	(2, 'Tesis', 'Thesis', '2020-02-03', '2020-02-03'),
	(3, 'Resumen', 'Abstract', '2020-02-26', '2020-02-26');
/*!40000 ALTER TABLE `tipopublicacion` ENABLE KEYS */;

-- Dumping structure for table tesis.tipotesis
CREATE TABLE IF NOT EXISTS `tipotesis` (
  `idTipoTesis` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `nombreEN` varchar(45) NOT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaActualizacion` date NOT NULL,
  PRIMARY KEY (`idTipoTesis`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.tipotesis: ~2 rows (approximately)
/*!40000 ALTER TABLE `tipotesis` DISABLE KEYS */;
INSERT INTO `tipotesis` (`idTipoTesis`, `nombre`, `nombreEN`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Tesis de Pregrado', 'Undergraduate thesis', '2020-03-02', '2020-03-02'),
	(2, 'Tesis de Postgrado', 'Postgraduate thesis', '2020-03-02', '2020-03-02');
/*!40000 ALTER TABLE `tipotesis` ENABLE KEYS */;

-- Dumping structure for table tesis.tipousuario
CREATE TABLE IF NOT EXISTS `tipousuario` (
  `idTipoUsuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaActualizacion` date NOT NULL,
  PRIMARY KEY (`idTipoUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.tipousuario: ~3 rows (approximately)
/*!40000 ALTER TABLE `tipousuario` DISABLE KEYS */;
INSERT INTO `tipousuario` (`idTipoUsuario`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'Administrador', '2020-01-15', '2020-01-15'),
	(2, 'Coordinador', '2020-01-15', '2020-01-15'),
	(3, 'Usuario', '2020-01-15', '2020-01-15');
/*!40000 ALTER TABLE `tipousuario` ENABLE KEYS */;

-- Dumping structure for table tesis.universidad
CREATE TABLE IF NOT EXISTS `universidad` (
  `idUniversidad` int NOT NULL AUTO_INCREMENT,
  `nombreEN` varchar(45) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT NULL,
  `fechaActualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`idUniversidad`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.universidad: ~2 rows (approximately)
/*!40000 ALTER TABLE `universidad` DISABLE KEYS */;
INSERT INTO `universidad` (`idUniversidad`, `nombreEN`, `nombre`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(1, 'University', 'Universidad Nacional Mayor San Marcos', '2020-02-11 19:19:29', '2020-02-11 19:19:30'),
	(9, 'University of Piura', 'Universidad de Piura', NULL, NULL);
/*!40000 ALTER TABLE `universidad` ENABLE KEYS */;

-- Dumping structure for table tesis.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `DNI` varchar(15) NOT NULL,
  `correo` varchar(45) NOT NULL,
  `password` varchar(100) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `apellidoPaterno` varchar(45) NOT NULL,
  `apellidoMaterno` varchar(45) DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `resumenPro` varchar(5000) DEFAULT NULL,
  `resumenProEN` varchar(5000) DEFAULT NULL,
  `foto` varchar(45) DEFAULT NULL,
  `estado` int NOT NULL,
  `restablecer` tinyint NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `tipoUsuario_idTipoUsuario` int NOT NULL,
  `tipoMiembro_idTipoMiembro` int NOT NULL,
  `prefijo_idPrefijo` int DEFAULT NULL,
  `genero_idGenero` int DEFAULT NULL,
  `reset_token` varchar(64) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`DNI`),
  UNIQUE KEY `DNI_UNIQUE` (`DNI`),
  KEY `fk_usuario_tipoUsuario1_idx` (`tipoUsuario_idTipoUsuario`),
  KEY `fk_usuario_tipoMiembro1_idx` (`tipoMiembro_idTipoMiembro`),
  KEY `fk_usuario_Prefijo1_idx` (`prefijo_idPrefijo`),
  KEY `fk_usuario_genero1_idx` (`genero_idGenero`),
  KEY `idx_reset_token` (`reset_token`),
  CONSTRAINT `fk_usuario_genero1` FOREIGN KEY (`genero_idGenero`) REFERENCES `genero` (`idGenero`),
  CONSTRAINT `fk_usuario_Prefijo1` FOREIGN KEY (`prefijo_idPrefijo`) REFERENCES `prefijo` (`idPrefijo`),
  CONSTRAINT `fk_usuario_tipoMiembro1` FOREIGN KEY (`tipoMiembro_idTipoMiembro`) REFERENCES `tipomiembro` (`idTipoMiembro`),
  CONSTRAINT `fk_usuario_tipoUsuario1` FOREIGN KEY (`tipoUsuario_idTipoUsuario`) REFERENCES `tipousuario` (`idTipoUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.usuario: ~18 rows (approximately)
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` (`DNI`, `correo`, `password`, `nombre`, `apellidoPaterno`, `apellidoMaterno`, `fechaNacimiento`, `resumenPro`, `resumenProEN`, `foto`, `estado`, `restablecer`, `fechaCreacion`, `fechaActualizacion`, `tipoUsuario_idTipoUsuario`, `tipoMiembro_idTipoMiembro`, `prefijo_idPrefijo`, `genero_idGenero`) VALUES
	('06766048', 'jrojast@unmsm.edu.pe', '$2b$10$FRbwO4M3q9sFJesXOQnLAebEEJXuuSA1Pt7.bRF8agPS5ztxlztI6', 'Justo', 'Rojas ', 'Tapia', '1953-05-21', '', '', '3dF1AST4V0Ii3u6k7U7VFQtU.jpg', 1, 0, NULL, NULL, 2, 1, 1, 1),
	('09394598', 'octaviors@gmail.com', '$2b$10$UB20aR7sI65IPWxyiVMebeAsiDHdpcxvrjqw7hqg22jy7sNZaIFJ2', 'Octavio', 'Rodriguez', 'Salmon', '1970-01-01', '', '', 'D3Yf-UrBS4b-hpwezsKzXbXj.jpg', 1, 0, NULL, NULL, 3, 5, 1, NULL),
	('09934476', 'crojasa@unmsm.edu.pe', '$2b$10$5dT2Rihr07yT2lOV/l0v5u4aBUsNJaLQu39Vbj0kBsG0EOhZ9VFmu', 'Chachi', 'Rojas', 'Ayala', '1970-01-01', '', '', 'pXGTbNVQUqKo4N5WxVusRj2W.png', 1, 0, NULL, NULL, 2, 1, 1, 1),
	('09935115', 'jose.manco@unmsm.edu.pe', '$2b$10$b8eoisayTEJIcV8gU0ytwuzMGyg1yMzuLSdWNzVyJLd9yNaOu7uW2', 'Jose Antonio', 'Manco', 'Chávez', '1973-05-12', '', '', 'JXe9_arp4dgfrSw4Ce4XU1-T.jpg', 1, 0, NULL, NULL, 3, 5, NULL, 1),
	('41495636', 'cperezv@unmsm.edu.pe', '$2b$10$BUeU5MwrFwyUp0bt1RYhEOHNAp75IbziTPKtaFvxsd5CY9TL.rDc.', 'César Enrique', 'Pérez', 'Villegas', '1982-05-09', '', '', 'gZWqckrL_-HsbwW_-Bf4e48I.jpg', 1, 0, NULL, NULL, 3, 1, NULL, 1),
	('41704209', 'magnones5@gmail.com', '$2b$10$c7o7eHSfuN6sib/Etkily.hS6OKxWqYpGkaXa4CCwx3IhkHGdltxi', 'José', 'Solano', '', '1970-01-01', '', '', 'HNoPhSnxsh5welCClGvKDoIo.jpg', 1, 0, NULL, NULL, 3, 5, 1, 1),
	('41827493', 'gcubas@unmsm.edu.pe', '$2b$10$OWBQoq3CBlsiTVWZVmZ4uuLlrfyLIaZdcIGgtMg/neiEa5xfUxHi.', 'Gustavo', 'Cuba', 'Supanta', '1983-03-24', 'Doctor y magister en Ciencias Físicas con mención en Física del Estado Sólido por la Universidad Nacional Mayor de San Marcos (UNMSM-Perú) y un título de Físico por la Universidad Nacional de San Antonio del Cusco. Actualmente, es docente contratado por la UNMSM y su investigación se centra en el estudio de propiedades físicas y de transporte electrónico y térmico en nanomateriales con diversas aplicaciones, donde sus proyectos incluyen simulación de materiales mediante métodos computacionales.', '', 'lHxCNruu9KMBH0p2wJS2ShJa.jpg', 1, 0, NULL, NULL, 3, 1, 1, 1),
	('42506134', 'jmte0106@gmail.com', '$2b$10$ZHMFOz3PovDrEm8vj12MCuMoX.QjzvWE1WayGFSSg0QTeEXr2kyPG', 'José Manuel', 'Torres', 'Estela', '1970-01-01', '', '', 'qiI2piLJDdXF1DBQQW3CqJWc.jpg', 1, 0, NULL, NULL, 3, 3, NULL, NULL),
	('70062076', 'melquicedec.martinez@unmsm.edu.pe', '$2b$10$fWnYlM64NAlbLcvLskRY3emMiJbr99pcTkuPCkXjmNT9seodIQmp.', 'Melquicedec', 'Martinez', '', '1970-01-01', '', '', 'sdAPWk-akv58bxpWOEFlbhzN.jpg', 1, 1, NULL, NULL, 3, 4, NULL, NULL),
	('72424258', 'ricardo.quispe5@unmsm.edu.pe', '$2b$10$dy3RzIW1/EfjrN6x/0xPK.U5qxSGGt.pBjpxaiiYud26wHsqcySnu', 'Ricardo Angelo', 'Quispe', 'Mendizábal', '1998-12-17', 'Estudiante del último año en física, desarrollándome en computación de alto rendimiento, Machine Learning y ciencia de datos. Apasionado por el uso de herramientas ágiles y software libre.', ' I am a final-year student enrolled in a bachelor\'s degree program in physics, developing in high performance computing, Machine Learning and data science. Lively about the use of agile tools and free software.', 'I-_xBJ710-RPo3XOuCv-5-Ep.jpg', 1, 0, NULL, NULL, 3, 4, 6, 1),
	('72851895', 'pedro.rojas9@unmsm.edu.pe', '$2b$10$fePaBKeTUp8jCBpB2gD2AuyC/fuRh5RW5Qf85ibV7djlGcwgBOCOC', 'Pedro Esteban', 'Rojas', 'Fernández', '1995-05-24', '', '', 'mnveHO0YAVyfdoqYLEF50Yqy.jpg', 1, 0, NULL, NULL, 3, 4, NULL, 1),
	('73069725', 'cristopher.cabanillas@unmsm.edu.pe', '$2b$10$y9d9BJpDTRaEwoHhyFXfCOcGllDChVsPALYwxGfXbXS4KaKiX6NG2', 'Cristopher Jair', 'Cabanillas', 'Casas', '1995-03-03', 'Artificial Intelligence Engineer ', 'Artificial Intelligence Engineer ', 'ez8YF3n_OOflYHbme3DdBWPs.jpg', 1, 0, NULL, NULL, 3, 3, 5, 1),
	('73184556', 'rvizarreta14@gmail.com', '$2b$10$hKvDhaSTB6wcOUZCFVuq4e0ZX.XF.d11JkBsTZhg3YklC5ewlTp5u', 'Renzo Alfredo', 'Vizarreta', 'Palacios', '1995-09-14', 'Estudiante de doctorado en la Universidad de Rochester. Físico y bachiller en ingeniería enfocado en la generación de estudios holísticos de fenómenos físicos. Durante my PhD me enfocaré en la generación de modelos y algoritmos de machine learning para la mejora de algoritmos de reconstrucción para colisiones de altas energías.', 'Incoming PhD student at the University of Rochester. I am a physicist and engineer focused on merging theory and computation to generate holistic studies of physical phenomena. During my PhD, I aim to expand my background with the generation of data-driven models to build machine learning algorithms that improve the reconstruction of high-energy collisions.', 't4rwW3HfDby_U_hBsOluH-Uo.jpg', 1, 0, '2020-01-15', '2020-01-19', 2, 2, 5, 1),
	('73460023', 'mauricio.mere@unmsm.edu.pe', '$2b$10$vG5hho7ymzLKXovtwBmN/OKi3B9UCfR1FSOztiDfzBQxE1vMXrEdO', 'Mauricio', 'Mere', 'Cárdenas', '1999-02-10', '', '', 'u4IosrZp5L88I--sx0kJs0fR.jpg', 1, 0, NULL, NULL, 3, 4, NULL, NULL),
	('73596417', 'tony.milla@unmsm.edu.pe', '$2b$10$qO/qUTjav8Tft.ERcnupxeKy50bb0k/uqoRbn38Z22jKE/.UHvh9q', 'Tony Wenceslao', 'Milla', 'Robles', '1995-09-27', '', '', 'p1iAXgOlAobN30Jc-Y6xbu5i.jpg', 1, 0, NULL, NULL, 3, 4, 6, 1),
	('74491911', 'juan.gomez10@unmsm.edu.pe', '$2b$10$lhMTBbncwgUPXVLt8KD4Rez9xb3tJo1nNQbNlM9VCkZr03K./MZ9i', 'Juan Rafael', 'Gomez', 'Quispe', '1997-10-06', 'Soy bachiller en Física, por la Universidad Nacional Mayor de San Marcos. Tengo amplia experiencia en el desarrollo de software, para realizar investigación básica. Actualmente estoy participando en distintos proyectos de investigación, relacionados al área de nanomagnetismo, usando el método de Monte Carlo-Metrópolis.', 'I have a bachelor\'s degree in Physics from the National University of San Marcos. I have extensive experience in software development, to conduct basic research. I am currently participating in different research projects, related to the area of nanomagnetism, using the Monte Carlo-Metropolis method.', 'x61prsCBTz01wbb8S4AHyJwX.jpg', 1, 0, NULL, NULL, 3, 4, 5, 1),
	('74819923', 'fabrizziovp21@gmail.com', '$2b$10$R/F9/LVZcAFXQ8Zcnjv/q.zU1mlKhpgRoBC.RBCj3lJdlPZZBYKVS', 'Fabrizzio Antonio', 'Villanueva', 'Penedo', '1996-05-21', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elit in ridiculus aliquam risus purus, et etiam convallis lorem. Molestie sed vel tristique viverra feugiat lacus massa neque. Aliquet feugiat faucibus tellus iaculis. Montes, turpis mattis gravida aliquet tellus phasellus. Facilisis eu, augue condimentum sapien est arcu. Nibh at turpis egestas.2', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elit in ridiculus aliquam risus purus, et etiam convallis lorem. Molestie sed vel tristique viverra feugiat lacus massa neque. Aliquet feugiat faucibus tellus iaculis. Montes, turpis mattis gravida aliquet tellus phasellus. Facilisis eu, augue condimentum sapien est arcu. Nibh at turpis egestas.', 'wAJdAWUvZgNHsDbnr4sBBB1h.jpg', 1, 1, '2020-02-05', '2020-02-05', 2, 5, 5, 1),
	('76362767', 'angel.terrazas@unmsm.edu.pe', '$2b$10$R5oEVux9Eli5SYqVp/hA2u51XUzCK2MAHSjgUC4.2CdHir/ws85Vi', 'Angel', 'Terrazas', 'Palomino', '1995-03-30', '', '', '79B6lwrYpENllLllvgsvO2dc.jpg', 1, 0, NULL, NULL, 3, 3, NULL, 1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;

-- Dumping structure for table tesis.usuariohaspermiso
CREATE TABLE IF NOT EXISTS `usuariohaspermiso` (
  `usuario_DNI` varchar(15) NOT NULL,
  `permiso_idPermiso` int NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  KEY `fk_usuarioHasPermiso_usuario1_idx` (`usuario_DNI`),
  KEY `fk_usuarioHasPermiso_permiso1_idx` (`permiso_idPermiso`),
  CONSTRAINT `fk_usuarioHasPermiso_permiso1` FOREIGN KEY (`permiso_idPermiso`) REFERENCES `permiso` (`idPermiso`),
  CONSTRAINT `fk_usuarioHasPermiso_usuario1` FOREIGN KEY (`usuario_DNI`) REFERENCES `usuario` (`DNI`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.usuariohaspermiso: ~27 rows (approximately)
/*!40000 ALTER TABLE `usuariohaspermiso` DISABLE KEYS */;
INSERT INTO `usuariohaspermiso` (`usuario_DNI`, `permiso_idPermiso`, `fechaCreacion`, `fechaActualizacion`) VALUES
	('06766048', 1, NULL, NULL),
	('06766048', 3, NULL, NULL),
	('06766048', 2, NULL, NULL),
	('06766048', 4, NULL, NULL),
	('06766048', 5, NULL, NULL),
	('06766048', 6, NULL, NULL),
	('73069725', 1, NULL, NULL),
	('73069725', 3, NULL, NULL),
	('73184556', 2, NULL, NULL),
	('73184556', 4, NULL, NULL),
	('73184556', 5, NULL, NULL),
	('73184556', 1, NULL, NULL),
	('73184556', 3, NULL, NULL),
	('73184556', 6, NULL, NULL),
	('74819923', 3, NULL, NULL),
	('74819923', 5, NULL, NULL),
	('74819923', 4, NULL, NULL),
	('74819923', 2, NULL, NULL),
	('74819923', 6, NULL, NULL),
	('74819923', 1, NULL, NULL),
	('09394598', 1, NULL, NULL),
	('09934476', 5, NULL, NULL),
	('09934476', 4, NULL, NULL),
	('09934476', 3, NULL, NULL),
	('09934476', 2, NULL, NULL),
	('09934476', 1, NULL, NULL),
	('09934476', 6, NULL, NULL);
/*!40000 ALTER TABLE `usuariohaspermiso` ENABLE KEYS */;

-- Dumping structure for table tesis.usuario_has_grupo
CREATE TABLE IF NOT EXISTS `usuario_has_grupo` (
  `usuario_DNI` varchar(15) NOT NULL,
  `grupo_idGrupo` int NOT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaActualizacion` date NOT NULL,
  KEY `fk_usuario_has_grupo_usuario1_idx` (`usuario_DNI`),
  KEY `fk_usuario_has_grupo_grupo1_idx` (`grupo_idGrupo`),
  CONSTRAINT `fk_usuario_has_grupo_grupo1` FOREIGN KEY (`grupo_idGrupo`) REFERENCES `grupo` (`idGrupo`),
  CONSTRAINT `fk_usuario_has_grupo_usuario1` FOREIGN KEY (`usuario_DNI`) REFERENCES `usuario` (`DNI`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.usuario_has_grupo: ~0 rows (approximately)
/*!40000 ALTER TABLE `usuario_has_grupo` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_has_grupo` ENABLE KEYS */;

-- Dumping structure for table tesis.usuario_has_proyecto
CREATE TABLE IF NOT EXISTS `usuario_has_proyecto` (
  `proyecto_idProyecto` int NOT NULL,
  `usuario_DNI` varchar(15) NOT NULL,
  `fechaCreacion` date DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  KEY `fk_usuario_has_proyectos_proyectos1_idx` (`proyecto_idProyecto`),
  KEY `fk_usuario_has_proyectos_usuario1_idx` (`usuario_DNI`),
  CONSTRAINT `fk_usuario_has_proyectos_proyectos1` FOREIGN KEY (`proyecto_idProyecto`) REFERENCES `proyecto` (`idProyecto`),
  CONSTRAINT `fk_usuario_has_proyectos_usuario1` FOREIGN KEY (`usuario_DNI`) REFERENCES `usuario` (`DNI`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table tesis.usuario_has_proyecto: ~4 rows (approximately)
/*!40000 ALTER TABLE `usuario_has_proyecto` DISABLE KEYS */;
INSERT INTO `usuario_has_proyecto` (`proyecto_idProyecto`, `usuario_DNI`, `fechaCreacion`, `fechaActualizacion`) VALUES
	(28, '70062076', NULL, NULL),
	(28, '41827493', NULL, NULL),
	(28, '09934476', NULL, NULL),
	(28, '06766048', NULL, NULL);
/*!40000 ALTER TABLE `usuario_has_proyecto` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
