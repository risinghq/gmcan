UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[0]', 'Brindar servicios a los **grupos experimentales** de la Universidad Nacional Mayor de San Marcos y otras instituciones académicas.') WHERE "locale" = 'es' AND json_extract("servicesContent", '$.items[0]') = 'Brindar servicios a los grupos experimentales de la Universidad Nacional Mayor de San Marcos y otras instituciones académicas.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[1]', 'Brindar servicios y asesoría a la **comunidad académica y empresarial**.') WHERE "locale" = 'es' AND json_extract("servicesContent", '$.items[1]') = 'Brindar servicios y asesoría a la comunidad académica y empresarial.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[2]', 'Brindar el servicio de **diseño e implementación de programas especializados**.') WHERE "locale" = 'es' AND json_extract("servicesContent", '$.items[2]') = 'Brindar el servicio de diseño e implementación de programas especializados.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[3]', 'Promover los métodos computacionales de investigación de los nanomateriales en los diferentes **niveles de enseñanza secundaria y universitaria**.') WHERE "locale" = 'es' AND json_extract("servicesContent", '$.items[3]') = 'Promover los métodos computacionales de investigación de los nanomateriales en los diferentes niveles de enseñanza secundaria y universitaria.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[0]', 'Provide services to the **experimental groups** of the National University of San Marcos and other academic institutions.') WHERE "locale" = 'en' AND json_extract("servicesContent", '$.items[0]') = 'Provide services to the experimental groups of the National University of San Marcos and other academic institutions.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[1]', 'Provide services and advice to the **academic and business community**.') WHERE "locale" = 'en' AND json_extract("servicesContent", '$.items[1]') = 'Provide services and advice to the academic and business community.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[2]', 'Provide the **design and implementation service of specialized programs**.') WHERE "locale" = 'en' AND json_extract("servicesContent", '$.items[2]') = 'Provide the design and implementation service of specialized programs.';

UPDATE "about_translation" SET "servicesContent" = json_set("servicesContent", '$.items[3]', 'Promote computational research methods for nanomaterials at different **levels of secondary and university education**.') WHERE "locale" = 'en' AND json_extract("servicesContent", '$.items[3]') = 'Promote computational research methods for nanomaterials at different levels of secondary and university education.';
