import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";
import { Tragamonedas } from "../models/Tragamonedas";
import { Menu } from "../utils/Menu";
import * as fs from "node:fs";

export class DeluxeCachinEasyWin extends Tragamonedas {
  protected valores: Record<string, number> = {
    "🤴": 80,
    "🧙": 100,
    "🦄": 40,
    "👑": 90,
    "🐈": 80,
    "🌹": 250,
    "🐕": 40,
    "🎄": 30,
    "🍀": 50,
    "🐞": 90,
  };
  public constructor() {
    super();
    this.apuestaMinima = 50;
    this.apuestaMaxima = 750;
    this.simbolos = ["🦄", "🧙", "🤴", "👑", "🦄", "🧙"]; //Espacio de 6, pero con dos repetidos para hacer honor al "easy win".
    this.jugada = [];
    this.ganancia = 0; // inicializa en 0 porque aun no hay ganancia
    this.apuesta = this.apuestaMinima;
    this.saldoInicial = 0;
    this.nombreTragamonedas = "Deluxe Cachin Easy Win";
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
    this.interfaceTragamonedas(jugador);

    this.apuesta = await this.pedirApuesta(jugador);
    if (this.apuesta === 0) {
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
        if (jugador.obtenerSaldo() < this.apuesta) {
          console.log("Tu saldo en insuficiente");
          await this.esperar(3);
        }
        jugador.restarSaldo(this.apuesta);
        await this.interfaceTragamonedas(jugador);
        await this.tirada();
        console.log(this.calcularGanancia(this.jugada, jugador));
        this.ganancia =
          this.ganancia + this.calcularGanancia(this.jugada, jugador);
      }

      // Abandona, pierde todo
      if (opcion === "salir") {
        if (this.saldoInicial > jugador.obtenerSaldo()) {
          this.mostrarResultados("derrota", jugador);
          await this.esperar(3);
          break;
        } else {
          this.mostrarResultados("victoria", jugador);
          await this.esperar(3);
          break;
        }
      }
      if (opcion === "apuesta") {
        this.apuesta = await this.pedirApuesta(jugador);
        if (this.apuesta === 0) {
          continue;
        }
        await this.interfaceTragamonedas(jugador);
      }
      if (jugador.obtenerSaldo() < 100) {
        this.mostrarResultados("derrota", jugador);
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
      apuestaTotal: this.apuesta,
      resultado: resultado,
      ganancia: this.ganancia, // Si no hay ganancia, ganancia será 0
    };
  }
}
