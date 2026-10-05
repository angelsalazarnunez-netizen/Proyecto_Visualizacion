package cr.ac.ucr.sim.sla;

import cr.ac.ucr.sim.entidadnegocio.autenticacion.EntIniciarSesion;
import cr.ac.ucr.sim.entidadnegocio.autenticacion.EntRespuestaSesion;
import cr.ac.ucr.sim.logicanegocio.autenticacion.BllAutenticacion;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Servicio REST del inicio y cierre de sesión (HU-004).
 */
@RestController
@RequestMapping("/api/autenticacion")
public class Ws_SIM_Autenticacion {

    private final BllAutenticacion vgo_BllAutenticacion;

    public Ws_SIM_Autenticacion(BllAutenticacion pvo_BllAutenticacion) {
        this.vgo_BllAutenticacion = pvo_BllAutenticacion;
    }

    @PostMapping("/login")
    public ResponseEntity<EntRespuestaSesion> IniciarSesion(
            @Valid @RequestBody EntIniciarSesion pvo_Entrada) {
        return ResponseEntity.ok(this.vgo_BllAutenticacion.IniciarSesion(
                pvo_Entrada.getCorreoInstitucional(),
                pvo_Entrada.getContrasena()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> CerrarSesion(HttpServletRequest pvo_Solicitud) {
        String vlc_Autorizacion = pvo_Solicitud.getHeader("Authorization");
        String vlc_Token = vlc_Autorizacion != null && vlc_Autorizacion.startsWith("Bearer ")
                ? vlc_Autorizacion.substring("Bearer ".length()).trim()
                : null;
        this.vgo_BllAutenticacion.CerrarSesion(vlc_Token);
        return ResponseEntity.noContent().build();
    }
}
