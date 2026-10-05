package cr.ac.ucr.sim.seguridad;

import cr.ac.ucr.sim.accesodatos.autenticacion.DalSesion;
import cr.ac.ucr.sim.accesodatos.autenticacion.DalAutorizacion;
import cr.ac.ucr.sim.accesodatos.autenticacion.DalUsuario;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 10/09/2026
 * Descripción: Configuración de seguridad del sistema.
 */
@Configuration
public class CfgSeguridad {

    /**
     * Autor: Katherine Susana Valverde Fallas
     * Fecha: 10/09/2026
     * Descripción: El inicio de sesión y el registro de cuenta son públicos; las demás llamadas
     *   a la API requieren un token de sesión.
     *
     * @param pvo_HttpSecurity configuración HTTP
     * @return cadena de filtros
     * @throws Exception si la configuración falla
     */
    @Bean
    public SecurityFilterChain FiltroSeguridad(
            HttpSecurity pvo_HttpSecurity,
            DalSesion pvo_DalSesion,
            DalAutorizacion pvo_DalAutorizacion,
            DalUsuario pvo_DalUsuario) throws Exception {
        AuthenticationEntryPoint vlo_EntradaNoAutenticada =
                (pvo_Solicitud, pvo_Respuesta, pvo_Excepcion) ->
                        pvo_Respuesta.sendError(401, "Debe iniciar sesión para continuar.");
        AccessDeniedHandler vlo_AccesoDenegado =
                (pvo_Solicitud, pvo_Respuesta, pvo_Excepcion) ->
                        pvo_Respuesta.sendError(403, "No cuenta con autorización para esta operación.");

        pvo_HttpSecurity
                .csrf(pvo_Csrf -> pvo_Csrf.disable())
                .formLogin(pvo_Formulario -> pvo_Formulario.disable())
                .httpBasic(pvo_Basic -> pvo_Basic.disable())
                .sessionManagement(pvo_Sesion -> pvo_Sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(pvo_Autorizacion -> pvo_Autorizacion
                        .requestMatchers(
                                "/api/autenticacion/login",
                                "/api/autenticacion/registro",
                                "/api/autenticacion/verificar",
                                "/api/autenticacion/asignar-rol",
                                "/error")
                        .permitAll()
                        .requestMatchers("/api/**")
                        .authenticated()
                        .anyRequest()
                        .permitAll())
                .exceptionHandling(pvo_Errores -> pvo_Errores
                        .authenticationEntryPoint(vlo_EntradaNoAutenticada)
                        .accessDeniedHandler(vlo_AccesoDenegado))
                .addFilterBefore(
                        new FiltroAutenticacionToken(pvo_DalSesion, pvo_DalAutorizacion, pvo_DalUsuario),
                        UsernamePasswordAuthenticationFilter.class);
        return pvo_HttpSecurity.build();
    }

    @Bean
    public PasswordEncoder CodificadorContrasena() {
        return new BCryptPasswordEncoder();
    }
}
