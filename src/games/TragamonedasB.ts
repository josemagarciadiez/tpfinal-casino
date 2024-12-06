import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";
import { Menu } from "../utils/Menu";
import * as fs from "node:fs";

export class DeluxeCachinEasyWin extends Juego {
  private apuestaMinima: number;
  private apuestaMaxima: number;
  private simbolos: string[];
  private jugada: string[];
  private valoresSimbolos: Record<string, number> = {
    "🤴": 8,
    "🧙": 10,
    "🦄": 4,
    "👑": 9,
  };
  private ganancia: number;
  private montoApostado: number;
  private saldoInicial: number;
  public constructor() {
    super();
    this.apuestaMinima = 50;
    this.apuestaMaxima = 750;
    this.simbolos = ["🦄", "🧙", "🤴", "👑"];
    this.jugada = [];
    this.ganancia = 0; // inicializa en 0 porque aun no hay ganancia
    this.montoApostado = 50;
    this.saldoInicial = 0;
  }
  private readonly tiros: number = 5;

  // Métodos
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    let resultado: "victoria" | "derrota" = "derrota";
    if (this.ganancia > 0) {
      resultado = "victoria";
    } else {
      resultado = "derrota";
    }

    // Opciones del jugador dentro del juego
    this.saldoInicial = jugador.obtenerSaldo();
    this.interfaceCachin(jugador);

    this.montoApostado = await this.pedirMonto(jugador);
    if (this.montoApostado === 0) {
      const confirmacion = await Menu.pedirConfirmacion(
        "Estás seguro que deseas salir?"
      );
      if (confirmacion) {
        return {
          apuestaTotal: 0,
          resultado: "derrota",
        };
      }
    }

    let opcion = "";
    let opciones = [
      {
        valor: "tirada",
        nombre: "🎰 Tirar",
      },
      {
        valor: "apuesta",
        nombre: "🎰 Cambiar apuesta",
      },
      {
        valor: "salir",
        nombre: "🔙 Salir",
      },
      {
        valor: "instrucciones",
        nombre: "📜 Instrucciones",
      },
    ];

    while (opcion !== "salir") {
      opcion = await Menu.elegirOpcion("¿Que deseas hacer?", opciones);
      if (opcion === "tirada") {
        if (jugador.obtenerSaldo() < this.montoApostado) {
          console.log("Tu saldo en insuficiente");
          await this.esperar(3);
        }
        jugador.restarSaldo(this.montoApostado);
        await this.interfaceCachin(jugador);
        console.log(await this.tirada());
        console.log(this.calcularGanancia(this.jugada, jugador));
        this.ganancia =
          this.ganancia + this.calcularGanancia(this.jugada, jugador);
      }

      // Abandona, pierde todo
      if (opcion === "salir") {
        if (this.saldoInicial > jugador.obtenerSaldo()) {
          await this.mostrarResultadosCachin("derrota", jugador);
          await this.esperar(3);
          break;
        } else {
          await this.mostrarResultadosCachin("victoria", jugador);
          await this.esperar(3);
          break;
        }
      }
      if (opcion === "apuesta") {
        this.montoApostado += await this.pedirMonto(jugador);
        if (this.montoApostado === 0) {
          continue;
        }
        await this.interfaceCachin(jugador);
      }
      if (jugador.obtenerSaldo() < 100) {
        await this.mostrarResultadosCachin("derrota", jugador);
      }

      if (opcion === "instrucciones") {
        console.log(
          this.leerInstrucciones("Reglas_Deluxe_Cachin_Easy_Win.txt")
        );
        let confirmarJuego = await Menu.pedirConfirmacion("¿Deseas jugar?");
        if (confirmarJuego) {
          continue;
        }
      }
      if (jugador.obtenerSaldo() <= this.apuestaMinima) {
        console.log("No tienes suficiente saldo para seguir jugando");
        break;
      }
    }
    return {
      apuestaTotal: this.montoApostado,
      resultado: resultado,
      ganancia: this.ganancia, // Si no hay ganancia, ganancia será 0
    };
  }

  public simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i];
  }

  public contarParecidos(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};

    // Cuenta todas los parecidos de cada símbolo en el array
    for (const simbolo of tirada) {
      contador[simbolo] = (contador[simbolo] || 0) + 1;
    }

    return contador;
  }

  public contarSimilitudes(tirada: string[]): boolean {
    const contador = this.contarParecidos(tirada);

    // Verifica si algún símbolo aparece más de una vez
    for (const simbolo in contador) {
      if (contador[simbolo] > 1) {
        return true; // Hay similitudes en el array
      }
    }

    return false; // No hay similitudes
  }

  public calcularGanancia(tirada: any, jugador: Jugador): number {
    let contador = this.contarParecidos(tirada);
    let gananciaTotal = 0;
    for (const simbolo in contador) {
      if (contador[simbolo] >= 2) {
        // Verifica que se repita al menos dos veces
        const valorSimbolo = this.valoresSimbolos[simbolo];
        gananciaTotal +=
          (this.montoApostado + valorSimbolo) * contador[simbolo];
        jugador?.sumarSaldo(gananciaTotal);
      }
    }
    if (gananciaTotal > 0) {
      console.log("\n😃 Ganaste: ");
    } else if (gananciaTotal === 0) {
      console.log("\n😔 No hubo suerte esta vez:");
    }
    return gananciaTotal;
  }

  private async tirada() {
    this.jugada = [];
    for (let i: number = 0; i < this.simbolos.length; i++) {
      let cargarSimbolos = this.simboloRandom();
      this.jugada.push(cargarSimbolos);
    }
    return this.jugada;
  }

  private async esperar(segundos: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, segundos * 1000));
  }

  private async pedirMonto(jugador: Jugador) {
    const montoApostado = await Menu.pedirNumero(
      "Ingrese su apuesta [0: Para salir]",
      (apuesta) => {
        // Primero valida que sea un numero
        if (typeof apuesta === "number") {
          // Si es numero
          // chequea que lo ingresado no sea menor q la apuesta minima
          // y distinto de 0
          if (apuesta < 0) {
            return "Debes ingresar un número válido";
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
    return montoApostado;
  }

  private async interfaceCachin(jugador: Jugador) {
    console.clear();
    console.log("========================================================");
    console.log("             🎰 Deluxe Cachin Easy Win 🎰              ");
    console.log("========================================================");
    console.log(
      ` Bienvenido, ${jugador.obtenerNombre()}     🤑 Saldo: ${jugador.obtenerSaldo()}             `
    );
    console.log("--------------------------------------------------------");
  }

  private async mostrarResultadosCachin(
    resultado: "victoria" | "derrota",
    jugador: Jugador
  ) {
    console.clear();
    if (resultado === "victoria") {
      console.log("========================================================");
      console.log("              🎰 Deluxe Cachin Easy Win 🎰               ");
      console.log("              🥳 Felicidades, ganaste!! 🥳               ");
      console.log("========================================================");
      console.log("              Ganancia total: ", jugador.obtenerSaldo());
      console.log("========================================================");
    } else {
      console.log("========================================================");
      console.log("                🎰 Deluxe Cachin Easy Win 🎰             ");
      console.log("                     💔 Perdiste 💔                      ");
      console.log("========================================================");
      console.log("                 ¡La proxima lo conseguis!              ");
      console.log("========================================================");
    }
  }
}
