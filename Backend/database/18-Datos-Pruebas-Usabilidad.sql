-- Autor: Equipo de Desarrollo SIM
-- Fecha: 19/10/2026
-- Descripción: Expedientes iniciales de las pruebas de usabilidad del 20/10/2026 (Plan de pruebas
--   de usabilidad SIM v1, sección 7). Carga los expedientes que las tareas necesitan ya
--   registrados: búsqueda (T02), aprobación (T03), revisión documental (T05), seguimiento de
--   donación (T07), prórroga (T09) y consulta de trámites activos (T10). Los datos son ficticios:
--   siguen la forma de los registros de la Unidad de Importaciones, pero no copian datos reales.
--   NO debe ejecutarse en producción.
-- Motor: MySQL 8.0.16+
--
-- Trazabilidad: todas las referencias de prueba usan la serie 3xx (por ejemplo EXO-303-26 o
-- 2026-301), de modo que se distinguen de los datos de 04-Datos-Prueba.sql y
-- 07-Datos-Prueba-Temporales.sql (serie 9xx). El detalle de cada expediente está en la guía del
-- facilitador (Guia_Facilitador_Pruebas_Usabilidad_SIM.docx).
--
-- Las fechas son fijas y están pensadas para ejecutar las pruebas el 20/10/2026: los
-- vencimientos de los temporales activos caen en noviembre de 2026 y la prórroga (HU-028) los
-- mueve seis meses.
--
-- Documentos: RUTA_ARCHIVO es relativa a app.ruta-documentos (./documentos). Los PDF están en
-- Backend/documentos-pruebas/. En Docker y Railway el backend los copia solo al arrancar; en local
-- copie el contenido de esa carpeta dentro de Backend/documentos/ para que el visor abra los archivos.
--
-- Requisito previo: scripts 02 a 16 y 17-Usuarios-Pruebas-Usabilidad.sql.
-- El script puede ejecutarse más de una vez: primero elimina los expedientes de la serie 3xx,
-- incluidos los que los participantes registren durante las pruebas (T01, T04, T06 y T08), y
-- luego los vuelve a crear. Sirve para dejar el ambiente igual antes de cada sesión.
--
-- Cómo cargarlo (PowerShell):
--   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source database/18-Datos-Pruebas-Usabilidad.sql"

SET NAMES utf8mb4;

USE sim;

-- ---------------------------------------------------------------------------
-- Limpieza de una carga anterior y de lo registrado por los participantes.
-- ---------------------------------------------------------------------------

DROP TEMPORARY TABLE IF EXISTS TMP_TRAMITE_USABILIDAD;
CREATE TEMPORARY TABLE TMP_TRAMITE_USABILIDAD (ID_TRAMITE INT NOT NULL PRIMARY KEY);

INSERT INTO TMP_TRAMITE_USABILIDAD (ID_TRAMITE)
SELECT ID_TRAMITE
FROM SIMT_TRAMITE
WHERE REFERENCIA_INTERNA IN (
    -- Precargados por este script
    '2026-301', '2026-302', 'DE-301-26', 'D-302-26', 'EXO-303-26', 'EXO-304-26', 'EXO-305-26',
    'EXO-306-26', 'DF-307-26', 'DF-308-26', 'IT-309-26', 'IT-310-26', 'IT-311-26',
    'EXP-T-312-26', 'EXP-T-313-26', 'IT-314-26', 'IT-315-26',
    -- Registrados por los participantes durante las pruebas (fichas T01, T04, T06 y T08)
    '2026-317', '2026-318', 'EXO-321-26', 'EXO-322-26', 'D-323-26', 'D-324-26',
    'IT-325-26', 'IT-326-26', 'IT-327-26', 'IT-328-26'
);

DELETE N FROM SIMT_NOTIFICACION_EXONERACION N
JOIN SIMT_DECISION_EXONERACION D ON D.ID_DECISION = N.ID_DECISION
JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = D.ID_TRAMITE;
DELETE D FROM SIMT_DECISION_EXONERACION D JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = D.ID_TRAMITE;
UPDATE SIMT_AUTORIZACION_EXONET A JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = A.ID_TRAMITE
SET A.ID_AUTORIZACION_ANTERIOR = NULL;
DELETE A FROM SIMT_AUTORIZACION_EXONET A JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = A.ID_TRAMITE;
DELETE O FROM SIMT_OBSERVACION_EXPED O JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = O.ID_TRAMITE;
DELETE R FROM SIMT_REVISION_DOCUMENTO R
JOIN SIMF_DOCUMENTO D ON D.ID_DOCUMENTO = R.ID_DOCUMENTO
JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = D.ID_TRAMITE;
DELETE H FROM SIMT_HISTORIAL_PRORROGA_TEMPORAL H JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = H.ID_TRAMITE;
DELETE A FROM SIMT_ALERTA_TEMPORAL A JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = A.ID_TRAMITE;
DELETE G FROM SIMT_TEMPORAL_AGENTE G JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = G.ID_TRAMITE;
DELETE X FROM SIMT_TRAMITE_TEMPORAL X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE;
DELETE X FROM SIMT_PEDIDO_PROV X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE;
DELETE X FROM SIMT_EXONERACION X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE;
DELETE X FROM SIMT_DONACION X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE;
UPDATE SIMT_DESALMACENAJE_ESPEC X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE_RECLASIFICADO
SET X.ID_TRAMITE_RECLASIFICADO = NULL;
DELETE X FROM SIMT_DESALMACENAJE_ESPEC X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE;
DELETE H FROM SIMH_ESTADO_TRAMITE H JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = H.ID_TRAMITE;
DELETE B FROM SIML_BITACORA B JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = B.ID_TRAMITE;
UPDATE SIMF_DOCUMENTO D JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = D.ID_TRAMITE
SET D.ID_DOCUMENTO_ANTERIOR = NULL;
DELETE D FROM SIMF_DOCUMENTO D JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = D.ID_TRAMITE;
DELETE X FROM SIMT_TRAMITE X JOIN TMP_TRAMITE_USABILIDAD T ON T.ID_TRAMITE = X.ID_TRAMITE;

DROP TEMPORARY TABLE TMP_TRAMITE_USABILIDAD;

-- ---------------------------------------------------------------------------
-- Cuentas de 17-Usuarios-Pruebas-Usabilidad.sql.
-- ---------------------------------------------------------------------------

SET @vln_P1 = (SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'analista.usabilidad@ucr.ac.cr');
SET @vln_P2 = (SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'jefatura.usabilidad@ucr.ac.cr');
SET @vln_P3 = (SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'tecnica.usabilidad@ucr.ac.cr');
SET @vln_P4 = (SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'apoyo.usabilidad@ucr.ac.cr');
SET @vln_P5 = (SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'agente1.usabilidad@ucr.ac.cr');
SET @vln_P6 = (SELECT ID_USUARIO FROM SIMF_USUARIO WHERE CORREO_INSTITUCIONAL = 'agente2.usabilidad@ucr.ac.cr');

-- Si falta alguna cuenta, las llaves foráneas detienen la carga con un error claro.
SELECT @vln_P1 AS P1, @vln_P2 AS P2, @vln_P3 AS P3, @vln_P4 AS P4, @vln_P5 AS P5, @vln_P6 AS P6;

-- Los pedidos usan "Pendiente de pago" como estado inicial: 15-Ajustes-Comentarios-Unidad.sql
-- renombró el antiguo "Pendiente" de las solicitudes de importación.
-- El pedido 2026-302 usa un estado escrito por la Unidad ("En tránsito"): la HU-006 crea el
-- estado la primera vez que alguien lo escribe. Se cataloga aquí para que la carga no dependa de eso.
INSERT INTO SIMM_ESTADO_TRAMITE (ID_TIPO_TRAMITE, NOMBRE, ES_INICIAL, ES_FINAL, CATEGORIA_ESTADO, ORDEN)
SELECT TT.ID_TIPO_TRAMITE, 'En tránsito', 0, 0, 'ACT', 1
FROM SIMM_TIPO_TRAMITE TT
WHERE TT.CODIGO = 'PEDIDO_PROV'
  AND NOT EXISTS (SELECT 1 FROM SIMM_ESTADO_TRAMITE E
                  WHERE E.ID_TIPO_TRAMITE = TT.ID_TIPO_TRAMITE AND E.NOMBRE = 'En tránsito');

-- ---------------------------------------------------------------------------
-- Datos comunes de todos los expedientes: SIMT_TRAMITE.
-- ESTADO es el nombre del estado actual dentro de su tipo de trámite.
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_TRAMITE (REFERENCIA_INTERNA, ID_TIPO_TRAMITE, ID_ESTADO_TRAMITE, ID_USUARIO_RESPONSABLE,
    ID_PAIS_ORIGEN, ID_MONEDA, VALOR_ESTIMADO, DESCRIPCION, REGIMEN_ADUANERO, ADUANA_CONTROL,
    OBSERVACIONES, FECHA_CREACION, FECHA_CIERRE)
SELECT D.REFERENCIA, TT.ID_TIPO_TRAMITE, E.ID_ESTADO_TRAMITE, D.RESPONSABLE, P.ID_PAIS, M.ID_MONEDA,
    D.VALOR, D.DESCRIPCION, D.REGIMEN, D.ADUANA, D.OBSERVACIONES, D.FECHA_CREACION, D.FECHA_CIERRE
FROM (
    -- Pedidos del analista (fondo de la lista de importaciones, T01)
    SELECT '2026-301' AS REFERENCIA, 'PEDIDO_PROV' AS TIPO, 'Pendiente de pago' AS ESTADO, @vln_P1 AS RESPONSABLE,
           NULL AS PAIS, 'USD' AS MONEDA, 18400.00 AS VALOR,
           'Cromatógrafo de gases con detector de ionización de llama' AS DESCRIPCION,
           NULL AS REGIMEN, NULL AS ADUANA,
           'Cromatógrafo de gases con detector de ionización de llama, incluye columna capilar y kit de instalación.' AS OBSERVACIONES,
           '2026-09-22 09:10:00' AS FECHA_CREACION, NULL AS FECHA_CIERRE
    UNION ALL SELECT '2026-302', 'PEDIDO_PROV', 'En tránsito', @vln_P1, NULL, 'EUR', 6250.00,
           'Repuestos para microscopio de fluorescencia', NULL, NULL,
           'Repuestos para microscopio de fluorescencia: lámpara de mercurio y juego de filtros.',
           '2026-08-11 14:25:00', NULL
    -- T02: búsqueda (P1)
    UNION ALL SELECT 'DE-301-26', 'DESALM_ESPECIAL', 'En aduana', @vln_P1, 'CHN', 'USD', 2980.00,
           'Centrífuga refrigerada de laboratorio', 'Importación definitiva', 'Aduana Santamaría',
           'Equipo recibido sin factura comercial; el proveedor envió una constancia de despacho.',
           '2026-09-14 10:05:00', NULL
    -- T02: búsqueda (P2)
    UNION ALL SELECT 'D-302-26', 'DONACION', 'Pendiente de permisos', @vln_P4, 'ESP', 'EUR', 12300.00,
           NULL, 'Importación definitiva', 'Aduana Santamaría',
           'Requiere permiso del Ministerio de Salud antes del desalmacenaje.',
           '2026-09-03 08:40:00', NULL
    -- T03: aprobación (principal y reserva)
    UNION ALL SELECT 'EXO-303-26', 'EXONERACION', 'Pendiente de aprobación', @vln_P3, NULL, NULL, NULL,
           NULL, 'Importación definitiva', 'Aduana Santamaría',
           'Compra de un espectrofotómetro UV-Vis para la Escuela de Química.',
           '2026-10-06 09:30:00', NULL
    UNION ALL SELECT 'EXO-304-26', 'EXONERACION', 'Pendiente de aprobación', @vln_P3, NULL, NULL, NULL,
           NULL, 'Importación definitiva', 'Aduana Central',
           'Compra de dos estaciones totales para la Escuela de Ingeniería Topográfica.',
           '2026-10-07 11:15:00', NULL
    -- T05: revisión documental (principal y reserva)
    UNION ALL SELECT 'EXO-305-26', 'EXONERACION', 'Pendiente revisión documental', @vln_P3, NULL, NULL, NULL,
           NULL, 'Importación definitiva', 'Aduana Santamaría',
           'Compra de un liofilizador de mesa para el Centro de Investigación en Productos Naturales.',
           '2026-10-13 10:20:00', NULL
    UNION ALL SELECT 'EXO-306-26', 'EXONERACION', 'Pendiente revisión documental', @vln_P3, NULL, NULL, NULL,
           NULL, 'Importación definitiva', 'Aduana Santamaría',
           'Compra de un analizador de humedad para la Escuela de Tecnología de Alimentos.',
           '2026-10-14 13:45:00', NULL
    -- T07: seguimiento de donación (principal y reserva)
    UNION ALL SELECT 'DF-307-26', 'DONACION', 'Pendiente de exoneración', @vln_P4, 'USA', 'USD', 15750.00,
           NULL, 'Importación definitiva', 'Aduana Santamaría',
           'Solicitud de exoneración presentada el 02/10/2026; a la espera de la resolución de Hacienda.',
           '2026-09-18 09:00:00', NULL
    UNION ALL SELECT 'DF-308-26', 'DONACION', 'Pendiente de exoneración', @vln_P4, 'CAN', 'USD', 9820.00,
           NULL, 'Importación definitiva', 'Aduana Santamaría',
           'Solicitud de exoneración presentada el 05/10/2026; a la espera de la resolución de Hacienda.',
           '2026-09-21 10:30:00', NULL
    -- T09: prórroga (P5 y P6) y T10: activos
    UNION ALL SELECT 'IT-309-26', 'IMPORT_TEMPORAL', 'Activo en el país', @vln_P5, NULL, 'USD', 7400.00,
           'Estación meteorológica portátil en préstamo para el proyecto de monitoreo del Volcán Turrialba',
           'Importación temporal', 'Aduana Santamaría', NULL, '2026-05-08 08:30:00', NULL
    UNION ALL SELECT 'IT-310-26', 'IMPORT_TEMPORAL', 'Activo en el país', @vln_P6, NULL, 'EUR', 5900.00,
           'Cámara hiperespectral en préstamo para el proyecto de agricultura de precisión',
           'Importación temporal', 'Aduana Santamaría', NULL, '2026-05-14 09:15:00', NULL
    -- T10: históricos y otros estados
    UNION ALL SELECT 'IT-311-26', 'IMPORT_TEMPORAL', 'Finalizado', @vln_P5, NULL, 'USD', 3100.00,
           'Equipo de sonido para el Festival Internacional de Coros', 'Importación temporal',
           'Aduana Santamaría', NULL, '2026-03-02 10:00:00', '2026-09-30'
    UNION ALL SELECT 'EXP-T-312-26', 'EXPORT_TEMPORAL', 'Fuera del país', @vln_P6, NULL, 'CRC', 8650000.00,
           'Espectrómetro de masas enviado a reparación al fabricante, placa UCR 300312',
           'Exportación temporal', 'Santamaría', NULL, '2026-08-05 11:20:00', NULL
    UNION ALL SELECT 'EXP-T-313-26', 'EXPORT_TEMPORAL', 'Finalizado', @vln_P5, NULL, 'CRC', 2140000.00,
           'Osciloscopio enviado a calibración, placa UCR 300313', 'Exportación temporal',
           'Santamaría', NULL, '2026-02-16 09:40:00', '2026-08-28'
    UNION ALL SELECT 'IT-314-26', 'IMPORT_TEMPORAL', 'Por llegar', @vln_P6, NULL, 'USD', 4200.00,
           'Telescopio solar para la semana de la astronomía', 'Importación temporal',
           'Aduana Santamaría', NULL, '2026-10-15 15:10:00', NULL
    UNION ALL SELECT 'IT-315-26', 'IMPORT_TEMPORAL', 'Cancelado', @vln_P5, NULL, 'USD', 2600.00,
           'Robot educativo para competencia estudiantil (actividad suspendida)', 'Importación temporal',
           'Aduana Santamaría', 'La actividad se canceló antes del envío del equipo.',
           '2026-06-10 13:00:00', '2026-07-01'
) D
JOIN SIMM_TIPO_TRAMITE TT ON TT.CODIGO = D.TIPO
JOIN SIMM_ESTADO_TRAMITE E ON E.ID_TIPO_TRAMITE = TT.ID_TIPO_TRAMITE AND E.NOMBRE = D.ESTADO
LEFT JOIN SIMM_PAIS P ON P.CODIGO_ISO = D.PAIS
LEFT JOIN SIMM_MONEDA M ON M.CODIGO_ISO = D.MONEDA;

-- Comprobación: deben quedar 17 expedientes de prueba.
SELECT COUNT(*) AS EXPEDIENTES_CARGADOS
FROM SIMT_TRAMITE
WHERE REFERENCIA_INTERNA IN ('2026-301', '2026-302', 'DE-301-26', 'D-302-26', 'EXO-303-26', 'EXO-304-26',
    'EXO-305-26', 'EXO-306-26', 'DF-307-26', 'DF-308-26', 'IT-309-26', 'IT-310-26', 'IT-311-26',
    'EXP-T-312-26', 'EXP-T-313-26', 'IT-314-26', 'IT-315-26');

-- ---------------------------------------------------------------------------
-- Solicitudes de importación (HU-006).
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_PEDIDO_PROV (ID_TRAMITE, CANTIDAD_SOLICITADA, FECHA_RECIBIDO_EXPEDIENTE, UNIDAD_SOLICITANTE,
    DESCRIPCION_SOLICITUD, NUMERO_CONTRATACION, NUMERO_PEDIDO, COMPANIA_ADJUDICADA, NUMERO_ORDEN_COMPRA,
    INCOTERM, PRESUPUESTO_ORDEN_CRC, MONTO_ORDEN, MONEDA_ORDEN, FECHA_RECIBIDO_SP_OAF,
    FECHA_TRANSFERENCIA, FECHA_ESTIMADA_DESPACHO, FACTURA, PARTIDA)
SELECT T.ID_TRAMITE, D.CANTIDAD, D.RECIBIDO, D.UNIDAD, T.OBSERVACIONES, D.CONTRATACION, D.PEDIDO,
    D.COMPANIA, D.ORDEN, D.INCOTERM, D.PRESUPUESTO, D.MONTO, D.MONEDA, D.SP_OAF, D.TRANSFERENCIA,
    D.DESPACHO, D.FACTURA, D.PARTIDA
FROM (
    SELECT '2026-301' AS REFERENCIA, 1.000 AS CANTIDAD, '2026-09-22' AS RECIBIDO,
           'Escuela de Química' AS UNIDAD, '2026-CFT-000214 UADQ-INT' AS CONTRATACION,
           '088-2026' AS PEDIDO, 'Instrumentos Analíticos del Norte S.A. (ficticia)' AS COMPANIA,
           '2026-145' AS ORDEN, 'FCA' AS INCOTERM, 9800000.00 AS PRESUPUESTO, 18400.00 AS MONTO,
           'USD' AS MONEDA, NULL AS SP_OAF, NULL AS TRANSFERENCIA, '2026-11-10' AS DESPACHO,
           NULL AS FACTURA, 5 AS PARTIDA
    UNION ALL SELECT '2026-302', 3.000, '2026-08-11', 'Centro de Investigación en Biología Celular y Molecular',
           '2026-CFT-000163 UADQ-INT', '061-2026', 'Óptica Científica Europea GmbH (ficticia)', '2026-102',
           'EXW', 3600000.00, 6250.00, 'EUR', '2026-08-20', '2026-09-02', '2026-09-25', 'INV-77810', 2
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA;

-- ---------------------------------------------------------------------------
-- Desalmacenaje especial (T02, P1).
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_DESALMACENAJE_ESPEC (ID_TRAMITE, ORIGEN_DEPENDENCIA, JUSTIFICACION, ESTADO_DOCUMENTAL)
SELECT ID_TRAMITE, 'Escuela de Biología',
    'Equipo institucional que llegó sin factura comercial; se tramita con la constancia de despacho del proveedor.',
    'COMPLETO'
FROM SIMT_TRAMITE WHERE REFERENCIA_INTERNA = 'DE-301-26';

-- ---------------------------------------------------------------------------
-- Solicitudes de exoneración (T03 y T05).
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_EXONERACION (ID_TRAMITE, TIPO_EXONERACION, NUMERO_CONTRATACION, ORDEN_COMPRA_GECO, CONTRATO_SICOP)
SELECT T.ID_TRAMITE, 'COMPRA_INSTITUCIONAL', D.CONTRATACION, D.GECO, D.SICOP
FROM (
    SELECT 'EXO-303-26' AS REFERENCIA, '2026LD-000088-0000900001' AS CONTRATACION,
           'GECO-2026-3303' AS GECO, '2026LD-000088-0000900001-C1' AS SICOP
    UNION ALL SELECT 'EXO-304-26', '2026LD-000091-0000900001', 'GECO-2026-3304', '2026LD-000091-0000900001-C1'
    UNION ALL SELECT 'EXO-305-26', '2026LD-000095-0000900001', 'GECO-2026-3305', '2026LD-000095-0000900001-C1'
    UNION ALL SELECT 'EXO-306-26', '2026LD-000097-0000900001', 'GECO-2026-3306', '2026LD-000097-0000900001-C1'
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA;

-- ---------------------------------------------------------------------------
-- Documentos de respaldo. Los archivos están en documentos/<REFERENCIA>/ junto a este script.
-- ---------------------------------------------------------------------------

INSERT INTO SIMF_DOCUMENTO (ID_TRAMITE, ID_TIPO_DOCUMENTO, ID_USUARIO_CARGA, NOMBRE_ARCHIVO, RUTA_ARCHIVO,
    FECHA_CARGA)
SELECT T.ID_TRAMITE, TD.ID_TIPO_DOCUMENTO, D.USUARIO, D.ARCHIVO,
    CONCAT(D.REFERENCIA, '/pu_', D.ARCHIVO), D.FECHA
FROM (
    -- Desalmacenaje especial DE-301-26
    SELECT 'DE-301-26' AS REFERENCIA, 'RESPALDO' AS TIPO, 'Constancia_despacho_DE-301-26.pdf' AS ARCHIVO,
           @vln_P1 AS USUARIO, '2026-09-14 10:10:00' AS FECHA
    UNION ALL SELECT 'DE-301-26', 'EMBARQUE', 'Guia_aerea_DE-301-26.pdf', @vln_P1, '2026-09-14 10:11:00'
    -- Donación D-302-26
    UNION ALL SELECT 'D-302-26', 'RESOLUCION_ACTA', 'Acta_aceptacion_D-302-26.pdf', @vln_P4, '2026-09-03 08:45:00'
    UNION ALL SELECT 'D-302-26', 'FACTURA', 'Factura_proforma_D-302-26.pdf', @vln_P4, '2026-09-03 08:46:00'
    -- Exoneración EXO-303-26: completa
    UNION ALL SELECT 'EXO-303-26', 'FACTURA', 'Factura_EXO-303-26.pdf', @vln_P3, '2026-10-06 09:35:00'
    UNION ALL SELECT 'EXO-303-26', 'EMBARQUE', 'Guia_aerea_EXO-303-26.pdf', @vln_P3, '2026-10-06 09:36:00'
    UNION ALL SELECT 'EXO-303-26', 'FORMULARIO_S1', 'Formulario_S1_EXO-303-26.pdf', @vln_P3, '2026-10-06 09:37:00'
    UNION ALL SELECT 'EXO-303-26', 'PACKING_LIST', 'Lista_empaque_EXO-303-26.pdf', @vln_P3, '2026-10-06 09:38:00'
    UNION ALL SELECT 'EXO-303-26', 'TRADUCCION_FACTURA', 'Traduccion_factura_EXO-303-26.pdf', @vln_P3, '2026-10-06 09:39:00'
    -- Exoneración EXO-304-26: completa (reserva)
    UNION ALL SELECT 'EXO-304-26', 'FACTURA', 'Factura_EXO-304-26.pdf', @vln_P3, '2026-10-07 11:20:00'
    UNION ALL SELECT 'EXO-304-26', 'EMBARQUE', 'Conocimiento_embarque_EXO-304-26.pdf', @vln_P3, '2026-10-07 11:21:00'
    UNION ALL SELECT 'EXO-304-26', 'FORMULARIO_S1', 'Formulario_S1_EXO-304-26.pdf', @vln_P3, '2026-10-07 11:22:00'
    UNION ALL SELECT 'EXO-304-26', 'PACKING_LIST', 'Lista_empaque_EXO-304-26.pdf', @vln_P3, '2026-10-07 11:23:00'
    -- Exoneración EXO-305-26: falta la lista de empaque; S1 y traducción sin revisar
    UNION ALL SELECT 'EXO-305-26', 'FACTURA', 'Factura_EXO-305-26.pdf', @vln_P3, '2026-10-13 10:25:00'
    UNION ALL SELECT 'EXO-305-26', 'EMBARQUE', 'Guia_aerea_EXO-305-26.pdf', @vln_P3, '2026-10-13 10:26:00'
    UNION ALL SELECT 'EXO-305-26', 'FORMULARIO_S1', 'Formulario_S1_EXO-305-26.pdf', @vln_P3, '2026-10-15 08:50:00'
    UNION ALL SELECT 'EXO-305-26', 'TRADUCCION_FACTURA', 'Traduccion_factura_EXO-305-26.pdf', @vln_P3, '2026-10-15 08:52:00'
    -- Exoneración EXO-306-26: misma situación (reserva)
    UNION ALL SELECT 'EXO-306-26', 'FACTURA', 'Factura_EXO-306-26.pdf', @vln_P3, '2026-10-14 13:50:00'
    UNION ALL SELECT 'EXO-306-26', 'EMBARQUE', 'Guia_aerea_EXO-306-26.pdf', @vln_P3, '2026-10-14 13:51:00'
    UNION ALL SELECT 'EXO-306-26', 'FORMULARIO_S1', 'Formulario_S1_EXO-306-26.pdf', @vln_P3, '2026-10-16 09:05:00'
    UNION ALL SELECT 'EXO-306-26', 'TRADUCCION_FACTURA', 'Traduccion_factura_EXO-306-26.pdf', @vln_P3, '2026-10-16 09:07:00'
    -- Donaciones DF-307-26 y DF-308-26
    UNION ALL SELECT 'DF-307-26', 'RESOLUCION_ACTA', 'Acta_aceptacion_DF-307-26.pdf', @vln_P4, '2026-09-18 09:05:00'
    UNION ALL SELECT 'DF-307-26', 'FACTURA', 'Factura_DF-307-26.pdf', @vln_P4, '2026-09-18 09:06:00'
    UNION ALL SELECT 'DF-307-26', 'EMBARQUE', 'Guia_aerea_DF-307-26.pdf', @vln_P4, '2026-09-18 09:07:00'
    UNION ALL SELECT 'DF-308-26', 'RESOLUCION_ACTA', 'Acta_aceptacion_DF-308-26.pdf', @vln_P4, '2026-09-21 10:35:00'
    UNION ALL SELECT 'DF-308-26', 'FACTURA', 'Factura_DF-308-26.pdf', @vln_P4, '2026-09-21 10:36:00'
    -- Importaciones temporales activas IT-309-26 e IT-310-26
    UNION ALL SELECT 'IT-309-26', 'OFICIO_SOLICITUD', 'Oficio_solicitud_IT-309-26.pdf', @vln_P5, '2026-05-08 08:35:00'
    UNION ALL SELECT 'IT-309-26', 'RESOL_AUTORIZACION', 'Resolucion_autorizacion_IT-309-26.pdf', @vln_P5, '2026-05-18 10:00:00'
    UNION ALL SELECT 'IT-309-26', 'DUA_IMPORT_TEMPORAL', 'DUA_importacion_temporal_IT-309-26.pdf', @vln_P5, '2026-05-20 14:00:00'
    UNION ALL SELECT 'IT-310-26', 'OFICIO_SOLICITUD', 'Oficio_solicitud_IT-310-26.pdf', @vln_P6, '2026-05-14 09:20:00'
    UNION ALL SELECT 'IT-310-26', 'RESOL_AUTORIZACION', 'Resolucion_autorizacion_IT-310-26.pdf', @vln_P6, '2026-05-25 10:30:00'
    UNION ALL SELECT 'IT-310-26', 'DUA_IMPORT_TEMPORAL', 'DUA_importacion_temporal_IT-310-26.pdf', @vln_P6, '2026-05-27 15:00:00'
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA
JOIN SIMM_TIPO_DOCUMENTO TD ON TD.CODIGO = D.TIPO;

-- ---------------------------------------------------------------------------
-- Donaciones (T02 y T07). La resolución o acta de aceptación es obligatoria (HU-024).
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_DONACION (ID_TRAMITE, ID_DOCUMENTO_ACEPTACION, TIPO_DONACION, NOMBRE_DONANTE,
    REFERENCIA_FUNDACION_UCR)
SELECT T.ID_TRAMITE, DOC.ID_DOCUMENTO, D.TIPO, D.DONANTE, D.REF_FUNDACION
FROM (
    SELECT 'D-302-26' AS REFERENCIA, 'INTERNACIONAL' AS TIPO,
           'Instituto Iberoamericano de Óptica (donante ficticio)' AS DONANTE, NULL AS REF_FUNDACION
    UNION ALL SELECT 'DF-307-26', 'FUNDACION_UCR', 'Fundación Amigos de la Ciencia (donante ficticio)',
           'FUCR-2026-0307'
    UNION ALL SELECT 'DF-308-26', 'FUNDACION_UCR', 'Red Norteamericana de Bibliotecas Científicas (donante ficticio)',
           'FUCR-2026-0308'
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA
JOIN SIMM_TIPO_DOCUMENTO TD ON TD.CODIGO = 'RESOLUCION_ACTA'
JOIN SIMF_DOCUMENTO DOC ON DOC.ID_TRAMITE = T.ID_TRAMITE AND DOC.ID_TIPO_DOCUMENTO = TD.ID_TIPO_DOCUMENTO;

-- ---------------------------------------------------------------------------
-- Revisión documental de las exoneraciones (HU-019 y HU-021).
-- EXO-303-26 y EXO-304-26: todo recibido, por eso están en Pendiente de aprobación.
-- EXO-305-26 y EXO-306-26: factura y documento de embarque recibidos; el formulario S1 y la
--   traducción se cargaron sin revisar y la lista de empaque no se ha recibido (T05).
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_REVISION_DOCUMENTO (ID_DOCUMENTO, ID_USUARIO_REVISOR, ESTADO_REVISION, OBSERVACION, FECHA_HORA)
SELECT DOC.ID_DOCUMENTO, @vln_P3, 'RECIBIDO', 'Documento conforme.', DOC.FECHA_CARGA + INTERVAL 1 DAY
FROM SIMF_DOCUMENTO DOC
JOIN SIMT_TRAMITE T ON T.ID_TRAMITE = DOC.ID_TRAMITE
JOIN SIMM_TIPO_DOCUMENTO TD ON TD.ID_TIPO_DOCUMENTO = DOC.ID_TIPO_DOCUMENTO
WHERE T.REFERENCIA_INTERNA IN ('EXO-303-26', 'EXO-304-26')
   OR (T.REFERENCIA_INTERNA IN ('EXO-305-26', 'EXO-306-26') AND TD.CODIGO IN ('FACTURA', 'EMBARQUE'));

-- Observación confirmada que la jefatura ve al revisar EXO-303-26 (HU-020).
INSERT INTO SIMT_OBSERVACION_EXPED (ID_TRAMITE, ID_USUARIO_AUTOR, MOTIVO, OBSERVACION, ESTADO_OBSERVACION,
    FECHA_CREACION, FECHA_CONFIRMACION)
SELECT T.ID_TRAMITE, @vln_P3, 'Aclaración', D.OBSERVACION, 'CON', D.FECHA, D.FECHA
FROM (
    SELECT 'EXO-303-26' AS REFERENCIA,
           'El proveedor confirmó por correo que la factura incluye el flete hasta Miami; el valor CIF se calculará al ingresar la mercancía.' AS OBSERVACION,
           '2026-10-08 15:20:00' AS FECHA
    UNION ALL SELECT 'EXO-304-26',
           'La unidad solicitante aclaró que las dos estaciones totales se entregan en un solo embarque.',
           '2026-10-09 10:10:00'
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA;

-- ---------------------------------------------------------------------------
-- Importaciones y exportaciones temporales (T09 y T10).
-- ---------------------------------------------------------------------------

INSERT INTO SIMT_TRAMITE_TEMPORAL (ID_TRAMITE, UNIDAD_SOLICITANTE, OFICIO_SOLICITUD, FECHA_RECEPCION,
    ESTADO_MERCANCIA, NUMERO_FACTURA, ANTECEDENTE, EN_GARANTIA, PESO_KG, ID_PAIS_DESTINO, OFICIO_ADUANA,
    NUMERO_GESTION, RESOLUCION_AUTORIZACION, NUMERO_DUA_INICIO, FECHA_DUA_INICIO, FECHA_VENCIMIENTO,
    UNIDAD_PLAZO, CANTIDAD_PLAZO, NUMERO_DUA_CIERRE, FECHA_DUA_CIERRE, FECHA_REINGRESO,
    CANCELACION_REGIMEN, FECHA_CANCELACION)
SELECT T.ID_TRAMITE, D.UNIDAD, D.OFICIO, D.RECEPCION, D.MERCANCIA, D.FACTURA, D.ANTECEDENTE, D.GARANTIA,
    D.PESO, P.ID_PAIS, D.OFICIO_ADUANA, D.GESTION, D.RESOLUCION, D.DUA_INICIO, D.FECHA_DUA_INICIO,
    D.VENCIMIENTO, D.UNIDAD_PLAZO, D.CANTIDAD_PLAZO, D.DUA_CIERRE, D.FECHA_DUA_CIERRE, D.REINGRESO,
    D.CANCELACION, D.FECHA_CANCELACION
FROM (
    SELECT 'IT-309-26' AS REFERENCIA, 'Escuela Centroamericana de Geología' AS UNIDAD,
           'ECG-112-2026' AS OFICIO, '2026-05-07' AS RECEPCION, 'USADA' AS MERCANCIA, 'PF-30921' AS FACTURA,
           NULL AS ANTECEDENTE, NULL AS GARANTIA, NULL AS PESO, NULL AS PAIS,
           'OS-UI-309-2026' AS OFICIO_ADUANA, '3091-2026' AS GESTION,
           'MH-DGA-AS-DT-STO-RES-3091-2026' AS RESOLUCION, '005-2026-300309' AS DUA_INICIO,
           '2026-05-20' AS FECHA_DUA_INICIO, '2026-11-20' AS VENCIMIENTO, 'MESES' AS UNIDAD_PLAZO,
           6 AS CANTIDAD_PLAZO, NULL AS DUA_CIERRE, NULL AS FECHA_DUA_CIERRE, NULL AS REINGRESO,
           NULL AS CANCELACION, NULL AS FECHA_CANCELACION
    UNION ALL SELECT 'IT-310-26', 'Centro de Investigaciones Agronómicas', 'CIA-087-2026', '2026-05-13',
           'USADA', 'PF-31055', NULL, NULL, NULL, NULL, 'OS-UI-310-2026', '3102-2026',
           'MH-DGA-AS-DT-STO-RES-3102-2026', '005-2026-300310', '2026-05-27', '2026-11-27', 'MESES', 6,
           NULL, NULL, NULL, NULL, NULL
    UNION ALL SELECT 'IT-311-26', 'Escuela de Artes Musicales', 'EAM-021-2026', '2026-03-02',
           'USADA', 'SR', NULL, NULL, NULL, NULL, 'OS-UI-311-2026', '3113-2026',
           'MH-DGA-AS-DT-STO-RES-3113-2026', '005-2026-300311', '2026-03-16', '2026-09-16', 'MESES', 6,
           '005-2026-300411', '2026-09-10', NULL, 'Correo de cancelación del régimen del 30/09/2026',
           '2026-09-30'
    UNION ALL SELECT 'EXP-T-312-26', 'Centro de Investigación en Contaminación Ambiental', 'CICA-205-2026',
           '2026-08-05', 'USADA', '312-2026', 'Placa UCR 300312', 1, 48.00, 'USA', 'OS-UI-312-2026',
           '3124-2026', 'MH-DGA-AS-DT-STO-OF-3124-2026', '005-2026-300312', '2026-08-10', '2027-02-10',
           'MESES', 6, NULL, NULL, NULL, NULL, NULL
    UNION ALL SELECT 'EXP-T-313-26', 'Escuela de Ingeniería Eléctrica', 'EIE-033-2026', '2026-02-16',
           'USADA', '313-2026', 'Placa UCR 300313', 0, 6.50, 'DEU', 'OS-UI-313-2026', '3135-2026',
           'MH-DGA-AS-DT-STO-OF-3135-2026', '005-2026-300313', '2026-02-20', '2026-08-20', 'MESES', 6,
           '005-2026-300413', '2026-08-18', '2026-08-14', 'Correo de cancelación del régimen del 28/08/2026',
           '2026-08-28'
    UNION ALL SELECT 'IT-314-26', 'Escuela de Física', 'EF-198-2026', '2026-10-15', 'NUEVA', 'SR',
           NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
    UNION ALL SELECT 'IT-315-26', 'Escuela de Ciencias de la Computación e Informática', 'ECCI-140-2026',
           '2026-06-10', 'NUEVA', 'SR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
           NULL, NULL, NULL, NULL, NULL, 'Oficio ECCI-151-2026: la actividad se canceló', '2026-07-01'
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA
LEFT JOIN SIMM_PAIS P ON P.CODIGO_ISO = D.PAIS;

-- Cada agente queda asignado a su propio expediente de prórroga.
INSERT INTO SIMT_TEMPORAL_AGENTE (ID_TRAMITE, ID_USUARIO_AGENTE)
SELECT T.ID_TRAMITE, D.AGENTE
FROM (
    SELECT 'IT-309-26' AS REFERENCIA, @vln_P5 AS AGENTE
    UNION ALL SELECT 'IT-310-26', @vln_P6
    UNION ALL SELECT 'EXP-T-312-26', @vln_P6
    UNION ALL SELECT 'IT-314-26', @vln_P6
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA;

-- ---------------------------------------------------------------------------
-- Historial de estados: el recorrido que llevó a cada expediente a su estado actual, para que el
-- seguimiento (HU-044) y la aprobación (HU-022) muestren antecedentes.
-- ---------------------------------------------------------------------------

INSERT INTO SIMH_ESTADO_TRAMITE (ID_TRAMITE, ID_ESTADO_ANTERIOR, ID_ESTADO_NUEVO, ID_USUARIO, JUSTIFICACION,
    FECHA_HORA)
SELECT T.ID_TRAMITE, EA.ID_ESTADO_TRAMITE, EN.ID_ESTADO_TRAMITE, D.USUARIO, D.JUSTIFICACION, D.FECHA
FROM (
    SELECT '2026-301' AS REFERENCIA, NULL AS ANTERIOR, 'Pendiente de pago' AS NUEVO, @vln_P1 AS USUARIO,
           'Registro inicial de la solicitud de importación.' AS JUSTIFICACION, '2026-09-22 09:10:00' AS FECHA
    UNION ALL SELECT '2026-302', NULL, 'Pendiente de pago', @vln_P1, 'Registro inicial de la solicitud de importación.', '2026-08-11 14:25:00'
    UNION ALL SELECT '2026-302', 'Pendiente de pago', 'En tránsito', @vln_P1, 'Actualización de la solicitud de importación.', '2026-09-25 16:00:00'
    UNION ALL SELECT 'DE-301-26', NULL, 'Pendiente', @vln_P1, 'Registro inicial del expediente.', '2026-09-14 10:05:00'
    UNION ALL SELECT 'DE-301-26', 'Pendiente', 'Documentación en revisión', @vln_P1, 'Se adjuntó la constancia de despacho del proveedor.', '2026-09-16 09:00:00'
    UNION ALL SELECT 'DE-301-26', 'Documentación en revisión', 'En trámite', @vln_P1, 'Documentación completa para el desalmacenaje.', '2026-09-24 11:30:00'
    UNION ALL SELECT 'DE-301-26', 'En trámite', 'En aduana', @vln_P1, 'El agente presentó el DUA en la Aduana Santamaría.', '2026-10-09 14:15:00'
    UNION ALL SELECT 'D-302-26', NULL, 'Pendiente', @vln_P4, 'Registro inicial del expediente.', '2026-09-03 08:40:00'
    UNION ALL SELECT 'D-302-26', 'Pendiente', 'Documentación en revisión', @vln_P4, 'Se recibió la factura proforma del donante.', '2026-09-05 10:00:00'
    UNION ALL SELECT 'D-302-26', 'Documentación en revisión', 'Pendiente de permisos', @vln_P4, 'El equipo requiere permiso sanitario.', '2026-09-12 13:20:00'
    UNION ALL SELECT 'EXO-303-26', NULL, 'Pendiente revisión documental', @vln_P3, 'Registro inicial del expediente.', '2026-10-06 09:30:00'
    UNION ALL SELECT 'EXO-303-26', 'Pendiente revisión documental', 'Pendiente de aprobación', @vln_P3,
           'Documentación obligatoria completa: el expediente continúa a aprobación (HU-021).', '2026-10-08 16:00:00'
    UNION ALL SELECT 'EXO-304-26', NULL, 'Pendiente revisión documental', @vln_P3, 'Registro inicial del expediente.', '2026-10-07 11:15:00'
    UNION ALL SELECT 'EXO-304-26', 'Pendiente revisión documental', 'Pendiente de aprobación', @vln_P3,
           'Documentación obligatoria completa: el expediente continúa a aprobación (HU-021).', '2026-10-09 10:30:00'
    UNION ALL SELECT 'EXO-305-26', NULL, 'Pendiente revisión documental', @vln_P3, 'Registro inicial del expediente.', '2026-10-13 10:20:00'
    UNION ALL SELECT 'EXO-306-26', NULL, 'Pendiente revisión documental', @vln_P3, 'Registro inicial del expediente.', '2026-10-14 13:45:00'
    UNION ALL SELECT 'DF-307-26', NULL, 'Pendiente', @vln_P4, 'Registro inicial del expediente.', '2026-09-18 09:00:00'
    UNION ALL SELECT 'DF-307-26', 'Pendiente', 'Documentación en revisión', @vln_P4, 'Se recibió la factura y la guía aérea del donante.', '2026-09-22 10:15:00'
    UNION ALL SELECT 'DF-307-26', 'Documentación en revisión', 'Pendiente de exoneración', @vln_P4, 'Se presentó la solicitud de exoneración ante Hacienda.', '2026-10-02 14:40:00'
    UNION ALL SELECT 'DF-308-26', NULL, 'Pendiente', @vln_P4, 'Registro inicial del expediente.', '2026-09-21 10:30:00'
    UNION ALL SELECT 'DF-308-26', 'Pendiente', 'Documentación en revisión', @vln_P4, 'Se recibió la factura del donante.', '2026-09-25 09:30:00'
    UNION ALL SELECT 'DF-308-26', 'Documentación en revisión', 'Pendiente de exoneración', @vln_P4, 'Se presentó la solicitud de exoneración ante Hacienda.', '2026-10-05 11:00:00'
    UNION ALL SELECT 'IT-309-26', NULL, 'Por llegar', @vln_P5, 'Registro inicial del expediente.', '2026-05-08 08:30:00'
    UNION ALL SELECT 'IT-309-26', 'Por llegar', 'En gestión aduanera', @vln_P5, 'Oficio enviado a la aduana.', '2026-05-11 09:00:00'
    UNION ALL SELECT 'IT-309-26', 'En gestión aduanera', 'Activo en el país', @vln_P5, 'DUA de importación temporal aceptado.', '2026-05-20 14:00:00'
    UNION ALL SELECT 'IT-310-26', NULL, 'Por llegar', @vln_P6, 'Registro inicial del expediente.', '2026-05-14 09:15:00'
    UNION ALL SELECT 'IT-310-26', 'Por llegar', 'En gestión aduanera', @vln_P6, 'Oficio enviado a la aduana.', '2026-05-18 10:00:00'
    UNION ALL SELECT 'IT-310-26', 'En gestión aduanera', 'Activo en el país', @vln_P6, 'DUA de importación temporal aceptado.', '2026-05-27 15:00:00'
    UNION ALL SELECT 'IT-311-26', NULL, 'Por llegar', @vln_P5, 'Registro inicial del expediente.', '2026-03-02 10:00:00'
    UNION ALL SELECT 'IT-311-26', 'Por llegar', 'Activo en el país', @vln_P5, 'DUA de importación temporal aceptado.', '2026-03-16 11:00:00'
    UNION ALL SELECT 'IT-311-26', 'Activo en el país', 'Finalizado', @vln_P5, 'Equipo reexportado y régimen cancelado.', '2026-09-30 15:00:00'
    UNION ALL SELECT 'EXP-T-312-26', NULL, 'Por salir', @vln_P6, 'Registro inicial del expediente.', '2026-08-05 11:20:00'
    UNION ALL SELECT 'EXP-T-312-26', 'Por salir', 'Fuera del país', @vln_P6, 'DUA de exportación temporal aceptado.', '2026-08-10 16:00:00'
    UNION ALL SELECT 'EXP-T-313-26', NULL, 'Por salir', @vln_P5, 'Registro inicial del expediente.', '2026-02-16 09:40:00'
    UNION ALL SELECT 'EXP-T-313-26', 'Por salir', 'Fuera del país', @vln_P5, 'DUA de exportación temporal aceptado.', '2026-02-20 10:00:00'
    UNION ALL SELECT 'EXP-T-313-26', 'Fuera del país', 'Finalizado', @vln_P5, 'Equipo reimportado y régimen cancelado.', '2026-08-28 14:00:00'
    UNION ALL SELECT 'IT-314-26', NULL, 'Por llegar', @vln_P6, 'Registro inicial del expediente.', '2026-10-15 15:10:00'
    UNION ALL SELECT 'IT-315-26', NULL, 'Por llegar', @vln_P5, 'Registro inicial del expediente.', '2026-06-10 13:00:00'
    UNION ALL SELECT 'IT-315-26', 'Por llegar', 'Cancelado', @vln_P5, 'La actividad se canceló antes del envío del equipo.', '2026-07-01 09:00:00'
) D
JOIN SIMT_TRAMITE T ON T.REFERENCIA_INTERNA = D.REFERENCIA
LEFT JOIN SIMM_ESTADO_TRAMITE EA ON EA.ID_TIPO_TRAMITE = T.ID_TIPO_TRAMITE AND EA.NOMBRE = D.ANTERIOR
JOIN SIMM_ESTADO_TRAMITE EN ON EN.ID_TIPO_TRAMITE = T.ID_TIPO_TRAMITE AND EN.NOMBRE = D.NUEVO;

-- ---------------------------------------------------------------------------
-- Bitácora: registro de cada expediente y documentos agregados.
-- ---------------------------------------------------------------------------

INSERT INTO SIML_BITACORA (ID_TRAMITE, ID_USUARIO, ACCION, ENTIDAD_AFECTADA, ID_REGISTRO_AFECTADO,
    DATOS_ANTERIORES, DATOS_NUEVOS, FECHA_HORA)
SELECT T.ID_TRAMITE, T.ID_USUARIO_RESPONSABLE, 'REGISTRO',
    CASE TT.CODIGO
        WHEN 'EXONERACION' THEN 'SIMT_EXONERACION'
        WHEN 'DONACION' THEN 'SIMT_DONACION'
        WHEN 'IMPORT_TEMPORAL' THEN 'SIMT_TRAMITE_TEMPORAL'
        WHEN 'EXPORT_TEMPORAL' THEN 'SIMT_TRAMITE_TEMPORAL'
        WHEN 'PEDIDO_PROV' THEN 'SIMT_PEDIDO_PROV'
        ELSE 'SIMT_DESALMACENAJE_ESPEC'
    END,
    T.ID_TRAMITE, NULL,
    CONCAT(TT.NOMBRE, ' ', T.REFERENCIA_INTERNA, ' registrado (datos de las pruebas de usabilidad).'),
    T.FECHA_CREACION
FROM SIMT_TRAMITE T
JOIN SIMM_TIPO_TRAMITE TT ON TT.ID_TIPO_TRAMITE = T.ID_TIPO_TRAMITE
WHERE T.REFERENCIA_INTERNA IN ('2026-301', '2026-302', 'DE-301-26', 'D-302-26', 'EXO-303-26', 'EXO-304-26',
    'EXO-305-26', 'EXO-306-26', 'DF-307-26', 'DF-308-26', 'IT-309-26', 'IT-310-26', 'IT-311-26',
    'EXP-T-312-26', 'EXP-T-313-26', 'IT-314-26', 'IT-315-26');

INSERT INTO SIML_BITACORA (ID_TRAMITE, ID_USUARIO, ACCION, ENTIDAD_AFECTADA, ID_REGISTRO_AFECTADO,
    DATOS_ANTERIORES, DATOS_NUEVOS, FECHA_HORA)
SELECT DOC.ID_TRAMITE, DOC.ID_USUARIO_CARGA, 'DOCUMENTO_AGREGADO', 'SIMF_DOCUMENTO', DOC.ID_DOCUMENTO, NULL,
    CONCAT(TD.NOMBRE, ': ', DOC.NOMBRE_ARCHIVO, '.'), DOC.FECHA_CARGA
FROM SIMF_DOCUMENTO DOC
JOIN SIMM_TIPO_DOCUMENTO TD ON TD.ID_TIPO_DOCUMENTO = DOC.ID_TIPO_DOCUMENTO
JOIN SIMT_TRAMITE T ON T.ID_TRAMITE = DOC.ID_TRAMITE
WHERE T.REFERENCIA_INTERNA IN ('DE-301-26', 'D-302-26', 'EXO-303-26', 'EXO-304-26', 'EXO-305-26',
    'EXO-306-26', 'DF-307-26', 'DF-308-26', 'IT-309-26', 'IT-310-26');

INSERT INTO SIML_BITACORA (ID_TRAMITE, ID_USUARIO, ACCION, ENTIDAD_AFECTADA, ID_REGISTRO_AFECTADO,
    DATOS_ANTERIORES, DATOS_NUEVOS, FECHA_HORA)
SELECT H.ID_TRAMITE, H.ID_USUARIO, 'CAMBIO_ESTADO', 'SIMT_TRAMITE', H.ID_TRAMITE,
    CONCAT('Estado: ', EA.NOMBRE, '.'),
    CONCAT('Estado: ', EN.NOMBRE, '. Justificación: ', H.JUSTIFICACION),
    H.FECHA_HORA
FROM SIMH_ESTADO_TRAMITE H
JOIN SIMT_TRAMITE T ON T.ID_TRAMITE = H.ID_TRAMITE
JOIN SIMM_ESTADO_TRAMITE EA ON EA.ID_ESTADO_TRAMITE = H.ID_ESTADO_ANTERIOR
JOIN SIMM_ESTADO_TRAMITE EN ON EN.ID_ESTADO_TRAMITE = H.ID_ESTADO_NUEVO
WHERE T.REFERENCIA_INTERNA IN ('2026-302', 'DE-301-26', 'D-302-26', 'EXO-303-26', 'EXO-304-26',
    'DF-307-26', 'DF-308-26', 'IT-309-26', 'IT-310-26', 'IT-311-26', 'EXP-T-312-26', 'EXP-T-313-26',
    'IT-315-26');

-- ---------------------------------------------------------------------------
-- Resultado: expedientes de prueba con su estado, responsable y cantidad de documentos.
-- ---------------------------------------------------------------------------

SELECT T.REFERENCIA_INTERNA,
       TT.NOMBRE AS TIPO_TRAMITE,
       E.NOMBRE AS ESTADO,
       U.NOMBRE_COMPLETO AS RESPONSABLE,
       TMP.FECHA_VENCIMIENTO,
       (SELECT COUNT(*) FROM SIMF_DOCUMENTO D WHERE D.ID_TRAMITE = T.ID_TRAMITE) AS DOCUMENTOS
FROM SIMT_TRAMITE T
JOIN SIMM_TIPO_TRAMITE TT ON TT.ID_TIPO_TRAMITE = T.ID_TIPO_TRAMITE
JOIN SIMM_ESTADO_TRAMITE E ON E.ID_ESTADO_TRAMITE = T.ID_ESTADO_TRAMITE
JOIN SIMF_USUARIO U ON U.ID_USUARIO = T.ID_USUARIO_RESPONSABLE
LEFT JOIN SIMT_TRAMITE_TEMPORAL TMP ON TMP.ID_TRAMITE = T.ID_TRAMITE
WHERE T.REFERENCIA_INTERNA IN ('2026-301', '2026-302', 'DE-301-26', 'D-302-26', 'EXO-303-26', 'EXO-304-26',
    'EXO-305-26', 'EXO-306-26', 'DF-307-26', 'DF-308-26', 'IT-309-26', 'IT-310-26', 'IT-311-26',
    'EXP-T-312-26', 'EXP-T-313-26', 'IT-314-26', 'IT-315-26')
ORDER BY T.REFERENCIA_INTERNA;
