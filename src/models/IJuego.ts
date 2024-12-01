import { Jugador } from "./Jugador";

export interface IJuego {
  /**
   * Método para mostrar el nombre del juego..
   * @returns {string} Cadena de texto que contiene el nombre del juego.
   */
  obtenerNombre(): string;

  /**
   * Método para mostrar las instrucciones del juego.
   * @returns {string} Cadena de texto formateada para mostrar al usuario las instrucciones de juego.
   */
  obtenerInstrucciones(): string;

  /**
   * Inicia la ejecución del juego concreto.
   * Este método transfiere el control del flujo del programa desde la clase `Casino` al juego,
   * permitiendo que el juego gestione su lógica interna y la interacción con el usuario
   * durante su ciclo de vida. Al finalizar, el control regresa a la clase `Casino` y se
   * retorna información relevante sobre la jugada para su registro en el log.
   *
   * @param {Jugador} jugador - Instancia de la clase `Jugador` que representa al jugador
   *                            participando en el juego.
   * @returns Un objeto con detalles de la jugada realizada:
   *          - `apuestaTotal`: Monto total apostado por el jugador en todas las rondas del juego.
   *          - `resultado`: Resultado del juego, desde el punto de vista del jugador. Puede ser "victoria" o "derrota"
   *          - `ganancia`: (Opcional) Monto total pagado por el casino al jugador si el resultado fue "victoria".
   *                                   Si el resultado fue "derrota", este valor será `undefined`.
   */

  ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }>;

  /**
   * Muestra en pantalla el resultado del juego ejecutado.
   * Ademas le pregunta al usuario que quiere hacer a continuación [Jugar otra vez] o [Salir]
   *
   * @param apuestaTotal  Monto total apostado por el jugador en todas las rondas del juego.
   * @param resultado     Resultado del juego, desde el punto de vista del jugador. Puede ser "victoria" o "derrota"
   * @param jugador       Instancia de la clase `Jugador` que representa al jugador que participó en el juego.
   * @param apuestaMinima Monto minimo para apostar en el juego seleccionado.
   * @param abandono      Flag que indica si el usuario esta abandonando el juego a mitad de partida.
   * @param ganancia      (Opcional) Monto total pagado por el casino al jugador si el resultado fue "victoria".
   *                                   Si el resultado fue "derrota", este valor será `undefined`.
   *
   * @returns La opción seleccionada por el jugador en la pantalla.
   */
  mostrarResultado(
    apuestaTotal: number,
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    apuestaMinima: number,
    abandono?: boolean,
    ganancia?: number
  ): Promise<"jugar" | "salir">;
}
