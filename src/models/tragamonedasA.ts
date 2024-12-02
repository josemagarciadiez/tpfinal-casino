import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { IJuego } from "./IJuego";
import { Menu } from "../utils/Menu";
import { exit, exitCode, off, resourceUsage } from "process";
import { fileURLToPath } from "url";
import { resolve } from "path";
import * as fs from "node:fs";
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
  public constructor() {
    super();
    this.apuestaMinima = 100;
    this.apuestaMaxima = 1500;
    this.simbolos = ["🐈", "🐕", "🌹", "🎄", "🍀", "🐞"];
    this.jugada = [];
    this.apuesta = 100; // Inicializa en 100 para evitar conflictos con apuestaMinima
    this.ganancia = 0; // inicializa en 0 porque aun no hay ganancia
    this.instrucciones = "";
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
    this.interfaceTragamonedas(jugador, this.apuesta);

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
      {
        valor: "instrucciones",
        nombre: "📜 Reglamento",
      },
    ];
    while (opcion !== "salir") {
      opcion = await Menu.elegirOpcion("¿Que deseas hacer?", opciones);
      if (opcion === "tirada") {
        const interactuarTirada = [
          {
            valor: "jugar",
            nombre: "▶️ Seguir jugando",
          },
          {
            valor: "cambiar",
            nombre: "🎰 Cambiar apuesta",
          },
          {
            valor: "salir",
            nombre: " 🚪salir",
          },
        ];
        for (let iP = 0; iP < this.tiros; iP++) {
          console.clear();
          this.interfaceTragamonedas(jugador, this.apuesta);
          this.jugada = [];
          console.log(
            `\n                 Tiros restantes: ${this.tiros - iP}   `
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
            await this.interfaceTragamonedas(jugador, this.apuesta);
          }
          if (interaccion === "salir") {
            const confirmacion = await Menu.pedirConfirmacion(
              "¿Estás seguro? Perderas todo el progreso obtenido en este tiro"
            );
            if (confirmacion) {
              return {
                apuestaTotal: this.apuesta,
                resultado: "derrota",
              };
            }
          }
        }
      }

      // Abandona, pierde todo
      if (opcion === "salir") {
        console.log(this.mostrarResultados("derrota", jugador, true));
      }
      if (opcion === "apuesta") {
        this.apuesta += await this.pedirApuesta(jugador);
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
        await this.interfaceTragamonedas(jugador, this.apuesta);
      }
      if (jugador.obtenerSaldo() < 100) {
        console.log(this.mostrarResultados("derrota", jugador, true));
      }
      if (opcion === "instrucciones") {
        console.log(this.leerInstrucciones("tragamonedasA.txt"));
        let confirmarJuego = await Menu.pedirConfirmacion("¿Deseas jugar?");
        if (confirmarJuego) {
          continue;
        }
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
  public calcularGanancia(tirada: any, jugador: Jugador): number {
    let contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;
    for (const simbolo in contador) {
      if (contador[simbolo] >= 2) {
        // Verifica que se repita al menos dos veces
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal = this.apuesta + valorSimbolo * contador[simbolo];
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
      for (let j = 0; j < 10; j++) {
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
      "Ingrese su apuesta [0: Para salir]",
      (apuesta) => {
        // Primero valida que sea un numero
        if (typeof apuesta === "number") {
          // Si es numero
          // chequea que lo ingresado no sea menor q la apuesta minima
          // y distinto de 0
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

          // Cuando todo va bien se resta la apuesta al saldo del jugador
          jugador.restarSaldo(apuesta);
          // y se retorna true.
          return true;
        } else {
          return "Debes ingresar un número válido.";
        }
      }
    );
    return montoApostado;
  }

  protected leerInstrucciones(archivo: string): string {
    const carpeta = "src/instructions";
    const ruta = `${carpeta}/${archivo}`;

    if (!fs.existsSync(ruta)) {
      return `El archivo ${ruta} no existe.`;
    }

    try {
      this.instrucciones = fs.readFileSync(ruta, "utf-8");

      if (!this.instrucciones.trim()) {
        return `El archivo ${ruta} esta vacio.`;
      }

      return this.instrucciones;
    } catch (error) {
      if (error instanceof Error) {
        return `Error al leer el archivo ${ruta}: ${error.message}`;
      }

      return `Error al leer el archivo ${ruta}`;
    }
  }

  private async interfaceTragamonedas(jugador: Jugador, apuestaTotal: number) {
    console.clear();
    console.log("|========================================================|");
    console.log("|                 🎰 Deluxe Crazy DK 🎰                  |");
    console.log("|========================================================|");
    console.log(
      `| 💲Apuesta total: ${apuestaTotal}      🤑 Saldo: ${jugador.obtenerSaldo()}             |`
    );
    console.log("|--------------------------------------------------------|");
  }

  private async mostrarResultados(
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    salir: boolean = false
  ) {
    console.clear();
    if (resultado === "victoria") {
      console.log("========================================================");
      console.log("                  🎰 Deluxe Crazy DK 🎰                  ");
      console.log("              🥳 Felicidades, ganaste!! 🥳               ");
      console.log("========================================================");
      console.log("              Ganancia total: ", jugador.obtenerSaldo());
      console.log("========================================================");
    } else {
      console.log("========================================================");
      console.log("                  🎰 Deluxe Crazy DK 🎰                  ");
      console.log("                     💔 Perdiste 💔                      ");
      console.log("========================================================");
      console.log("                 ¡Mejor suerte la proxima!              ");
      console.log("========================================================");
    }
    const opcionesFinales = [
      {
        valor: "jugar",
        nombre: "▶️ Voler a jugar",
        desactivada: jugador.obtenerSaldo() < this.apuestaMinima,
      },
      {
        valor: "salir",
        nombre: "🔙 Volver",
      },
    ];
    if (salir) {
      for (let i: number = 5; i > 0; i--) {
        if (i === 1) {
          console.log(
            `\r🔄  Seras redirigido al menu principal en ${i} segundo..`
          );
        } else {
          console.log(
            `\r🔄  Seras redirigido al menu principal en ${i} segundos..`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      let opcion = await Menu.elegirOpcion(
        "¿Que quieres hacer?",
        opcionesFinales
      );
      if ((opcion = "jugar")) {
        //falta agregar aca algo que guarde los datos de la partida
        await this.ejecutar(jugador);
      }
    }
  }
}
