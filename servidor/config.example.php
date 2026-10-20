<?php
// PLANTILLA. Copiar como config.php en domains/<dominio>/ (FUERA de public_html: al lado de la
// carpeta public_html, nunca dentro) y rellenar. No se sube al repo ni va en el zip.
//   ~/domains/karayatravelagents.com/config.php
//   ~/domains/hispaniolatravelagents.com/config.php
// Las dos landings usan la MISMA base de datos (y la misma que la web principal).
return [
    'db' => [
        'host' => 'localhost',            // en Hostinger, «localhost»
        'port' => 3306,
        'nombre' => 'u000000000_webs',     // EJEMPLO: hPanel → Bases de datos → nombre completo
        'usuario' => 'u000000000_webs',    // EJEMPLO
        'clave' => 'CAMBIAR',
    ],
    // CORREO OPCIONAL. Mientras no haya cuenta de correo (el email del Hostinger es de pago), deja
    // 'smtp' y 'aviso' tal cual o vacíos: los envíos se guardan en MySQL igualmente (correo = 0) y se
    // ven en la web principal, /admin/solicitudes. Con SMTP real, además llega un aviso por correo;
    // si ese SMTP falla, el envío sigue siendo correcto (queda correo = 0 y una línea en el log).
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'puerto' => 465,
        'seguridad' => 'ssl',              // 465 → 'ssl'; 587 → 'tls'
        'usuario' => 'formularios@ejemplo.com',  // EJEMPLO: la cuenta de correo que envía
        'clave' => 'CAMBIAR',
    ],
    'aviso' => [
        'desde' => 'formularios@ejemplo.com',     // EJEMPLO: la misma cuenta que 'usuario'
        'nombre' => 'Formularios web',
        'para' => ['destino@ejemplo.com'],        // EJEMPLO: quién recibe el aviso (una o varias)
    ],
    // Sal para el HMAC de la IP (límite antispam). Una cadena larga al azar, p. ej. la salida de
    // `openssl rand -hex 32`. Si se cambia, solo se reinicia el contador.
    'sal' => 'CAMBIAR-por-una-cadena-larga-al-azar',
    'limite' => ['envios' => 5, 'minutos' => 10],
];
