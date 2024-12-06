import * as fs from "fs";

import { IJuego } from "./IJuego";
import { Jugador } from "./Jugador";

export abstract class Juego implements IJuego {
  protected nombre!: string;
  protected instrucciones!: string;

  obtenerNombre(): string {
    return this.nombre;
  }

  obtenerInstrucciones(): string {
    return this.instrucciones;
  }

  abstract ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }>;

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

  protected mostrarResultado(
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    limpiar: boolean = true
  ) {
    if (limpiar) {
      console.clear();
    } else {
      console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    }

    if (resultado === "victoria") {
      console.log("🎉 🍾  =======================================  🎉 🍾");
      console.log("         🥇 🏆 ¡FELICIDADES! ¡HAS GANADO! 🥇 🏆");
      console.log("=======================================================");
      console.log(
        `💰                 Saldo acumulado: ${jugador.obtenerSaldo()}`
      );
      console.log("🎲   ¡La suerte estuvo de tu lado!");
      console.log("🍾   Disfruta de tu victoria y sigue jugando.");
      console.log(
        "=======================================================" + "\n"
      );
    } else {
      console.log("💔 ❤️‍🩹  =======================================  💔 ❤️‍🩹");
      console.log("          🥲 😔 LO SENTIMOS, HAS PERDIDO 🥲 😔");
      console.log("=======================================================");
      console.log(`❌    Saldo restante: ${jugador.obtenerSaldo()}`);
      console.log("🎲   ¡No te rindas, la próxima vez será mejor!");
      console.log("🃏   Inténtalo de nuevo y vencerás.");
      console.log(
        "=======================================================" + "\n"
      );
    }
  }
}
