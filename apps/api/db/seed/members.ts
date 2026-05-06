import { Gender, MemberType, Prefix, Role } from "../../lib/enums.js";
import { SUPPORTED_LOCALES } from "../../lib/locales.js";
import { hashPassword } from "../../lib/password.js";
import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];
const DEFAULT_PASSWORD = "password123";
const BIO_PLACEHOLDER = "Miembro del GMCAN";

const SEED_MEMBERS = [
  {
    dni: "00000001",
    email: "admin@gmcan.dev",
    firstName: "Admin",
    lastName: "Dev",
    maternalName: null,
    birthDate: null,
    status: 1,
    resetPassword: 0,
    roleId: Role.ADMINISTRATOR,
    memberTypeId: MemberType.RESEARCHER,
    prefixId: null,
    genderId: null,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "06766048",
    email: "jrojast@unmsm.edu.pe",
    firstName: "Justo",
    lastName: "Rojas",
    maternalName: "Tapia",
    birthDate: "1953-05-21",
    status: 1,
    resetPassword: 0,
    roleId: Role.RESEARCHER,
    memberTypeId: MemberType.RESEARCHER,
    prefixId: Prefix.DR,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
    localizedBio: { es: "" },
  },
  {
    dni: "09394598",
    email: "octaviors@gmail.com",
    firstName: "Octavio",
    lastName: "Rodriguez",
    maternalName: "Salmon",
    birthDate: "1970-01-01",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.COLLABORATOR,
    prefixId: Prefix.DR,
    genderId: null,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "09934476",
    email: "crojasa@unmsm.edu.pe",
    firstName: "Chachi",
    lastName: "Rojas",
    maternalName: "Ayala",
    birthDate: "1970-01-01",
    status: 1,
    resetPassword: 0,
    roleId: Role.RESEARCHER,
    memberTypeId: MemberType.RESEARCHER,
    prefixId: Prefix.DR,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "09935115",
    email: "jose.manco@unmsm.edu.pe",
    firstName: "Jose Antonio",
    lastName: "Manco",
    maternalName: "Chávez",
    birthDate: "1973-05-12",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.COLLABORATOR,
    prefixId: null,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "41495636",
    email: "cperezv@unmsm.edu.pe",
    firstName: "César Enrique",
    lastName: "Pérez",
    maternalName: "Villegas",
    birthDate: "1982-05-09",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.RESEARCHER,
    prefixId: null,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "41704209",
    email: "magnones5@gmail.com",
    firstName: "José",
    lastName: "Solano",
    maternalName: "",
    birthDate: "1970-01-01",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.COLLABORATOR,
    prefixId: Prefix.DR,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "41827493",
    email: "gcubas@unmsm.edu.pe",
    firstName: "Gustavo",
    lastName: "Cuba",
    maternalName: "Supanta",
    birthDate: "1983-03-24",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.RESEARCHER,
    prefixId: Prefix.DR,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
    localizedBio: {
      es: "Doctor y magister en Ciencias Físicas con mención en Física del Estado Sólido por la Universidad Nacional Mayor de San Marcos (UNMSM-Perú) y un título de Físico por la Universidad Nacional de San Antonio del Cusco. Actualmente, es docente contratado por la UNMSM y su investigación se centra en el estudio de propiedades físicas y de transporte electrónico y térmico en nanomateriales con diversas aplicaciones, donde sus proyectos incluyen simulación de materiales mediante métodos computacionales.",
    },
  },
  {
    dni: "42506134",
    email: "jmte0106@gmail.com",
    firstName: "José Manuel",
    lastName: "Torres",
    maternalName: "Estela",
    birthDate: "1970-01-01",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.MASTER_STUDENT,
    prefixId: null,
    genderId: null,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "70062076",
    email: "melquicedec.martinez@unmsm.edu.pe",
    firstName: "Melquicedec",
    lastName: "Martinez",
    maternalName: "",
    birthDate: "1970-01-01",
    status: 1,
    resetPassword: 1,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.UNDERGRADUATE_STUDENT,
    prefixId: null,
    genderId: null,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "72424258",
    email: "ricardo.quispe5@unmsm.edu.pe",
    firstName: "Ricardo Angelo",
    lastName: "Quispe",
    maternalName: "Mendizábal",
    birthDate: "1998-12-17",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.UNDERGRADUATE_STUDENT,
    prefixId: Prefix.LIC,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
    localizedBio: {
      es: "Estudiante del último año en física, desarrollándome en computación de alto rendimiento, Machine Learning y ciencia de datos. Apasionado por el uso de herramientas ágiles y software libre.",
    },
  },
  {
    dni: "72851895",
    email: "pedro.rojas9@unmsm.edu.pe",
    firstName: "Pedro Esteban",
    lastName: "Rojas",
    maternalName: "Fernández",
    birthDate: "1995-05-24",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.UNDERGRADUATE_STUDENT,
    prefixId: null,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "73069725",
    email: "cristopher.cabanillas@unmsm.edu.pe",
    firstName: "Cristopher Jair",
    lastName: "Cabanillas",
    maternalName: "Casas",
    birthDate: "1995-03-03",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.MASTER_STUDENT,
    prefixId: Prefix.LIC,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
    localizedBio: { es: "Artificial Intelligence Engineer" },
  },
  {
    dni: "73184556",
    email: "rvizarreta14@gmail.com",
    firstName: "Renzo Alfredo",
    lastName: "Vizarreta",
    maternalName: "Palacios",
    birthDate: "1995-09-14",
    status: 1,
    resetPassword: 0,
    roleId: Role.RESEARCHER,
    memberTypeId: MemberType.PHD_STUDENT,
    prefixId: Prefix.LIC,
    genderId: Gender.MALE,
    createdAt: "2020-01-15",
    updatedAt: "2020-01-19",
    localizedBio: {
      es: "Estudiante de doctorado en la Universidad de Rochester. Físico y bachiller en ingeniería enfocado en la generación de estudios holísticos de fenómenos físicos. Durante my PhD me enfocaré en la generación de modelos y algoritmos de machine learning para la mejora de algoritmos de reconstrucción para colisiones de altas energías.",
    },
  },
  {
    dni: "73460023",
    email: "mauricio.mere@unmsm.edu.pe",
    firstName: "Mauricio",
    lastName: "Mere",
    maternalName: "Cárdenas",
    birthDate: "1999-02-10",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.UNDERGRADUATE_STUDENT,
    prefixId: null,
    genderId: null,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "73596417",
    email: "tony.milla@unmsm.edu.pe",
    firstName: "Tony Wenceslao",
    lastName: "Milla",
    maternalName: "Robles",
    birthDate: "1995-09-27",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.UNDERGRADUATE_STUDENT,
    prefixId: Prefix.LIC,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
  {
    dni: "74491911",
    email: "juan.gomez10@unmsm.edu.pe",
    firstName: "Juan Rafael",
    lastName: "Gomez",
    maternalName: "Quispe",
    birthDate: "1997-10-06",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.UNDERGRADUATE_STUDENT,
    prefixId: Prefix.LIC,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
    localizedBio: {
      es: "Soy bachiller en Física, por la Universidad Nacional Mayor de San Marcos. Tengo amplia experiencia en el desarrollo de software, para realizar investigación básica. Actualmente estoy participando en distintos proyectos de investigación, relacionados al área de nanomagnetismo, usando el método de Monte Carlo-Metrópolis.",
    },
  },
  {
    dni: "74819923",
    email: "fabrizziovp21@gmail.com",
    firstName: "Fabrizzio Antonio",
    lastName: "Villanueva",
    maternalName: "Penedo",
    birthDate: "1996-05-21",
    status: 1,
    resetPassword: 1,
    roleId: Role.RESEARCHER,
    memberTypeId: MemberType.COLLABORATOR,
    prefixId: Prefix.LIC,
    genderId: Gender.MALE,
    createdAt: "2020-02-05",
    updatedAt: "2020-02-05",
    localizedBio: {
      es: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elit in ridiculus aliquam risus purus, et etiam convallis lorem. Molestie sed vel tristique viverra feugiat lacus massa neque. Aliquet feugiat faucibus tellus iaculis. Montes, turpis mattis gravida aliquet tellus phasellus. Facilisis eu, augue condimentum sapien est arcu. Nibh at turpis egestas.2",
    },
  },
  {
    dni: "76362767",
    email: "angel.terrazas@unmsm.edu.pe",
    firstName: "Angel",
    lastName: "Terrazas",
    maternalName: "Palomino",
    birthDate: "1995-03-30",
    status: 1,
    resetPassword: 0,
    roleId: Role.VISITOR,
    memberTypeId: MemberType.MASTER_STUDENT,
    prefixId: null,
    genderId: Gender.MALE,
    createdAt: today,
    updatedAt: today,
  },
];

const MEMBER_GROUP_LINKS: Array<{ memberDni: string; groupId: number }> = [
  { memberDni: "06766048", groupId: 1 },
  { memberDni: "09934476", groupId: 1 },
  { memberDni: "41827493", groupId: 1 },
  { memberDni: "42506134", groupId: 1 },
  { memberDni: "73460023", groupId: 1 },
];

function bioForLocale(member: (typeof SEED_MEMBERS)[number], locale: string) {
  return member.localizedBio?.[locale] ?? member.localizedBio?.es ?? BIO_PLACEHOLDER;
}

export async function seedMembers() {
  await upsertMembers();
  await upsertMemberTranslations();
  await upsertMemberGroups();
}

async function upsertMembers() {
  await db
    .insertInto("member")
    .values(
      SEED_MEMBERS.map((member) => ({
        dni: member.dni,
        email: member.email,
        password: hashPassword(DEFAULT_PASSWORD),
        firstName: member.firstName,
        lastName: member.lastName,
        maternalName: member.maternalName,
        status: member.status,
        resetPassword: member.resetPassword,
        roleId: member.roleId,
        memberTypeId: member.memberTypeId,
        prefixId: member.prefixId,
        genderId: member.genderId,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        birthDate: member.birthDate,
        resetToken: null,
        resetExpires: null,
      })),
    )
    .onConflict((oc) => oc.column("dni").doNothing())
    .execute();
}

async function upsertMemberTranslations() {
  const dnis = SEED_MEMBERS.map((member) => member.dni);

  const seededMembers = await db.selectFrom("member").select(["id", "dni"]).where("dni", "in", dnis).execute();

  const memberByDni = new Map(seededMembers.map((member) => [member.dni, member.id]));

  await db
    .insertInto("member_translation")
    .values(
      SEED_MEMBERS.flatMap((member) => {
        const memberId = memberByDni.get(member.dni);
        if (!memberId) return [];

        return SUPPORTED_LOCALES.map((locale) => ({
          memberId,
          locale,
          bio: bioForLocale(member, locale),
        }));
      }),
    )
    .onConflict((oc) => oc.columns(["memberId", "locale"]).doUpdateSet((eb) => ({ bio: eb.ref("excluded.bio") })))
    .execute();
}

async function upsertMemberGroups() {
  const dnis = MEMBER_GROUP_LINKS.map((link) => link.memberDni);
  const members = await db.selectFrom("member").select(["id", "dni"]).where("dni", "in", dnis).execute();
  const memberByDni = new Map(members.map((member) => [member.dni, member.id]));

  await db
    .insertInto("member_group")
    .values(
      MEMBER_GROUP_LINKS.flatMap((link) => {
        const memberId = memberByDni.get(link.memberDni);
        if (!memberId) return [];
        return [{ memberId, groupId: link.groupId, createdAt: today, updatedAt: today }];
      }),
    )
    .onConflict((oc) => oc.doNothing())
    .execute();
}
