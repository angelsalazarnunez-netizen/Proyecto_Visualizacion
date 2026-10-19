/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 22/09/2026
 * Descripción: Máscaras de captura para los códigos que digita la Unidad de Importaciones
 *   (referencias internas, contrataciones, órdenes de compra y contratos). Acomodan lo que la
 *   persona escribe o pega, sin bloquearle el teclado: colocan los guiones en su lugar, pasan
 *   las letras a mayúscula y descartan lo que no corresponde al formato.
 *
 *   Plantillas admitidas:
 *     #  un dígito
 *     A  una letra
 *     *  una letra o un dígito
 *   Cualquier otro carácter de la plantilla, como el guion, se escribe solo.
 */

const VALIDACIONES = {
  "#": (caracter) => /[0-9]/.test(caracter),
  A: (caracter) => /[A-ZÑ]/.test(caracter),
  "*": (caracter) => /[0-9A-ZÑ]/.test(caracter),
};

/** Plantillas de los códigos que se usan en los trámites. */
export const PLANTILLAS = {
  referencia: "####-####",
  contratacion: "####AA-######-##########",
  ordenCompra: "####-######",
  contrato: "####-######",
};

/**
 * Acomoda el texto según la plantilla indicada.
 *
 * @param {string} texto texto escrito o pegado por la persona
 * @param {string} plantilla plantilla de la máscara
 * @param {string} prefijo prefijo que se descarta si lo digitan o lo pegan
 * @returns {string} texto con el formato de la plantilla
 */
export function aplicarMascara(texto, plantilla, prefijo = "") {
  let limpio = (texto ?? "").toUpperCase().trim();

  if (prefijo) {
    const mayuscula = prefijo.toUpperCase();
    const inicios = [mayuscula, mayuscula.replace("-", ""), mayuscula.replace("-", " ")];
    for (const inicio of inicios) {
      if (inicio && limpio.startsWith(inicio)) {
        limpio = limpio.slice(inicio.length);
        break;
      }
    }
  }

  const caracteres = [...limpio].filter((caracter) => /[0-9A-ZÑ]/.test(caracter));
  let resultado = "";
  let posicion = 0;

  for (const simbolo of plantilla) {
    if (posicion >= caracteres.length) {
      break;
    }

    const validacion = VALIDACIONES[simbolo];
    if (!validacion) {
      resultado += simbolo;
      continue;
    }

    while (posicion < caracteres.length && !validacion(caracteres[posicion])) {
      posicion += 1;
    }

    if (posicion < caracteres.length) {
      resultado += caracteres[posicion];
      posicion += 1;
    }
  }

  return resultado;
}

/**
 * Devuelve el manejador de cambio de un campo con máscara.
 *
 * @param {Function} asignar función que guarda el valor en el estado
 * @param {string} plantilla plantilla de la máscara
 * @param {string} prefijo prefijo que no se digita
 */
export function alEscribirConMascara(asignar, plantilla, prefijo = "") {
  return (evento) => asignar(aplicarMascara(evento.target.value, plantilla, prefijo));
}
