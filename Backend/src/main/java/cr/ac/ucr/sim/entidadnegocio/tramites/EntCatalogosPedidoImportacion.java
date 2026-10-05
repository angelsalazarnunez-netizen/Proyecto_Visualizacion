package cr.ac.ucr.sim.entidadnegocio.tramites;

import java.util.List;

public record EntCatalogosPedidoImportacion(
        List<String> unidadesSolicitantes,
        List<String> companiasAdjudicadas,
        List<String> incoterms,
        List<String> monedas) {
}
