import { IJuego } from "./IJuego";

/**
 * Clase abstracta que implementa la interfaz `IJuego`.
 * Proporciona la estructura base y atributos comunes para los juegos en el casino.
 */
export abstract class Juego implements IJuego {
  // Instrucciones de juego que explican al usuario como jugar.
  protected instrucciones!: string;
  // Número total de rondas para el juego.
  protected cantidadRondas!: number;
  // Monto mínimo requerido para realizar una apuesta en cada ronda.
  protected apuestaMinima!: number;
  // Premio acumulado durante las rondas del juego.
  protected premioAcumulado!: number;

  /**
   * Método para inicializar el juego y exponer sus configuraciones iniciales.
   * Este método viene con una implementación básica.
   *
   * **Nota** En el caso que la clase concreta necesite exponer
   * acciones iniciales especificas, se debera sobreescribir el método.
   */
  iniciar(): {
    instrucciones: string;
    rondas: number;
    apuestaMinima: number;
    accionesIniciales?: { valor: string; mensaje: string }[];
  } {
    return {
      instrucciones: this.instrucciones,
      rondas: this.cantidadRondas,
      apuestaMinima: this.apuestaMinima,
    };
  }

  /**
   * Método abstracto para ejecutar una ronda del juego.
   * Debe ser implementado por las clases concretas.
   */
  abstract ejecutarRonda(
    apuesta: number,
    accionElegida?: string
  ): {
    resultado: "victora" | "derrota" | "proceso";
    ganancia: number;
    informacion?: string;
    acciones?: { valor: string; mensaje: string }[];
  };
}
