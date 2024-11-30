import * as fs from "fs";

import { IJuego } from "./IJuego";
import { Jugador } from "./Jugador";

export abstract class Juego implements IJuego {
  protected instrucciones!: string;

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
}
