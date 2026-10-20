-- Autor: Equipo de Desarrollo SIM
-- Fecha: 19/10/2026
-- Descripción: Cuentas y roles de las pruebas de usabilidad del 20/10/2026 (Plan de pruebas de
--   usabilidad SIM v1). Crea una cuenta por perfil de participante, con correo validado y rol
--   asignado, para que cada funcionario ejecute sus tareas con el rol apropiado.
--   NO debe ejecutarse en producción.
-- Motor: MySQL 8+
--
-- Cuentas (todas con la contraseña Usab2026*SIM; CONTRASENA_HASH es su BCrypt, el mismo
-- algoritmo de CfgSeguridad):
--   P1 analista.usabilidad@ucr.ac.cr   Analista de Trámites de Importación  T01, T02
--   P2 jefatura.usabilidad@ucr.ac.cr   Jefatura / Product Owner             T03, T02
--   P3 tecnica.usabilidad@ucr.ac.cr    Técnica de Exoneraciones             T04, T05
--   P4 apoyo.usabilidad@ucr.ac.cr      Apoyo Administrativo                 T06, T07
--   P5 agente1.usabilidad@ucr.ac.cr    Agente de Aduanas 1                  T08, T09, T10
--   P6 agente2.usabilidad@ucr.ac.cr    Agente de Aduanas 2                  T08, T09, T10
--
-- Hoy el servidor solo exige un permiso concreto para aprobar exoneraciones (EXONERACION_APROBAR,
-- HU-022); el resto de pantallas solo exige sesión iniciada. Aun así cada rol recibe los permisos
-- de su perfil para que la asignación refleje el trabajo real de la Unidad.
-- Los roles de agente llevan "AGENTE" en el nombre: así aparecen en la lista de agentes
-- responsables del trámite temporal (DalTramiteTemporal.SIMF_USUARIO_ObtenerAgentesResponsables).
--
-- Requisito previo: scripts 02 a 16 (en especial 04-Tabla-Sesion-HU004.sql,
--   10-Aprobacion-Exoneraciones.sql y 14-Permisos-Seguridad.sql).
-- El script puede ejecutarse más de una vez: no duplica registros.
--
-- Cómo cargarlo (PowerShell):
--   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source database/17-Usuarios-Pruebas-Usabilidad.sql"

SET NAMES utf8mb4;

USE sim;

-- ---------------------------------------------------------------------------
-- Roles de los perfiles. JEFATURA_IMPORTACIONES ya lo crea el script 10.
-- ---------------------------------------------------------------------------

INSERT INTO SIMM_ROL (NOMBRE, DESCRIPCION, ESTADO) VALUES
    ('ANALISTA_IMPORTACION', 'Analista de trámites de importación de la Unidad de Importaciones.', 'ACT'),
    ('JEFATURA_IMPORTACIONES', 'Jefatura de la Unidad de Importaciones.', 'ACT'),
    ('TECNICA_EXONERACIONES', 'Técnica responsable de las solicitudes de exoneración.', 'ACT'),
    ('APOYO_ADMINISTRATIVO', 'Apoyo administrativo: registro y seguimiento de donaciones.', 'ACT'),
    ('AGENTE_ADUANAS', 'Agente de aduanas: trámites temporales de importación y exportación.', 'ACT')
ON DUPLICATE KEY UPDATE ESTADO = 'ACT';

-- Permisos de cada rol (códigos de 10-Aprobacion-Exoneraciones.sql y 14-Permisos-Seguridad.sql).
INSERT INTO SIMT_ROL_PERMISO (ID_ROL, ID_PERMISO, ESTADO)
SELECT R.ID_ROL, P.ID_PERMISO, 'ACT'
FROM (
    SELECT 'ANALISTA_IMPORTACION' AS ROL, 'IMPORTACION_CONSULTAR' AS PERMISO
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'IMPORTACION_CREAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'IMPORTACION_MODIFICAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'DESALMACENAJE_CONSULTAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'DESALMACENAJE_CREAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'DESALMACENAJE_MODIFICAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'DONACION_CONSULTAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'EXONERACION_CONSULTAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'ADUANERO_TEMPORAL_CONSULTAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'REPORTE_CONSULTAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'REPORTE_FILTRAR'
    UNION ALL SELECT 'ANALISTA_IMPORTACION', 'BITACORA_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'EXONERACION_APROBAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'APROBACION_EXONERACION'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'EXONERACION_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'IMPORTACION_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'DONACION_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'DESALMACENAJE_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'ADUANERO_TEMPORAL_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'REPORTE_CONSULTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'REPORTE_FILTRAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'REPORTE_GENERAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'REPORTE_EXPORTAR'
    UNION ALL SELECT 'JEFATURA_IMPORTACIONES', 'BITACORA_CONSULTAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'EXONERACION_CONSULTAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'EXONERACION_CREAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'EXONERACION_MODIFICAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'IMPORTACION_CONSULTAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'DONACION_CONSULTAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'REPORTE_CONSULTAR'
    UNION ALL SELECT 'TECNICA_EXONERACIONES', 'BITACORA_CONSULTAR'
    UNION ALL SELECT 'APOYO_ADMINISTRATIVO', 'DONACION_CONSULTAR'
    UNION ALL SELECT 'APOYO_ADMINISTRATIVO', 'DONACION_CREAR'
    UNION ALL SELECT 'APOYO_ADMINISTRATIVO', 'DONACION_MODIFICAR'
    UNION ALL SELECT 'APOYO_ADMINISTRATIVO', 'IMPORTACION_CONSULTAR'
    UNION ALL SELECT 'APOYO_ADMINISTRATIVO', 'EXONERACION_CONSULTAR'
    UNION ALL SELECT 'APOYO_ADMINISTRATIVO', 'BITACORA_CONSULTAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'ADUANERO_TEMPORAL_CONSULTAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'ADUANERO_TEMPORAL_CREAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'ADUANERO_TEMPORAL_MODIFICAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'ADUANERO_RECLAMO_GESTIONAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'DESALMACENAJE_CONSULTAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'IMPORTACION_CONSULTAR'
    UNION ALL SELECT 'AGENTE_ADUANAS', 'BITACORA_CONSULTAR'
) RP_DATOS
JOIN SIMM_ROL R ON R.NOMBRE = RP_DATOS.ROL
JOIN SIMM_PERMISO P ON P.CODIGO = RP_DATOS.PERMISO AND P.ESTADO = 'ACT'
WHERE NOT EXISTS (
    SELECT 1
    FROM SIMT_ROL_PERMISO X
    WHERE X.ID_ROL = R.ID_ROL
      AND X.ID_PERMISO = P.ID_PERMISO
      AND X.ESTADO = 'ACT'
);

-- ---------------------------------------------------------------------------
-- Cuentas. ESTADO_VALIDACION = 'VAL' y ESTADO_ROL = 'ASI' son las dos condiciones del inicio
-- de sesión (HU-004). Las cédulas 1000001xx son ficticias.
-- ---------------------------------------------------------------------------

INSERT INTO SIMF_USUARIO (NOMBRE_COMPLETO, NUMERO_CEDULA, FECHA_NACIMIENTO, CORREO_INSTITUCIONAL,
    CONTRASENA_HASH, ESTADO_VALIDACION, ESTADO_ROL)
VALUES
    ('P1 Analista de Importación', '100000101', '1990-01-01', 'analista.usabilidad@ucr.ac.cr',
     '$2a$10$u0xS0kSjIYOHI88oqC1mfOuHAPBRoACShIveEw8RtIwOr1x5Cup3q', 'VAL', 'ASI'),
    ('P2 Jefatura de Importaciones', '100000102', '1990-01-01', 'jefatura.usabilidad@ucr.ac.cr',
     '$2a$10$u0xS0kSjIYOHI88oqC1mfOuHAPBRoACShIveEw8RtIwOr1x5Cup3q', 'VAL', 'ASI'),
    ('P3 Técnica de Exoneraciones', '100000103', '1990-01-01', 'tecnica.usabilidad@ucr.ac.cr',
     '$2a$10$u0xS0kSjIYOHI88oqC1mfOuHAPBRoACShIveEw8RtIwOr1x5Cup3q', 'VAL', 'ASI'),
    ('P4 Apoyo Administrativo', '100000104', '1990-01-01', 'apoyo.usabilidad@ucr.ac.cr',
     '$2a$10$u0xS0kSjIYOHI88oqC1mfOuHAPBRoACShIveEw8RtIwOr1x5Cup3q', 'VAL', 'ASI'),
    ('P5 Agente de Aduanas 1', '100000105', '1990-01-01', 'agente1.usabilidad@ucr.ac.cr',
     '$2a$10$u0xS0kSjIYOHI88oqC1mfOuHAPBRoACShIveEw8RtIwOr1x5Cup3q', 'VAL', 'ASI'),
    ('P6 Agente de Aduanas 2', '100000106', '1990-01-01', 'agente2.usabilidad@ucr.ac.cr',
     '$2a$10$u0xS0kSjIYOHI88oqC1mfOuHAPBRoACShIveEw8RtIwOr1x5Cup3q', 'VAL', 'ASI')
AS NUEVO
ON DUPLICATE KEY UPDATE
    NOMBRE_COMPLETO   = NUEVO.NOMBRE_COMPLETO,
    CONTRASENA_HASH   = NUEVO.CONTRASENA_HASH,
    ESTADO_VALIDACION = 'VAL',
    ESTADO_ROL        = 'ASI';

-- ---------------------------------------------------------------------------
-- Asignación del rol. Asigna el administrador de pruebas (script 09) si existe; si no, la
-- propia cuenta queda como asignadora.
-- ---------------------------------------------------------------------------

SET @vln_IdAdministrador = (
    SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'admin.pruebas@ucr.ac.cr'
);

INSERT INTO SIMT_USUARIO_ROL (ID_USUARIO, ID_ROL, ID_USUARIO_ASIGNADOR, MOTIVO, ESTADO)
SELECT U.ID_USUARIO, R.ID_ROL, COALESCE(@vln_IdAdministrador, U.ID_USUARIO),
    'Cuenta de las pruebas de usabilidad (20/10/2026)', 'ACT'
FROM (
    SELECT 'analista.usabilidad@ucr.ac.cr' AS CORREO, 'ANALISTA_IMPORTACION' AS ROL
    UNION ALL SELECT 'jefatura.usabilidad@ucr.ac.cr', 'JEFATURA_IMPORTACIONES'
    UNION ALL SELECT 'tecnica.usabilidad@ucr.ac.cr', 'TECNICA_EXONERACIONES'
    UNION ALL SELECT 'apoyo.usabilidad@ucr.ac.cr', 'APOYO_ADMINISTRATIVO'
    UNION ALL SELECT 'agente1.usabilidad@ucr.ac.cr', 'AGENTE_ADUANAS'
    UNION ALL SELECT 'agente2.usabilidad@ucr.ac.cr', 'AGENTE_ADUANAS'
) UR_DATOS
JOIN SIMF_USUARIO U ON U.CORREO_INSTITUCIONAL = UR_DATOS.CORREO
JOIN SIMM_ROL R ON R.NOMBRE = UR_DATOS.ROL
WHERE NOT EXISTS (
    SELECT 1
    FROM SIMT_USUARIO_ROL X
    WHERE X.ID_USUARIO = U.ID_USUARIO
      AND X.ID_ROL = R.ID_ROL
      AND X.ESTADO = 'ACT'
      AND X.FECHA_FINALIZACION IS NULL
);

-- Resultado: cuentas, rol y cantidad de permisos que recibirán al iniciar sesión.
SELECT U.ID_USUARIO,
       U.CORREO_INSTITUCIONAL,
       U.NOMBRE_COMPLETO,
       R.NOMBRE AS ROL,
       (SELECT COUNT(*) FROM SIMT_ROL_PERMISO RP
         WHERE RP.ID_ROL = R.ID_ROL AND RP.ESTADO = 'ACT') AS PERMISOS
FROM SIMF_USUARIO U
JOIN SIMT_USUARIO_ROL UR ON UR.ID_USUARIO = U.ID_USUARIO AND UR.ESTADO = 'ACT'
JOIN SIMM_ROL R ON R.ID_ROL = UR.ID_ROL
WHERE U.CORREO_INSTITUCIONAL LIKE '%.usabilidad@ucr.ac.cr'
ORDER BY U.NUMERO_CEDULA;
