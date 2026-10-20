<?php
// Envío de formularios de las webs del grupo (Karaya, Hispaniola) en el Hostinger del cliente,
// sin GHL (decisión del 20/10/2026). Mismo archivo en las landings; lo propio de cada web va en
// reglas.json (lo genera el build desde los datos del formulario) y los secretos en config.php,
// FUERA de public_html: domains/<dominio>/config.php (plantilla: config.example.php).
//
// Flujo: POST JSON → antispam (campo trampa, tiempo mínimo, límite por IP con hash) → validación
// igual que en el cliente → fila en la tabla `envios` (MySQL, schema.sql) → aviso por SMTP.
// Si falla el guardado o el aviso, responde error: la web enseña la salida por WhatsApp; nunca
// un «enviado» falso.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder(int $codigo, array $cuerpo): void
{
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function registrar(string $que): void
{
    // Al log de errores de PHP del sitio (hPanel → Avanzado → Registros de errores). Sin datos personales.
    error_log('[enviar.php] ' . $que);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    responder(405, ['ok' => false, 'error' => 'metodo']);
}

// --- Configuración -----------------------------------------------------------------------------
$rutaConfig = getenv('ENVIOS_CONFIG') ?: dirname(__DIR__, 2) . '/config.php';
if (!is_file($rutaConfig)) {
    registrar('falta config.php en ' . $rutaConfig);
    responder(500, ['ok' => false, 'error' => 'servidor']);
}
$cfg = require $rutaConfig;
$reglas = json_decode((string) file_get_contents(__DIR__ . '/reglas.json'), true);
if (!is_array($cfg) || !is_array($reglas)) {
    registrar('config.php o reglas.json no válidos');
    responder(500, ['ok' => false, 'error' => 'servidor']);
}

// --- Entrada -----------------------------------------------------------------------------------
$crudo = file_get_contents('php://input', false, null, 0, 65536);
$in = json_decode((string) $crudo, true);
if (!is_array($in) || !isset($in['campos']) || !is_array($in['campos'])) {
    responder(400, ['ok' => false, 'error' => 'formato']);
}
$c = $in['campos'];
$txt = static function ($v, int $max = 200): string {
    if (!is_string($v) && !is_numeric($v)) return '';
    $s = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) $v) ?? '');
    return mb_substr($s, 0, $max);
};
$lista = static function ($v, array $permitidos): array {
    if (!is_array($v)) return [];
    return array_values(array_unique(array_filter($v, static fn($x) => is_string($x) && in_array($x, $permitidos, true))));
};

// --- Antispam ----------------------------------------------------------------------------------
// 1) Campo trampa: un humano no lo ve. Se contesta «ok» sin guardar (el cliente hace lo mismo).
if ($txt($in['_hp'] ?? '') !== '') {
    responder(200, ['ok' => true]);
}
// 2) Tiempo mínimo entre que se ve el formulario y se envía.
$ms = (int) ($in['_ms'] ?? 0);
if ($ms < (int) ($reglas['minMs'] ?? 3000)) {
    responder(429, ['ok' => false, 'error' => 'rapido']);
}

// --- Base de datos -----------------------------------------------------------------------------
try {
    $db = $cfg['db'];
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $db['host'], (int) ($db['port'] ?? 3306), $db['nombre']),
        $db['usuario'],
        $db['clave'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_TIMEOUT => 5]
    );
} catch (Throwable $e) {
    registrar('sin conexión a MySQL: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'servidor']);
}

// 3) Límite por IP: la IP nunca se guarda en claro, solo su HMAC con la sal de config.php.
$sitio = (string) $reglas['sitio'];
$ipHash = hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''), (string) $cfg['sal']);
$limite = $cfg['limite'] ?? ['envios' => 5, 'minutos' => 10];
try {
    $pdo->exec('DELETE FROM envios_limite WHERE creado < NOW() - INTERVAL 1 DAY');
    $q = $pdo->prepare('SELECT COUNT(*) FROM envios_limite WHERE ip_hash = ? AND creado > NOW() - INTERVAL ? MINUTE');
    $q->execute([$ipHash, (int) $limite['minutos']]);
    if ((int) $q->fetchColumn() >= (int) $limite['envios']) {
        responder(429, ['ok' => false, 'error' => 'limite']);
    }
    $pdo->prepare('INSERT INTO envios_limite (ip_hash, sitio) VALUES (?, ?)')->execute([$ipHash, $sitio]);
} catch (Throwable $e) {
    registrar('límite por IP: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'servidor']);
}

// --- Validación (la misma que en el cliente) ---------------------------------------------------
$datos = [];
$errores = [];
foreach ($reglas['campos'] as $k => $r) {
    $tipo = $r['tipo'] ?? 'texto';
    if ($tipo === 'lista') {
        $v = $lista($c[$k] ?? [], $r['opciones']);
        if ($v) $datos[$k] = $v;
        continue;
    }
    if ($tipo === 'si_no') {
        $datos[$k] = !empty($c[$k]);
        continue;
    }
    $v = $txt($c[$k] ?? '', (int) ($r['max'] ?? 200));
    if ($tipo === 'opcion' && $v !== '' && !in_array($v, $r['opciones'], true)) $v = '';
    if ($tipo === 'email' && $v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) {
        $errores[] = $k;
        continue;
    }
    if (!empty($r['requerido']) && mb_strlen($v) < (int) ($r['min'] ?? 1)) {
        $errores[] = $k;
        continue;
    }
    if ($v !== '') $datos[$k] = $v;
}
$consiente = !empty($in['consentimiento']['aceptado']);
if (!$consiente) $errores[] = 'consentimiento';
if ($errores) {
    responder(422, ['ok' => false, 'error' => 'validacion', 'campos' => $errores]);
}

// --- Guardado ----------------------------------------------------------------------------------
$ahora = gmdate('c');
$consentimiento = [
    'aceptado' => true,
    'fecha' => $ahora,
    // El texto lo fija el build (reglas.json), no el navegador.
    'texto' => $reglas['consentimiento'],
    'politica' => $reglas['politica'] ?? null,
];
if (isset($reglas['campos']['novedades'])) {
    $consentimiento['novedades'] = (bool) ($datos['novedades'] ?? false);
    $consentimiento['textoNovedades'] = $reglas['novedades'] ?? null;
}
$utm = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as $k) {
    $v = $txt($in['utm'][$k] ?? '', 200);
    if ($v !== '') $utm[$k] = $v;
}
$origen = array_filter(['pagina' => $txt($in['pagina'] ?? '', 500), 'referrer' => $txt($in['referrer'] ?? '', 500)]);
$idioma = $txt($in['idioma'] ?? ($reglas['idioma'] ?? 'en'), 12);
$ua = $txt($_SERVER['HTTP_USER_AGENT'] ?? '', 500);
$json = static fn($v) => json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

try {
    $pdo->prepare(
        'INSERT INTO envios (sitio, formulario, idioma, datos, consentimiento, utm, origen, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$sitio, (string) $reglas['formulario'], $idioma, $json($datos), $json($consentimiento), $utm ? $json($utm) : null, $origen ? $json($origen) : null, $ua]);
    $id = (int) $pdo->lastInsertId();
} catch (Throwable $e) {
    registrar('INSERT envios: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'servidor']);
}

// --- Aviso por correo (SMTP del correo de Hostinger) -------------------------------------------
require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

$e = static fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
$filas = '';
$texto = '';
foreach ($reglas['campos'] as $k => $r) {
    if (!array_key_exists($k, $datos)) continue;
    $v = $datos[$k];
    $v = is_array($v) ? implode(', ', $v) : (is_bool($v) ? ($v ? 'Sí' : 'No') : $v);
    $filas .= '<tr><td style="padding:6px 12px 6px 0;color:#555;vertical-align:top;white-space:nowrap">' . $e($r['etiqueta']) . '</td><td style="padding:6px 0;white-space:pre-wrap">' . $e($v) . '</td></tr>';
    $texto .= $r['etiqueta'] . ': ' . $v . "\n";
}
$extra = 'Consentimiento: sí, ' . $ahora . "\n" . ($utm ? 'UTM: ' . http_build_query($utm, '', ', ') . "\n" : '') . ($origen ? 'Página: ' . ($origen['pagina'] ?? '') . ($origen['referrer'] ?? '' ? ' · desde ' . $origen['referrer'] : '') . "\n" : '');
$html = '<div style="font:15px/1.5 Arial,sans-serif;color:#111"><p style="margin:0 0 12px"><b>' . $e($reglas['nombreWeb']) . '</b> · formulario «' . $e($reglas['formulario']) . '» · envío #' . $id . '</p><table style="border-collapse:collapse">' . $filas . '</table><p style="margin:16px 0 0;color:#555;font-size:13px;white-space:pre-line">' . $e($extra) . '</p></div>';

try {
    $m = new PHPMailer\PHPMailer\PHPMailer(true);
    $s = $cfg['smtp'];
    $m->isSMTP();
    $m->Host = $s['host'];
    $m->Port = (int) $s['puerto'];
    $m->SMTPSecure = $s['seguridad'] ?? 'ssl';
    $m->SMTPAutoTLS = ($s['seguridad'] ?? 'ssl') !== '';
    $m->SMTPAuth = ($s['usuario'] ?? '') !== '';
    $m->Username = $s['usuario'] ?? '';
    $m->Password = $s['clave'] ?? '';
    $m->Timeout = 15;
    $m->CharSet = 'UTF-8';
    $m->setFrom($cfg['aviso']['desde'], $cfg['aviso']['nombre'] ?? $reglas['nombreWeb']);
    foreach ((array) $cfg['aviso']['para'] as $para) $m->addAddress($para);
    if (!empty($datos['email'])) $m->addReplyTo($datos['email'], $datos['nombre'] ?? '');
    $m->Subject = 'Nuevo contacto · ' . $reglas['nombreWeb'] . ' · ' . ($datos['empresa'] ?? $datos['nombre'] ?? '');
    $m->isHTML(true);
    $m->Body = $html;
    $m->AltBody = $reglas['nombreWeb'] . ' · envío #' . $id . "\n\n" . $texto . "\n" . $extra;
    $m->send();
} catch (Throwable $err) {
    // La fila queda guardada (no se pierde el contacto), pero el usuario ve el error y la salida
    // por WhatsApp: no se le dice «enviado» si nadie va a enterarse.
    registrar('SMTP (envío #' . $id . '): ' . $err->getMessage());
    responder(502, ['ok' => false, 'error' => 'correo']);
}

responder(200, ['ok' => true, 'id' => $id]);
