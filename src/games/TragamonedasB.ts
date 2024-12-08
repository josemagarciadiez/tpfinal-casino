import { Jugador } from "../models/Jugador";
import { Tragamonedas } from "../models/Tragamonedas";
import { Menu } from "../utils/Menu";

export class DeluxeCachinEasyWin extends Tragamonedas {
  public constructor() {
    super();
    this.apuestaMinima = 25;
    this.apuestaMaxima = 100;
    this.simbolos = [
      "🦄",
      "🧙",
      "🤴",
      "👑",
      "🐈",
      "🐕",
      "🌹",
      "🎄",
      "🍀",
      "🐞",
    ];
    this.jugada = [];
    this.apuesta = this.apuestaMinima;
    this.saldoInicial = 0; //inicializa en 0 para sobreescribirse despues
    this.nombreTragamonedas = "Deluxe Cachin Easy Win";
    this.instrucciones = this.leerInstrucciones("tragamonedasB.txt");
  }
  // Métodos
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    let resultado: "victoria" | "derrota" = "derrota";
    if (this.saldoInicial > 0) {
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
        //console.log(this.ganancia);
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
      if (jugador.obtenerSaldo() < this.apuestaMinima) {
        this.mostrarResultados("derrota", jugador);
      }

      if (jugador.obtenerSaldo() <= this.apuestaMinima) {
        console.log("No tienes suficiente saldo para seguir jugando");
        break;
      }
    }
    return {
      apuestaTotal: this.apuesta,
      resultado: resultado,
      ganancia: this.saldoInicial, // Si no hay ganancia, ganancia será 0
    };
  }
}
