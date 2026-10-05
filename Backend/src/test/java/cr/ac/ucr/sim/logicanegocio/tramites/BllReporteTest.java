package cr.ac.ucr.sim.logicanegocio.tramites;

import cr.ac.ucr.sim.accesodatos.tramites.DalReporte;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntFiltroReporte;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntLineaReporte;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntReporteConsultas;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntTramiteReporte;
import cr.ac.ucr.sim.logicanegocio.autenticacion.ExcepcionNegocio;
import cr.ac.ucr.sim.utilerias.Constantes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 25/09/2026
 * Descripción: Pruebas del reporte de consultas internas (HU-036): sus totales, sus desgloses y
 *   la validación de los criterios con los que se genera.
 */
@ExtendWith(MockitoExtension.class)
class BllReporteTest {

    @Mock
    private DalReporte vgo_DalReporte;

    @InjectMocks
    private BllReporte vgo_BllReporte;

    @BeforeEach
    void PrepararPrueba() {
        lenient().when(this.vgo_DalReporte.SIMT_TRAMITE_ObtenerListaReporte(any(), anyString(), anyString()))
                .thenReturn(this.CrearTramites());
    }

    @Test
    void Generar_ConTramitesRegistrados_DebeContarlosYTotalizarElCifPorMoneda() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        assertEquals(4, vlo_Reporte.getCantidadTramites());
        EntLineaReporte vlo_Colones = this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Desalmacenaje especial", "CRC");
        assertEquals(2, vlo_Colones.getCantidadTramites());
        assertEquals(new BigDecimal("76000.00"), vlo_Colones.getTotalCif());
    }

    @Test
    void Generar_ConMonedasDistintas_DebeSepararLasLineasSinSumarlas() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        EntLineaReporte vlo_Dolares = this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Desalmacenaje especial", "USD");
        assertEquals(1, vlo_Dolares.getCantidadTramites());
        assertEquals(new BigDecimal("1200.00"), vlo_Dolares.getTotalCif());
    }

    @Test
    void Generar_ConUnTramiteSinMoneda_DebeAgruparloComoSinMoneda() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        EntLineaReporte vlo_Linea = this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Solicitud de exoneración", Constantes.MONEDA_NO_DECLARADA);
        assertEquals(1, vlo_Linea.getCantidadTramites());
        assertEquals(BigDecimal.ZERO, vlo_Linea.getTotalCif());
    }

    @Test
    void Generar_ConTramitesQueDeclaranImpuestos_DebeTotalizarlosPorLinea() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        EntLineaReporte vlo_Linea = this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Desalmacenaje especial", "CRC");
        assertEquals(new BigDecimal("10000.00"), vlo_Linea.getTotalImpuestosPagados());
        assertEquals(new BigDecimal("1500.00"), vlo_Linea.getTotalImpuestosExonerados());
        assertEquals(new BigDecimal("25000.00"), vlo_Linea.getTotalBodegaje());
    }

    @Test
    void Generar_ConTramitesSinMontosDeclarados_DebeDejarLosTotalesEnCero() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        EntLineaReporte vlo_Linea = this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Desalmacenaje especial", "USD");
        assertEquals(BigDecimal.ZERO, vlo_Linea.getTotalImpuestosPagados());
        assertEquals(BigDecimal.ZERO, vlo_Linea.getTotalBodegaje());
    }

    @Test
    void Generar_AgrupandoPorPartidoResponsable_DebeTabularPorQuienAsumeElCosto() {
        EntReporteConsultas vlo_Reporte =
                this.vgo_BllReporte.Generar(this.CrearFiltro("PARTIDO_RESPONSABLE"));

        assertEquals(1, this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Unidad de Importaciones", "CRC").getCantidadTramites());
        assertEquals(1, this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                "Escuela de Química", "CRC").getCantidadTramites());
    }

    @Test
    void Generar_ConDatosValidos_DebeSumarLosPermisosRegulatorios() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        assertEquals(4, vlo_Reporte.getCantidadPermisos());
    }

    @Test
    void Generar_AgrupandoPorRegimenAduanero_DebeTabularPorEseCriterio() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("REGIMEN_ADUANERO"));

        assertEquals(Constantes.AGRUPACION_REGIMEN_ADUANERO, vlo_Reporte.getAgrupadoPor());
        assertEquals(2, this.BuscarLinea(vlo_Reporte.getAgrupacion(), "Importación definitiva", "CRC")
                .getCantidadTramites());
    }

    @Test
    void Generar_ConUnTramiteSinRegimen_DebeAgruparloComoSinRegistrar() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("REGIMEN_ADUANERO"));

        assertEquals(1, this.BuscarLinea(vlo_Reporte.getAgrupacion(),
                Constantes.DATO_NO_REGISTRADO, Constantes.MONEDA_NO_DECLARADA).getCantidadTramites());
    }

    @Test
    void Generar_AgrupandoPorDependencia_DebeTabularPorLaUnidadResponsable() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("DEPENDENCIA"));

        assertEquals(1, this.BuscarLinea(vlo_Reporte.getAgrupacion(), "Escuela de Química", "CRC")
                .getCantidadTramites());
    }

    @Test
    void Generar_AgrupandoPorMes_DebeUsarElAnioYElMesDelRegistro() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("MES"));

        assertEquals(3, this.BuscarLinea(vlo_Reporte.getAgrupacion(), "2026-09", "CRC")
                .getCantidadTramites() + this.BuscarLinea(vlo_Reporte.getAgrupacion(), "2026-09", "USD")
                .getCantidadTramites());
    }

    @Test
    void Generar_ConCualquierAgrupacion_DebeIncluirLosDesglosesPorTipoYPorRegimen() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("MES"));

        assertFalse(vlo_Reporte.getPorTipoTramite().isEmpty());
        assertFalse(vlo_Reporte.getPorRegimenAduanero().isEmpty());
    }

    @Test
    void Generar_SinPedirLaEnumeracion_NoDebeDevolverLosTramites() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        assertTrue(vlo_Reporte.getTramites().isEmpty());
    }

    @Test
    void Generar_PidiendoEnumerarLosTramites_DebeDevolverLaLista() {
        EntFiltroReporte vlo_Filtro = this.CrearFiltro("TIPO_TRAMITE");
        vlo_Filtro.setEnumerarTramites(true);

        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(vlo_Filtro);

        assertEquals(4, vlo_Reporte.getTramites().size());
    }

    @Test
    void Generar_ConDatosValidos_DebeAdvertirLosMontosQueElSistemaNoRegistra() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro("TIPO_TRAMITE"));

        assertTrue(vlo_Reporte.getNotas().contains(Constantes.NOTA_REPORTE_MONTOS_PENDIENTES));
    }

    @Test
    void Generar_SinIndicarAgrupacion_DebeAgruparPorTipoDeTramite() {
        EntReporteConsultas vlo_Reporte = this.vgo_BllReporte.Generar(this.CrearFiltro(null));

        assertEquals(Constantes.AGRUPACION_TIPO_TRAMITE, vlo_Reporte.getAgrupadoPor());
    }

    @Test
    void Generar_ConUnCriterioDeAgrupacionInvalido_DebeLanzarExcepcion() {
        ExcepcionNegocio vlo_Excepcion = assertThrows(ExcepcionNegocio.class,
                () -> this.vgo_BllReporte.Generar(this.CrearFiltro("POR_COLOR")));

        assertEquals(Constantes.MENSAJE_AGRUPACION_INVALIDA, vlo_Excepcion.getMessage());
    }

    @Test
    void Generar_ConLaFechaFinalAnteriorALaInicial_DebeLanzarExcepcion() {
        EntFiltroReporte vlo_Filtro = this.CrearFiltro("TIPO_TRAMITE");
        vlo_Filtro.setFechaDesde(LocalDate.of(2026, 9, 30));
        vlo_Filtro.setFechaHasta(LocalDate.of(2026, 9, 1));

        ExcepcionNegocio vlo_Excepcion = assertThrows(ExcepcionNegocio.class,
                () -> this.vgo_BllReporte.Generar(vlo_Filtro));

        assertEquals(Constantes.MENSAJE_RANGO_DE_FECHAS_INVALIDO, vlo_Excepcion.getMessage());
    }

    @Test
    void Generar_SinCriterios_DebeLanzarExcepcion() {
        ExcepcionNegocio vlo_Excepcion = assertThrows(ExcepcionNegocio.class,
                () -> this.vgo_BllReporte.Generar(null));

        assertEquals(Constantes.MENSAJE_DATOS_INCOMPLETOS, vlo_Excepcion.getMessage());
    }

    // ---------------------------------------------------------------- Datos de apoyo

    private EntLineaReporte BuscarLinea(List<EntLineaReporte> pvo_LsLineas, String pvc_Grupo, String pvc_Moneda) {
        return pvo_LsLineas.stream()
                .filter(vlo_Linea -> vlo_Linea.getGrupo().equals(pvc_Grupo)
                        && vlo_Linea.getMoneda().equals(pvc_Moneda))
                .findFirst()
                .orElseGet(EntLineaReporte::new);
    }

    private EntFiltroReporte CrearFiltro(String pvc_AgruparPor) {
        EntFiltroReporte vlo_Filtro = new EntFiltroReporte();
        vlo_Filtro.setAgruparPor(pvc_AgruparPor);
        return vlo_Filtro;
    }

    private List<EntTramiteReporte> CrearTramites() {
        return List.of(
                new EntTramiteReporte("DE-2026-0001", "Desalmacenaje especial", "Importación definitiva",
                        "Pendiente", "CRC", new BigDecimal("75000.00"), "Escuela de Física",
                        "Unidad de Importaciones", new BigDecimal("9000.00"), new BigDecimal("1500.00"),
                        new BigDecimal("25000.00"), null,
                        LocalDateTime.of(2026, 9, 10, 9, 0), 2L),
                new EntTramiteReporte("DE-2026-0002", "Desalmacenaje especial", "Importación definitiva",
                        "En trámite", "CRC", new BigDecimal("1000.00"), "Escuela de Química",
                        "Escuela de Química", new BigDecimal("1000.00"), null, null, null,
                        LocalDateTime.of(2026, 9, 12, 9, 0), 1L),
                new EntTramiteReporte("DE-2026-0003", "Desalmacenaje especial", "Tránsito aduanero",
                        "Pendiente", "USD", new BigDecimal("1200.00"), "Escuela de Física",
                        "Unidad de Importaciones", null, null, null, null,
                        LocalDateTime.of(2026, 9, 14, 9, 0), 0L),
                new EntTramiteReporte("EXO-2026-0001", "Solicitud de exoneración", null,
                        "Pendiente revisión documental", null, null, null, null, null, null, null,
                        "COMPRA_INSTITUCIONAL",
                        LocalDateTime.of(2026, 8, 30, 9, 0), 1L));
    }
}
