import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { IJuego } from "./IJuego";
import { Menu } from "../utils/Menu";
import { exit, off } from "process";
import { fileURLToPath } from "url";
import { resolve } from "path";

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
    this.interfaceTragamonedas(jugador, this.apuesta, this.tiros);

    this.apuesta = await Menu.pedirNumero("Ingrese su apuesta", (apuesta) => {
      if (typeof apuesta === "number") {
        if (apuesta < this.apuestaMinima) {
          return `El monto ingresado (${apuesta}) es inferior al minimo requerido (${this.apuestaMinima})`;
        }
        if (apuesta > this.apuestaMaxima) {
          return `El monto ingresado (${apuesta}) es superior al maximo permitido (${this.apuestaMaxima})`;
        }
        if (apuesta >= jugador.obtenerSaldo()) {
          console.log(
            `Tu monto actual (${jugador.obtenerSaldo()}), es menor que el de la apuesta ingresada (${apuesta})`
          );
        }
        return true;
      } else {
        return "Debes ingresar un número válido.";
      }
    });

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
      let opcionesDeMenu = await Menu.elegirOpcion(
        "¿Que deseas hacer?",
        opciones
      );
      if (opcion === "tirada") {
        jugador.restarSaldo(this.apuesta);
        this.interfaceTragamonedas(jugador, this.apuesta, this.tiros);
        for (let i = 0; i === this.tiros; i++) {
          const tirosRestantes = this.tiros - (i + i);
        }
        const tiro = await this.simularTiro();
        console.log(
          (this.ganancia = this.calcularGanancia(this.tirada(), jugador))
        );
      }

      // Abandona, pierde todo
      if (opcion === "salir") {
        return {
          apuestaTotal: this.apuesta,
          resultado: "derrota",
        };
      }

      if (opcion === "apostar") {
        this.apuesta += await this.pedirApuesta(jugador);
      }

      if (jugador.obtenerSaldo() < 100) {
        console.log("Tu saldo es insuficiente para seguir jugando");
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

  public tirada() {
    let i: number;
    this.jugada = [];
    for (i = 0; i < this.simbolos.length; i++) {
      let newSymbol = this.simboloRandom();
      this.jugada.push(newSymbol);
    }
    // JOSE: Si laburas sobre una propiedad de la clase,
    // para que un return? si el valor nuevo ya esta guardado
    // en esa propiedad.
    //porque si no retorno algo lo toma como VOID
    console.log(this.jugada);
    return this.jugada;
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
      if (contador[simbolo] >= 1) {
        // Al menos 2 símbolos iguales consecutivos
        return true; // Si encontramos símbolos consecutivos iguales, devolvemos true
      }
    }
    return false;
  }
  public calcularGanancia(tirada: string[], jugador: Jugador): number {
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
    if (gananciaTotal > 0) {
      console.log("😃 Ganaste: ");
    } else if (gananciaTotal === 0) {
      console.log("😔 No hubo esta vez:");
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

    // Recorremos cada posicion de los rieles
    for (let i = 0; i < rieles.length; i++) {
      // Cada riel cambia 10 veces antes de caer en el valor aleatorio
      for (let j = 0; j < 10; j++) {
        // Cambia solo el riel actual, mostrando un simbolo aleatorio
        rieles[i] =
          this.simbolos[Math.floor(Math.random() * this.simbolos.length)];

        // Muestra los rieles actuales
        process.stdout.write(`\r[ ${rieles.join(" | ")} ] `);

        // Espera 150 ms entre cada actualización
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      rieles[i] =
        this.simbolos[Math.floor(Math.random() * this.simbolos.length)];
      this.jugada.push(rieles[i]);
      console.log(this.jugada);
      return this.jugada;
    }
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

  private async interfaceTragamonedas(
    jugador: Jugador,
    apuestaTotal: number,
    tiros: number
  ) {
    apuestaTotal = this.apuesta;
    console.clear();
    console.log("========================================================");
    console.log("                  🎰 Deluxe Crazy DK 🎰                  ");
    console.log("========================================================");
    console.log(
      ` 💲Apuesta total: ${apuestaTotal}    🤑 Saldo: ${jugador.obtenerSaldo()}`
    );
    console.log("--------------------------------------------------------");
    console.log(`                Tiros restantes: ${tiros}               `);
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
