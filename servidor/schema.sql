-- Formularios de las webs del grupo de Fernando (karayapuntacana.com, karayatravelagents.com,
-- hispaniolatravelagents.com) en el Hostinger del cliente. UNA sola base de datos para las tres.
-- Importar una vez en phpMyAdmin (hPanel → Bases de datos → phpMyAdmin → la base → Importar).
-- Se puede importar dos veces sin romper nada (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS envios (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sitio          VARCHAR(40)  NOT NULL COMMENT 'karayapuntacana | karayatravelagents | hispaniolatravelagents',
  formulario     VARCHAR(40)  NOT NULL COMMENT 'p. ej. agentes',
  idioma         VARCHAR(12)  NOT NULL DEFAULT 'en',
  datos          JSON         NOT NULL COMMENT 'campos del formulario',
  consentimiento JSON         NOT NULL COMMENT '{aceptado, fecha, texto, politica, ...}',
  utm            JSON         NULL     COMMENT 'utm_*, gclid, fbclid',
  origen         JSON         NULL     COMMENT '{pagina, referrer}',
  user_agent     VARCHAR(500) NULL,
  creado         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY envios_sitio_creado (sitio, formulario, creado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Límite de envíos por IP (antispam). Solo el HMAC de la IP, nunca la IP en claro; las filas de
-- más de un día se borran solas en cada envío.
CREATE TABLE IF NOT EXISTS envios_limite (
  id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip_hash CHAR(64)    NOT NULL,
  sitio   VARCHAR(40) NOT NULL,
  creado  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY envios_limite_ip (ip_hash, creado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
