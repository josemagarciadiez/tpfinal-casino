import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";
import { Menu } from "../utils/Menu";

export class LuckySpin extends Juego {
  private readonly simbolos = ["🍒", "🍋", "🍇", "🔔", "⭐"];
  private readonly pagos = {
    "🍒": 0.2,
    "🍋": 0.25,
    "🍇": 0.3,
    "🔔": 0.35,
    "⭐": 0.4,
  };
  private readonly tiros = 5;
  private readonly apuestaMinima = 100;

  constructor() {
    super();
    this.nombre = "Lucky Spin 🛼";
    this.instrucciones = this.leerInstrucciones("luckyspin.txt");
  }

  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // PUNTO DE ENTRADA AL JUEGO
    // 1. Muestro primera pantalla
    this.interface();
    // 2. Pido apuesta al jugador
    let apuesta = await this.obtenerApuesta(jugador, true);
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
      const gananciaRonda = this.calcularGanancia(tiro, apuesta);
      // Si hubo ganancia la sumo
      if (gananciaRonda) {
        premioAcumulado += gananciaRonda;
        // ACTUALIZAR PANTALLA
        this.interface(apuesta, premioAcumulado, false, r);
        console.log(
          `                   [ ${tiro.join(" | ")} ]   😃 \x1b[32m+ ${gananciaRonda}\x1b[0m`
        );
      } else {
        // Si no, achico pozo
        const perdidaRonda = Math.floor(premioAcumulado * 0.4);
        if (perdidaRonda >= premioAcumulado) {
          premioAcumulado = 0;
        } else {
          premioAcumulado -= perdidaRonda;
        }
        // ACTUALIZAR PANTALLA
        this.interface(apuesta, premioAcumulado, false, r);
        console.log(
          `                   [ ${tiro.join(" | ")} ]   😔 \x1b[31m- ${perdidaRonda}\x1b[0m`
        );
      }

      console.log();
      // 10. Chequeo si no es el ultimo tiro
      if (r < this.tiros - 1) {
        // 11. Pregunto al usuario
        const opcion = await Menu.elegirOpcion(
          "¿Que quieres hacer a continuación?",
          opciones
        );

        if (opcion === "salir") {
          break;
        }
      }
    }

    jugador.sumarSaldo(premioAcumulado);

    console.log("MOSTRAR RESULTADO");
    // Esperar 3 s
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      apuestaTotal: apuesta,
      resultado: "victoria",
      ganancia: premioAcumulado,
    };
  }

  private async simularTiro() {
    const rieles = [this.simbolos[0], this.simbolos[0], this.simbolos[0]]; // Inicializamos con el primer simbolo
    for (let i = 0; i < rieles.length; i++) {
      for (let j = 0; j < 5; j++) {
        rieles[i] =
          this.simbolos[Math.floor(Math.random() * this.simbolos.length)];

        process.stdout.write(`\r                   [ ${rieles.join(" | ")} ] `);

        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      rieles[i] =
        this.simbolos[Math.floor(Math.random() * this.simbolos.length)];
    }

    return rieles;
  }

  /**
   *
   */
  private contarCoincidencias(tiro: string[]): {
    simbolo: string;
    concurrencia: number;
  } | null {
    // Creo un contador
    const contador: Record<string, number> = {};
    // y lo lleno
    for (let i = 0; i < tiro.length; i++) {
      contador[tiro[i]] = (contador[tiro[i]] || 0) + 1;
    }
    // Lo recorro y veo que simbolo se repite 2 o 3 veces.
    // Si un simbolo esta 2 veces no puede estar 3,
    // pero un simbolo que esta 3 veces, esta 2 tambien.
    for (const [simbolo, concurrencia] of Object.entries(contador)) {
      if (concurrencia === 2 || concurrencia === 3) {
        return {
          simbolo,
          concurrencia,
        };
      }
    }

    return null;
  }

  /**
   *
   */
  private calcularGanancia(tiro: string[], apuesta: number): number {
    // 7. Calculo si hubo coincidencias y muestor resultado
    const resultado = this.contarCoincidencias(tiro);
    // Si hubo 2 coincidencias
    if (resultado) {
      const simbolo = resultado.simbolo as "🍒" | "🍋" | "🍇" | "🔔" | "⭐";
      // Si el simbolo se repitio solo 2 veces, pago el 80% del multiplicador
      if (resultado.concurrencia === 2) {
        return Math.floor(apuesta * this.pagos[simbolo] * 0.8);
      } else {
        // Si se repitio 3 veces, pago el multiplicador completo
        return Math.floor(apuesta * this.pagos[simbolo]);
      }
    }
    // Si no hubo coincidencias, retorno 0.
    return 0;
  }

  /**
   * Metodo para solicitar monto de apuesta
   * al usuario en la consola.
   * Se pasan todas las validaciones al callback de la clase Menu.
   * MISMO METODO QUE DADOS (PODRIAMOS HEREDAR?)
   */
  private async obtenerApuesta(
    jugador: Jugador,
    esPrimeraApuesta = false
  ): Promise<number> {
    let mensaje = esPrimeraApuesta
      ? "¿Cúanto quieres apostar inicialmente?  [0: Para salír]"
      : "¿En cuanto quieres subir la apuesta?   [0: Para volver]";

    const apuesta = await Menu.pedirNumero(mensaje, (entrada) => {
      if (typeof entrada === "number") {
        if (esPrimeraApuesta && entrada !== 0 && entrada < this.apuestaMinima) {
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
    });

    return apuesta;
  }

  /**
   * Metodo para imprimir encabezado con
   * estadisticas del juego actual.
   */
  private async interface(
    apuestaTotal?: number,
    premioTotal?: number,
    esPrimeraApuesta = true,
    tiros: number = 0
  ) {
    console.clear();
    console.log("=======================================================");
    console.log("                   🛼  LUCKY SPIN 🛼");
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
}
