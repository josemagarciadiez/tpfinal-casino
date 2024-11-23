/**
 * Interface que define los métodos
 * esenciales para un juego en el casino.
 */
export interface IJuego {
  /**
   * Método para inicializar el juego y exponer las configuraciones necesarias.
   * @returns Un objeto con las configuraciones iniciales del juego:
   * - `instrucciones`: Descripción de cómo jugar el juego.
   * - `rondas`: Número total de rondas que se jugarán en el juego.
   * - `apuestaMinima`: Monto mínimo requerido para realizar una apuesta en cada ronda.
   * - `accionesIniciales`: (Opcional) Array de objetos que describen las posibles acciones iniciales para el juego.
   *
   *  Cada objeto contiene:
   *      | `valor`: Identificador único para la acción.
   *      | `mensaje`: Descripción o texto a mostrar en el menu para que el usuario seleccione la acción.
   *
   */
  iniciar(): {
    instrucciones: string;
    rondas: number;
    apuestaMinima: number;
    accionesIniciales?: {
      valor: string;
      mensaje: string;
    }[];
  };

  /**
   * Método para ejecutar una ronda del juego.
   * @param apuesta - Monto de dinero que el usuario desea apostar en la ronda.
   * @param accionElegida - (Opcional) Acción seleccionada por el jugador, si el juego lo requiere.
   * Esta accion coincidira con la propiedad valor de las acciones iniciales, o de las nuevas acciones
   * enviadas al terminar la ultima ronda.
   * @returns Un objeto que describe el resultado de la ronda:
   * - `resultado`: Estado del resultado, puede ser:
   *
   *   | `"victoria"`: Indica que el jugador ganó.
   *   | `"derrota"`: Indica que el jugador perdió.
   *   | `"proceso"`: Indica que la ronda continúa y requiere otra acción. |
   *
   * - `ganancia`: Monto ganado por el jugador. En caso de resultado "derrota" este monto sera omitido por
   * el sistema.
   * - `informacion`: (Opcional) Cadena de texto para mostrar un mensaje especial al usuario.
   * Por ejemplo el resultado de la ronda, que sera mostrado antes de el listado de acciones.
   * Se utiliza para darle contexto al usuario sobre que accion tomar en el juego.
   * - `acciones`: (Opcional) Array de objetos con las posibles acciones disponibles tras la ronda,
   *   con el mismo formato que `accionesIniciales`. Estas acciones seran mostradas al usuario luego
   * de la informacion (si existe) y el la accion seleccionada sera recibida por el metodo
   * ejecutarRonda() del juego.
   */
  ejecutarRonda(
    apuesta: number,
    accionElegida?: string
  ): {
    resultado: "victora" | "derrota" | "proceso";
    ganancia: number;
    informacion?: string;
    acciones?: { valor: string; mensaje: string }[];
  };
}
