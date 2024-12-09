import { Juego } from "./Juego";
import { Jugador } from "../models/Jugador";
import { Menu } from "../utils/Menu";
import { off } from "process";
import { timeEnd } from "console";

export abstract class Tragamonedas extends Juego {
  protected apuestaMinima: number;
  protected apuestaMaxima: number;
  protected jugada: string[];
  protected saldoInicial: number;
  protected apuesta: number;
  protected nombreTragamonedas: string;
  protected simbolos: string[];
  protected valores: Record<string, number> = {
    "🤴": 8,
    "🧙": 10,
    "🦄": 4,
    "👑": 9,
    "🐈": 80,
    "🌹": 250,
    "🐕": 40,
    "🎄": 30,
    "🍀": 50,
    "🐞": 90,
    "🌟": 0, // Comodín
  };

  public constructor() {
    super();
    // Todos los valores inicializan en 0, después se cambian en las clases hijas con un setter
    this.apuestaMinima = 0;
    this.apuestaMaxima = 0;
    this.jugada = [];
    this.simbolos = [];
    this.saldoInicial = 0;
    this.apuesta = this.apuestaMinima;
    this.nombreTragamonedas = "";
  }

  // Métodos abstractos
  abstract ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }>;

  // Métodos comunes
  protected simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i];
  }

  protected contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};

    for (let simbolo of tirada) {
      contador[simbolo] = (contador[simbolo] || 0) + 1;
    }

    return contador;
  }

  protected calcularGanancia(tirada: string[], jugador: Jugador): number {
    let contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;
    let tieneComodin = contador["🌟"] || 0;

    for (const [simbolo, cantidadVeces] of Object.entries(contador)) {
      if (simbolo === "🌟") continue; // El comodín se maneja aparte

      let cantidadFinal = cantidadVeces;

      if (tieneComodin > 0) {
        cantidadFinal += Math.min(tieneComodin, 3); // Máximo 3 comodines cuentan
      }

      if (cantidadFinal >= 3) {
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal += this.apuesta + valorSimbolo * cantidadFinal;
      }
    }
    jugador.sumarSaldo(gananciaTotal);

    if (gananciaTotal > 0) {
      console.log("\n😃 Ganaste: ", gananciaTotal);
    } else {
      console.log("\n😔 No hubo suerte esta vez.");
    }

    return gananciaTotal;
  }

  protected async tirada() {
    const rieles = Array(6).fill(this.simbolos[0]); // Inicializamos con el primer símbolo

    for (let i = 0; i < rieles.length; i++) {
      for (let j = 0; j < 4; j++) {
        rieles[i] =
          this.simbolos[Math.floor(Math.random() * this.simbolos.length)];
        process.stdout.write(`\r[ ${rieles.join(" | ")} ] `);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }

    this.jugada = rieles;
  }

  protected async esperar(segundos: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, segundos * 1000));
  }

  protected async pedirApuesta(jugador: Jugador) {
    const montoApostado = await Menu.pedirNumero(
      "Ingrese su apuesta [0: Para regresar]",
      (apuesta) => {
        if (typeof apuesta === "number") {
          if (apuesta < 0) {
            return "Debes ingresar un número válido.";
          }
          if (apuesta >= 1 && apuesta < this.apuestaMinima) {
            return `El monto ingresado (${apuesta}) es inferior al mínimo requerido (${this.apuestaMinima})`;
          }
          if (apuesta > this.apuestaMaxima) {
            return `El monto ingresado (${apuesta}) es superior al máximo permitido (${this.apuestaMaxima})`;
          }
          if (apuesta > jugador.obtenerSaldo()) {
            return "Saldo insuficiente.";
          }
          return true;
        } else {
          return "Debes ingresar un número válido.";
        }
      }
    );

    if (montoApostado === 0) {
      return this.apuesta;
    }

    return montoApostado;
  }

  protected async interfaceTragamonedas(jugador: Jugador) {
    console.clear();
    console.log("========================================================");
    console.log(
      `                 🎰 ${this.nombreTragamonedas} 🎰                  `
    );
    console.log("========================================================");
    console.log(
      ` Bienvenido: ${jugador.obtenerNombre()}      🤑 Saldo: ${jugador.obtenerSaldo()}`
    );
    console.log("--------------------------------------------------------");
  }

  protected async mostrarResultados(
    resultado: "victoria" | "derrota",
    jugador: Jugador
  ) {
    console.clear();
    if (resultado === "victoria") {
      console.log("========================================================");
      console.log(
        `               🎰 ${this.nombreTragamonedas} 🎰                  `
      );
      console.log("              🥳 Felicidades, ganaste!! 🥳               ");
      console.log("========================================================");
      console.log("              Ganancia total: ", jugador.obtenerSaldo());
      console.log("========================================================");
    } else {
      console.log("========================================================");
      console.log(
        `               🎰 ${this.nombreTragamonedas} 🎰                  `
      );
      console.log("                     💔 Perdiste 💔                      ");
      console.log("========================================================");
      console.log("                 ¡Mejor suerte la próxima!              ");
      console.log("========================================================");
    }
  }
}
