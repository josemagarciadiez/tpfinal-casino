import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";
import { Menu } from "../utils/Menu";

export class DeluxeCrazyDK extends Juego {
  private apuestaMinima: number;
  private apuestaMaxima: number;
  private simbolos: string[];
  private jugada: string[];
  private valores: Record<string, number> = {
    "🐈": 80,
    "🌹": 250,
    "🐕": 40,
    "🎄": 30,
    "🍀": 50,
    "🐞": 90,
  };
  private ganancia: number;
  private apuesta: number;
  private saldoInicial: number;
  public constructor() {
    super();
    this.apuestaMinima = 100;
    this.apuestaMaxima = 1500;
    this.simbolos = ["🐈", "🐕", "🌹", "🎄", "🍀", "🐞"];
    this.jugada = [];
    this.apuesta = 100; // Inicializa en 100 para evitar conflictos con apuestaMinima
    this.ganancia = 0; // inicializa en 0 porque aun no hay ganancia
    this.instrucciones = this.leerInstrucciones("tragamonedasA.txt");
    this.saldoInicial = 0; //inicializa en 0 para sobreescribirse cuando reciba saldo de jugador
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
    this.saldoInicial = jugador.obtenerSaldo();

    // Opciones del jugador dentro del juego
    this.interfaceTragamonedas(jugador, this.apuesta);

    this.apuesta = await this.pedirApuesta(jugador);
    if (this.apuesta === 0) {
      return {
        apuestaTotal: 0,
        resultado: "derrota",
      };
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
      opcion = await Menu.elegirOpcion("¿Que deseas hacer?", opciones);
      if (opcion === "tirada") {
        if (jugador.obtenerSaldo() < this.apuesta) {
          console.log("Tu monto es insuficiente para seguir apostando");
          break;
        }
        jugador.restarSaldo(this.apuesta);
        const interactuarTirada = [
          {
            valor: "jugar",
            nombre: "▶️  Seguir jugando",
          },
          {
            valor: "cambiar",
            nombre: "🎰 Cambiar apuesta",
          },
          {
            valor: "salir",
            nombre: "🚪 Salir",
          },
        ];
        for (let iP = 0; iP < this.tiros; iP++) {
          this.ganancia =
            this.ganancia + this.calcularGanancia(this.jugada, jugador);
          console.clear();
          this.interfaceTragamonedas(jugador, this.apuesta);
          this.jugada = [];
          console.log(
            `\n                 Tiros restantes: ${this.tiros - iP}  `
          );
          console.log(
            "========================================================"
          );
          await this.simularTiro();
          console.log("\n", this.calcularGanancia(this.jugada, jugador)); // Calcula la ganancia para el tiro actual
          let interaccion = await Menu.elegirOpcion(
            "¿Deseas continuar con la jugada?",
            interactuarTirada
          );
          if (interaccion === "jugar") {
            continue;
          }
          if (interaccion === "cambiar") {
            let nuevaApuesta = await this.pedirApuesta(jugador);
            await this.interfaceTragamonedas(jugador, nuevaApuesta);
            if (nuevaApuesta > this.apuesta) {
              let descontarSaldo = nuevaApuesta - this.apuesta;
              jugador.restarSaldo(descontarSaldo);
              this.apuesta = nuevaApuesta;
            }
            if (nuevaApuesta <= this.apuesta) {
              this.apuesta = nuevaApuesta;
              continue;
            }
            if (this.apuesta === 0) {
              continue;
            }
            await this.interfaceTragamonedas(jugador, this.apuesta);
          }
          if (interaccion === "salir") {
            const confirmacion = await Menu.pedirConfirmacion(
              "¿Estás seguro? [Preciona cualquier tecla para salir, y n para continuar]"
            );
            if (confirmacion) {
              this.mostrarResultado("derrota", jugador);
              break;
            }
          }
        }
      }

      // Abandona, pierde todo
      if (opcion === "salir") {
        if (jugador.obtenerSaldo() > this.saldoInicial) {
          this.mostrarResultado("victoria", jugador);
        } else {
          this.mostrarResultado("derrota", jugador);
        }
      }
      if (opcion === "apuesta") {
        let nuevaApuesta = await this.pedirApuesta(jugador);
        if (nuevaApuesta > this.apuesta) {
          let descontarSaldo = nuevaApuesta - this.apuesta;
          jugador.restarSaldo(descontarSaldo);
          nuevaApuesta = this.apuesta;
        }
        if (nuevaApuesta <= this.apuesta) {
          this.apuesta = nuevaApuesta;
          continue;
        }
        if (this.apuesta === 0) {
          const opcionesApuestaCero = await Menu.elegirOpcion(
            "¿Que deseas hacer?",
            opciones
          );
        }
        await this.interfaceTragamonedas(jugador, this.apuesta);
      }
      if (jugador.obtenerSaldo() < this.apuestaMinima) {
        this.mostrarResultado("derrota", jugador);
      }
    }
    return {
      apuestaTotal: this.apuesta,
      resultado: resultado,
      ganancia: this.ganancia, // Si no hay ganancia, ganancia será 0
    };
  }

  public simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i];
  }

  public contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};

    // Itera sobre la tirada de izquierda a derecha
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
      if (contador[simbolo] >= 2) {
        return true; // Si encontramos símbolos consecutivos iguales, devolvemos true
      }
    }
    return false;
  }
  public calcularGanancia(tirada: string[], jugador: Jugador): number {
    let contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;
    for (const simbolo in contador) {
      if (contador[simbolo] >= 2) {
        // Verifica que se repita al menos dos veces
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal = (this.apuesta + valorSimbolo) * contador[simbolo];
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
  private async simularTiro() {
    const rieles = [
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
      this.simbolos[0],
    ]; // Inicializamos con el primer simbolo
    let i: number;
    for (i = 0; i < rieles.length; i++) {
      for (let j = 0; j < 5; j++) {
        rieles[i] =
          this.simbolos[Math.floor(Math.random() * this.simbolos.length)];

        process.stdout.write(`\r[ ${rieles.join(" | ")} ] `);

        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      rieles[i] =
        this.simbolos[Math.floor(Math.random() * this.simbolos.length)];
    }
    this.jugada.push(...rieles);
  }
  private async esperar(segundos: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, segundos * 1000));
  }
  private async pedirApuesta(jugador: Jugador) {
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

  private async interfaceTragamonedas(jugador: Jugador, apuestaTotal: number) {
    console.clear();
    console.log("========================================================");
    console.log("                 🎰 Deluxe Crazy DK 🎰                  ");
    console.log("========================================================");
    console.log(
      ` Bienvenido: ${jugador.obtenerNombre()}      🤑 Saldo: ${jugador.obtenerSaldo()}`
    );
    console.log("--------------------------------------------------------");
  }
}
