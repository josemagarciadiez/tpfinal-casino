import { Juego } from "./Juego";
import { Jugador } from "../models/Jugador";
import { Menu } from "../utils/Menu";
import { off } from "process";
import { timeEnd } from "console";

export abstract class Tragamonedas extends Juego {
  protected apuestaMaxima: number;
  protected jugada: string[];
  protected ganancia: number;
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
  };
  public constructor() {
    super();
    //todos los valores inicilizan en 0, despues se cambian en las clases hijas con un setter
    this.apuestaMinima = 0;
    this.apuestaMaxima = 0;
    this.jugada = [];
    this.simbolos = [];
    this.ganancia = 0;
    this.saldoInicial = 0;
    this.apuesta = this.apuestaMinima;
    this.nombreTragamonedas = "";
  }
  //setters----
  //methods----
  abstract ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }>;
  //----
  protected simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i];
  }
  //----
  protected contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};

    for (let i: number = 0; i < tirada.length; i++) {
      contador[tirada[i]] = (contador[tirada[i]] || 0) + 1; //||0 + 1 valida que existe
    }
    return contador;
  }
  //----
  protected calcularGanancia(tirada: string[], jugador: Jugador): number {
    let contador = this.contarOcurrencias(tirada);
    console.log(contador);
    let gananciaTotal = 0;
    for (const [simbolo, cantidadVeces] of Object.entries(contador)) {
      if (cantidadVeces >= 3) {
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal = this.apuesta + valorSimbolo * cantidadVeces;
      }
    }
    jugador.sumarSaldo(gananciaTotal);
    if (gananciaTotal > 0) {
      console.log("\n😃 Ganaste: ");
    } else if (gananciaTotal === 0) {
      console.log("\n😔 No hubo suerte esta vez:");
    }
    return gananciaTotal;
  }
  //----
  protected async tirada() {
    const rieles = [
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
    ]; // Inicializamos con el primer simbolo
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
  //----
  protected async esperar(segundos: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, segundos * 1000));
  }
  //----
  protected async pedirApuesta(jugador: Jugador) {
    const montoApostado = await Menu.pedirNumero(
      "Ingrese su apuesta [0: Para regresar]",
      (apuesta) => {
        // Primero valida que sea un numero
        if (typeof apuesta === "number") {
          // Si es numero
          // chequea que lo ingresado no sea menor q la apuesta minima
          // y distinto de 0
          if (apuesta < 0) {
            return "Debes ingresar un número válido.";
          }
          if (apuesta >= 1 && apuesta < this.apuestaMinima) {
            return `El monto ingresado (${apuesta}) es inferior al minimo requerido (${this.apuestaMinima})`;
          }
          // despues, chequea que no supere la apuesta maxima
          if (apuesta > this.apuestaMaxima) {
            return `El monto ingresado (${apuesta}) es superior al maximo permitido (${this.apuestaMaxima})`;
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
  //----
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
  //----
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
      console.log("                 ¡Mejor suerte la proxima!              ");
      console.log("========================================================");
    }
  }
}
