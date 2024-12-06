import { Jugador } from "../models/Jugador";
import { Tragamonedas } from "../models/Tragamonedas";
import { Menu } from "../utils/Menu";

export class DeluxeCrazyDK extends Tragamonedas {
  public constructor() {
    super();
    this.apuestaMinima = 100;
    this.apuestaMaxima = 1500;
    this.simbolos = ["🐈", "🐕", "🌹", "🎄", "🍀", "🐞"];
    this.jugada = [];
    this.apuesta = this.apuestaMinima; // Inicializa en 100 para evitar conflictos con apuestaMinima
    this.ganancia = 0; // inicializa en 0 porque aun no hay ganancia
    this.instrucciones = this.leerInstrucciones("tragamonedasA.txt");
    this.saldoInicial = 0; //inicializa en 0 para sobreescribirse cuando reciba saldo de jugador
    this.nombreTragamonedas = "Deluxe Crazy DK";
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
    this.interfaceTragamonedas(jugador);

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
        for (let i = 0; i < this.tiros; i++) {
          this.ganancia =
            this.ganancia + this.calcularGanancia(this.jugada, jugador);
          console.clear();
          this.interfaceTragamonedas(jugador);
          this.jugada = [];
          console.log(
            `\n                 Tiros restantes: ${this.tiros - i}  `
          );
          console.log(
            "========================================================"
          );
          await this.tirada();
          console.log("\n", this.calcularGanancia(this.jugada, jugador)); // Calcula la ganancia para el tiro actual
          let interaccion = await Menu.elegirOpcion(
            "¿Deseas continuar con la jugada?",
            interactuarTirada
          );
          if (interaccion === "cambiar") {
            let nuevaApuesta = await this.pedirApuesta(jugador);
            await this.interfaceTragamonedas(jugador);
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
            await this.interfaceTragamonedas(jugador);
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
        await this.interfaceTragamonedas(jugador);
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
}
