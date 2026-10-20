-- Formularios de las 3 webs del grupo de Fernando (karayapuntacana.com, karayatravelagents.com,
-- hispaniolatravelagents.com) en el Hostinger del cliente: UNA sola base de datos MySQL.
-- Importar una vez en phpMyAdmin (hPanel > Bases de datos > phpMyAdmin > la base > Importar).
-- Se puede importar varias veces sin romper nada (IF NOT EXISTS).
--
-- La tabla `envios` es idéntica a la del schema.sql de la web principal (karayapuntacana.com), así
-- que da igual cuál de los dos se importe primero. Las landings guardan:
--   sitio = karayatravelagents | hispaniolatravelagents, formulario = agentes,
--   origen = página de entrada, utm = utm_* + referrer, correo = 1 avisado / 0 falló el aviso.
-- Compatible con MySQL 8 y MariaDB 10.5+.

CREATE TABLE IF NOT EXISTS envios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sitio           VARCHAR(80)  NOT NULL,                -- dominio de la web que recibió el envío
  formulario      VARCHAR(40)  NOT NULL,                -- contacto, solicitud, agentes…
  idioma          VARCHAR(5)   NOT NULL DEFAULT 'en',
  datos           JSON         NOT NULL,                -- los campos del formulario
  consentimiento  JSON         NOT NULL,                -- {aceptado, texto aceptado, fecha, comunicaciones}
  origen          VARCHAR(200) NULL,                    -- utm_content / página de entrada
  utm             JSON         NULL,                    -- utm_source, utm_medium, utm_campaign…
  user_agent      VARCHAR(300) NULL,
  referencia      VARCHAR(24)  NULL,                    -- p. ej. KY-00042 (solicitudes)
  correo          TINYINT(1)   NULL,                    -- NULL pendiente, 1 aviso enviado, 0 el aviso falló (revisar)
  creado          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sitio_formulario (sitio, formulario, creado),
  KEY idx_referencia (referencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Límite de envíos por IP de las landings (antispam): solo el HMAC de la IP con la sal de
-- config.php, nunca la IP en claro; las filas de más de un día se borran solas. Si falta esta
-- tabla (p. ej. si solo se importó el schema de la web principal), enviar.php la crea.
CREATE TABLE IF NOT EXISTS envios_limite (
  id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip_hash CHAR(64)    NOT NULL,
  sitio   VARCHAR(80) NOT NULL,
  creado  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY envios_limite_ip (ip_hash, creado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
