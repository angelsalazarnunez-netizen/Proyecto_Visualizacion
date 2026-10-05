package cr.ac.ucr.sim.sla;

import cr.ac.ucr.sim.logicanegocio.autenticacion.ExcepcionNegocio;
import cr.ac.ucr.sim.logicanegocio.autenticacion.ExcepcionAutenticacion;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 10/09/2026
 * Descripción: Traduce las excepciones de negocio a respuestas HTTP con un mensaje en español,
 *   sin exponer códigos internos ni nombres de tablas o de clases, según el estándar D06.
 */
@RestControllerAdvice
public class ManejadorExcepciones {

    @ExceptionHandler(ExcepcionAutenticacion.class)
    public ResponseEntity<Map<String, String>> ManejarExcepcionAutenticacion(
            ExcepcionAutenticacion pvo_Excepcion) {
        Map<String, String> vlo_Cuerpo = new HashMap<>();
        vlo_Cuerpo.put("mensaje", pvo_Excepcion.getMessage());
        return ResponseEntity.status(pvo_Excepcion.getEstadoHttp()).body(vlo_Cuerpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> ManejarErrorValidacion(
            MethodArgumentNotValidException pvo_Excepcion) {
        Map<String, String> vlo_Errores = pvo_Excepcion.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        error -> NombreCampoHttp(error.getField()),
                        error -> error.getDefaultMessage() == null
                                ? "El valor no es válido."
                                : error.getDefaultMessage(),
                        (pvc_Anterior, pvc_Nuevo) -> pvc_Anterior));
        Map<String, Object> vlo_Cuerpo = new HashMap<>();
        vlo_Cuerpo.put("mensaje", vlo_Errores.values().stream().findFirst()
                .orElse("El formulario contiene datos inválidos."));
        vlo_Cuerpo.put("errores", vlo_Errores);
        return ResponseEntity.badRequest().body(vlo_Cuerpo);
    }

    private static String NombreCampoHttp(String pvc_Campo) {
        return switch (pvc_Campo) {
            case "vgc_CorreoInstitucional" -> "correoInstitucional";
            case "vgc_Contrasena" -> "contrasena";
            default -> pvc_Campo;
        };
    }

    /**
     * Autor: Katherine Susana Valverde Fallas
     * Fecha: 10/09/2026
     * Descripción: Reporta el incumplimiento de una regla de negocio.
     *
     * @param pvo_Excepcion excepción de negocio
     * @return cuerpo JSON con el mensaje para la persona usuaria
     */
    @ExceptionHandler(ExcepcionNegocio.class)
    public ResponseEntity<Map<String, String>> ManejarExcepcionNegocio(ExcepcionNegocio pvo_Excepcion) {
        Map<String, String> vlo_Cuerpo = new HashMap<>();
        vlo_Cuerpo.put("mensaje", pvo_Excepcion.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(vlo_Cuerpo);
    }
}
