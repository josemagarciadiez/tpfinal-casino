// Modelos
import { Juego } from "./Juego";
import { Jugador } from "./Jugador";

// Clases utilitarias
import { Menu } from "../utils/Menu";

export abstract class Tragamonedas extends Juego {
  protected readonly tiros = 5;
  protected readonly simbolos = ["🍒", "🍋", "🍇", "🔔", "⭐", "💔"] as const;

  protected readonly pagos = {
    "🍒": 0.2,
    "🍋": 0.25,
    "🍇": 0.3,
    "🔔": 0.35,
    "⭐": 0.4,
    "💔": 0.1,
  };

  /**
   *
   * @param jugador
   * @returns
   */
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // PUNTO DE ENTRADA AL JUEGO
    // 1. Muestro primera pantalla
    this.interface();
    // 2. Pido apuesta al jugador
    let apuesta = await this.obtenerApuesta(jugador);
    // 3. Variable para guardar pozo acumulado.
    let premioAcumulado = 0;
    // 4. Chequear si la apuesta es 0, se sale.
    if (!apuesta) {
      return {
        apuestaTotal: 0,
        resultado: "derrota",
      };
    }

    // 5. Actualizar pantalla.
    this.interface(apuesta, premioAcumulado, true);

    // 6. Determino las variables para manejar la interaccion
    // con el usuario.

    let opciones = [
      {
        valor: "tirar",
        nombre: "🎰 [Girar palanca]",
      },
      {
        valor: "salir",
        nombre: "↩️  [Salir del juego]",
      },
    ];

    // 6. Comienza el ciclo de los 5 tiros x juego
    for (let r = 0; r < this.tiros; r++) {
      // 7. Actualizo pantalla para mostrar tiros restantes
      this.interface(apuesta, premioAcumulado, false, r);
      // 8. Giro la palanca
      const tiro = await this.simularTiro();
      // 9. Calculo ganancia
      const gananciaRonda = this.calcularGanancias(tiro, apuesta);
      // 9.a. Si hubo ganancia la sumo
      if (gananciaRonda) {
        premioAcumulado += gananciaRonda;
        // 9.a.1 - ACTUALIZAR PANTALLA
        this.interface(apuesta, premioAcumulado, false, r);
        // 9.a.2 - Mostrar resultado de la ronda
        this.resultadoRonda(tiro, gananciaRonda, "victoria");
      } else {
        // 9.b. Si no, achico pozo
        const perdidaRonda = Math.floor(premioAcumulado * 0.4);
        if (perdidaRonda >= premioAcumulado) {
          premioAcumulado = 0;
        } else {
          premioAcumulado -= perdidaRonda;
        }
        // 9.b.1 - ACTUALIZAR PANTALLA
        this.interface(apuesta, premioAcumulado, false, r);
        // 9.b.2 - Mostrar resultado de la ronda
        this.resultadoRonda(tiro, perdidaRonda, "derrota");
      }

      // 10. Salto de linea
      console.log();
      // 11. Chequeo si no es el ultimo tiro
      if (r < this.tiros - 1) {
        // 12. Pregunto al usuario
        const opcion = await Menu.elegirOpcion(
          "¿Que quieres hacer a continuación?",
          opciones
        );
        // 13.
        if (opcion === "salir") {
          // 14.
          const confirmacion = await Menu.pedirConfirmacion(
            "¿Estás seguro de salir? Perderás todo lo apostado hasta ahora."
          );
          // 15.
          if (confirmacion) {
            await this.mostrarResultado("derrota", jugador, true, true);
            return {
              apuestaTotal: apuesta,
              resultado: "derrota",
            };
          }
        }
      }
    }

    // 16. Si no gano nada, muestro resultado y retorno resultado de la jugada.
    if (premioAcumulado === 0) {
      // 17. Muestro resultado
      await this.mostrarResultado("derrota", jugador, false, false);
      // 18. Retorno a casino el resultado de la jugada.
      return {
        apuestaTotal: apuesta,
        resultado: "derrota",
      };
    }

    // 19. Si gano algo, sumo saldo al jugador
    jugador.sumarSaldo(premioAcumulado);
    // 20. Muestro resultado.
    await this.mostrarResultado("victoria", jugador, false, false);
    // 21. Retorno a casino el resultado de la jugada.
    return {
      apuestaTotal: apuesta,
      resultado: "victoria",
      ganancia: premioAcumulado,
    };
  }

  /**
   *
   * @param jugador
   * @returns
   */
  private async obtenerApuesta(jugador: Jugador): Promise<number> {
    const apuesta = await Menu.pedirNumero(
      "¿Cúanto quieres apostar?  [0: Para salír]",
      (entrada) => {
        if (typeof entrada === "number") {
          if (entrada !== 0 && entrada < this.apuestaMinima) {
            return `El mínimo para apostar en la primer ronda es de ${this.apuestaMinima} por ronda.`;
          }

          if (entrada > jugador.obtenerSaldo()) {
            return `No cuentas con saldo suficiente para realizar esta apuesta. Tu saldo ${jugador.obtenerSaldo()}`;
          }

          jugador.restarSaldo(entrada);

          return true;
        } else {
          return "Debes ingresar un número válido.";
        }
      }
    );

    return apuesta;
  }

  /**
   *
   * @param apuestaTotal
   * @param premioTotal
   * @param esPrimeraApuesta
   * @param tiros
   */
  private async interface(
    apuestaTotal?: number,
    premioTotal?: number,
    esPrimeraApuesta = true,
    tiros: number = 0
  ) {
    console.clear();
    console.log("=======================================================");
    console.log(`                   ${this.transformarNombre(this.nombre)}`);
    console.log("=======================================================");
    console.log(
      `💰  Apuesta total: ${apuestaTotal ?? "--"}         🏆  Pozo acumulado: ${premioTotal ? premioTotal : "--"}`
    );

    console.log("=======================================================");

    if (!esPrimeraApuesta) {
      // Actualizo tiros restantes
      console.log(
        `                   TIROS RESTANTES: ${this.tiros - tiros - 1}`
      );
      console.log("=======================================================");
    }
    console.log();
  }

  /** POLIMORFISMO */
  protected async mostrarResultado(
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    limpiar: boolean = true,
    salir: boolean = false
  ): Promise<void> {
    super.mostrarResultado(resultado, jugador, limpiar);
    const opciones = [
      {
        valor: "jugar",
        nombre: "🔁  Volver a jugar",
        desactivada: jugador.obtenerSaldo() < this.apuestaMinima,
      },
      {
        valor: "salir",
        nombre: "↩️   Salir",
      },
    ];

    // Si el usuario eligio salir, se muestra mensaje
    // y se redirige automaticamente.
    if (salir) {
      // Conteo para volver al menu
      for (let i = 5; i > 0; i--) {
        if (i === 1) {
          process.stdout.write(
            `\r🔄  Seras redirigido al menu principal en ${i} segundo..`
          );
        } else {
          process.stdout.write(
            `\r🔄  Seras redirigido al menu principal en ${i} segundos..`
          );
        }
        // Esperar 1 s
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      // Si no, se muestran las opciones
      const opcion = await Menu.elegirOpcion(
        "¿Que quieres hacer a continuación?",
        opciones
      );

      if (opcion === "jugar") {
        // TODO: Agregar aqui la escritura de la partida en base de datos.
        await this.ejecutar(jugador);
      }
    }
  }

  /**
   *
   * @param nombre
   * @returns
   */
  private transformarNombre(nombre: string) {
    // Separar nombre
    const partes = nombre.split(" ");
    // Extraer emoji del final
    const emoji = partes.pop();
    // Juntar solo texto
    const texto = partes.join(" ");
    // Retornar texto transformado
    return `${emoji}  ${texto.toUpperCase()} ${emoji}`;
  }

  /** */
  protected abstract resultadoRonda(
    tiro: string[] | string[][],
    monto: number,
    tipo: "victoria" | "derrota"
  ): void;

  protected abstract simularTiro(): Promise<string[] | string[][]>;

  /** */
  protected abstract contarCoincidencias(tiro: string[] | string[][]):
    | { simbolo: string; concurrencia: number }
    | {
        simbolo: string;
        lugar: "columna" | "fila" | "diagonal";
        concurrencia: number;
      }[]
    | { simbolo: string; lugar: "full" }
    | null;

  /** */
  protected abstract calcularGanancias(
    tiro: string[] | string[][],
    apuesta: number
  ): number;
}
