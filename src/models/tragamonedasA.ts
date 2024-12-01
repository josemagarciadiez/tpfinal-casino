import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { IJuego } from "./IJuego";
import { Menu } from "../utils/Menu";
import { exit, off } from "process";

export class DeluxeCrazyDK extends Juego {
  private apuestaMinima: number;
  private apuestaMaxima: number;
  private simbolos: string[];
  private jugada: string[];
  private valores: Record<string, number> = {
    "🐈": 200,
    "🌹": 1000,
    "🐕": 360,
  };
  private apuesta: number;
  private contador: number;
  public constructor() {
    super();
    this.apuestaMinima = 100;
    this.apuestaMaxima = 1500;
    this.simbolos = ["🐈", "🐕", "🌹"];
    this.jugada = [];
    this.apuesta = 5; // Inicializa en 5 para evitar conflictos
    this.contador = 0;
  }

  // Métodos
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // Opciones del jugador dentro del juego
    this.interfaceTragamonedas();
    
    // Validación inicial de la apuesta
    while (true) {
      this.apuesta = await Menu.pedirNumero("Ingrese su apuesta: ");
      if (this.apuesta < this.apuestaMinima) {
        console.error(
          `El monto ingresado (${this.apuesta}) es inferior al minimo requerido (${this.apuestaMinima})`
        );
      } else if (this.apuesta > this.apuestaMaxima) {
        console.error(
          `El monto ingresado (${this.apuesta}) es superior al maximo permitido (${this.apuestaMaxima})`
        );
      } else {
        console.log("Monto ingresado exitosamente");
        this.interfaceTragamonedas();
        break;
      }
    }

    const tirada = this.tirada(this.apuesta)!;
    const ganancia = this.calcularGanancia(tirada);

    let resultado: "victoria" | "derrota" = "derrota";
    if (ganancia > 0) {
      resultado = "victoria";
    }

    let opcion = "";
    let opciones = [
      {
        valor: "tirada",
        nombre: "🎰 Probar suerte",
      },
      {
        valor: "apuesta",
        nombre: "🎰 Cambiar apuesta",
      },
      {
        valor: "salir",
        nombre: "🔙 Volver",
      },
    ];

    while (opcion !== "salir") {
      opcion = await Menu.elegirOpcion(
        "¿Qué quieres hacer a continuación?",
        opciones
      );

      if (opcion === "tirada") {
        this.interfaceTragamonedas(this.apuesta, jugador);
        console.log(this.tirada(this.apuesta));
        jugador.restarSaldo(this.apuesta);
        let tirada = this.tirada(this.apuesta)
        this.calcularGanancia(tirada, jugador);
      }

      if (opcion === "apuesta") {
        this.apuesta = await Menu.pedirNumero("Ingrese el nuevo monto: ");
      }

      if (opcion === "salir") {
        return exit(0);
      }

      if(jugador.obtenerSaldo() < 5){
        console.log("Tu saldo es insuficiente para seguir jugando")
        exit(0);
      }
    }

    return {
      apuestaTotal: this.apuesta,
      resultado: resultado,
      ganancia: ganancia, // Si no hay ganancia, ganancia será undefined
    };
  }

  public simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i];
  }

  public tirada(apuesta?: number, jugador?: Jugador) {
    let i: number;
    this.jugada = [];
    for (i = 0; i < this.simbolos.length; i++) {
      let newSymbol = this.simboloRandom();
      this.jugada.push(newSymbol);
    }
    return this.jugada;
  }

  public contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};

    // Iteramos sobre la tirada de izquierda a derecha
    for (let i = 1; i < tirada.length; i++) {
        if (tirada[i] === tirada[i - 1]) {
            contador[tirada[i]] = (contador[tirada[i]] || 0) + 1;
        }
    }
    return contador;
}

public contarSimilitudes(tirada: string[]): boolean {
    const contador = this.contarOcurrencias(tirada);

    for (const simbolo in contador) {
        if (contador[simbolo] >= 1) { // Al menos 2 símbolos iguales consecutivos
            return true; // Si encontramos símbolos consecutivos iguales, devolvemos true
        }
    }
    return false;
}

  public calcularGanancia(tirada: string[], jugador?: Jugador): number {
    let contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;
    for (const simbolo in contador) {
      if (contador[simbolo] >= 1) {
        // Verifica que se repita al menos dos veces
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal += valorSimbolo * contador[simbolo];
        jugador?.sumarSaldo(gananciaTotal);
      }
    }
    return gananciaTotal;
  }

  private async interfaceTragamonedas(
    apuestaTotal?: number,
    jugador?: Jugador
  ) {
    console.clear();
    console.log("========================================================");
    console.log("                  🎰Deluxe Crazy DK🎰                  ");
    console.log("========================================================");
    console.log(` 💲Apuesta total: ${apuestaTotal}    🤑Saldo: ${jugador?.obtenerSaldo()}`);
    console.log("--------------------------------------------------------");
  }
}
