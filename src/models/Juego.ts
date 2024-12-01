import * as fs from "fs";

import { IJuego } from "./IJuego";
import { Jugador } from "./Jugador";
import { Menu } from "../utils/Menu";

export abstract class Juego implements IJuego {
  protected nombre!: string;
  protected instrucciones!: string;
  protected apuestaMinima!: number;

  obtenerNombre(): string {
    return this.nombre;
  }

  obtenerInstrucciones(): string {
    return this.instrucciones;
  }

  obtenerApuestaMinima(): number {
    return this.apuestaMinima;
  }

  abstract ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }>;

  async mostrarResultado(
    apuestaTotal: number,
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    apuestaMinima: number,
    abandono: boolean = false,
    ganancia?: number
  ): Promise<"jugar" | "salir"> {
    /*** LOGICA DE PANTALLA  */
    console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    if (resultado === "victoria") {
      console.log("🎉 🍾  =======================================  🎉 🍾");
      console.log("         🥇 🏆 ¡FELICIDADES! ¡HAS GANADO! 🥇 🏆");
      console.log("=======================================================");
      console.log(`💰   Ganancia total: ${ganancia}`);
      console.log("🎲   ¡La suerte estuvo de tu lado!");
      console.log("🍾   Disfruta de tu victoria y sigue jugando.");
      console.log("=======================================================");
    } else {
      console.log("💔 ❤️‍🩹  =======================================  💔 ❤️‍🩹");
      console.log("          🥲 😔 LO SENTIMOS, HAS PERDIDO 🥲 😔");
      console.log("=======================================================");
      console.log(`❌   Pérdida total: ${apuestaTotal}`);
      console.log("🎲   ¡No te rindas, la próxima vez será mejor!");
      console.log("🃏   Inténtalo de nuevo y vence a la casa.");
      console.log("=======================================================");
    }

    // Opciones del menu
    const opciones = [
      {
        valor: "jugar",
        nombre: "🔁  Volver a jugar",
        desactivada: jugador.obtenerSaldo() <= apuestaMinima,
      },
      {
        valor: "salir",
        nombre: "↩️   Salir",
      },
    ];

    // Si el usuario esta abandonando la partida,
    // se redirige al Menu Principal luego del conteo.
    if (abandono) {
      // Cuenta regresiva,
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
        // cada 1 segundo
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return "salir";
    } else {
      // Si no, se pregunta al usuario
      const opcion = await Menu.elegirOpcion(
        "¿Que quieres hacer a continuación?",
        opciones
      );

      if (opcion === "jugar") {
        return "jugar";
      } else {
        return "salir";
      }
    }
  }

  /**
   * Lee las instrucciones desde un archivo en la carpeta `src/instructions`.
   *
   * @protected
   * @param {string} archivo - Nombre del archivo a leer (incluyendo extensión).
   * @returns {string} Contenido del archivo como string o un mensaje de error
   * en caso de que el archivo no exista, esté vacío, o haya un problema al leerlo.
   *
   * @example
   *
   * this.instrucciones = this.leerInstrucciones("dados.txt");
   *
   *
   */
  protected leerInstrucciones(archivo: string) {
    const carpeta = "src/instructions";
    const ruta = `${carpeta}/${archivo}`;

    if (!fs.existsSync(ruta)) {
      return `El archivo ${ruta} no existe.`;
    }

    try {
      const instrucciones = fs.readFileSync(ruta, "utf-8");

      if (!instrucciones.trim()) {
        return `El archivo ${ruta} esta vacio.`;
      }

      return instrucciones;
    } catch (error) {
      if (error instanceof Error) {
        return `Error al leer el archivo ${ruta}: ${error.message}`;
      }

      return `Error al leer el archivo ${ruta}`;
    }
  }
}
