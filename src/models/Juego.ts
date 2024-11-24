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
}
