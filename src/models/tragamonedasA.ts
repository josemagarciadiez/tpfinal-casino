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
    "🐈": 80,
    "🌹": 250,
    "🐕": 120,
  };
  private ganancia: number;
  private apuesta: number;
  public constructor() {
    super();
    this.apuestaMinima = 100;
    this.apuestaMaxima = 1500;
    this.simbolos = ["🐈", "🐕", "🌹"];
    this.jugada = [];
    this.apuesta = 100; // Inicializa en 100 para evitar conflictos con apuestaMinima
    this.ganancia = 0; // inicializa en 0 porque aun no hay ganancia
  }

  // Métodos
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // Opciones del jugador dentro del juego
    this.interfaceTragamonedas(jugador);

    this.apuesta = await Menu.pedirNumero("Ingrese su apuesta", (apuesta) => {
      // Primero valida que sea un numero
      if (typeof apuesta === "number") {
        // Si es numero
        // chequea que lo ingresado no sea menor q la apuesta minima
        if (apuesta < this.apuestaMinima) {
          return `El monto ingresado (${apuesta}) es inferior al minimo requerido (${this.apuestaMinima})`;
        }

        // despues, chequea que no supere la apuesta maxima
        if (apuesta > this.apuestaMaxima) {
          return `El monto ingresado (${apuesta}) es superior al maximo permitido (${this.apuestaMaxima})`;
        }

        // Yo aca agregue que chequee que lo q quiere apostar el usuario sea menor o igual q su saldo
        // pq aca yo puedo apostar mas de lo que tengo. OJO

        // Cuando todo va bien, se retorna true, y se guarda en this.apuesta lo
        // ingreso el usuario.
        return true;
      } else {
        return "Debes ingresar un número válido.";
      }
    });
    // this.apuesta = await Menu.pedirNumero("Ingrese su apuesta");
    // // Todo eso iria en la funcion validadora
    // if (this.apuesta < this.apuestaMinima) {
    //   console.error(
    //     `El monto ingresado (${this.apuesta}) es inferior al minimo requerido (${this.apuestaMinima})`
    //   );
    //   this.apuesta = await Menu.pedirNumero("Ingrese su apuesta: ");
    // } else if (this.apuesta > this.apuestaMaxima) {
    //   console.error(
    //     `El monto ingresado (${this.apuesta}) es superior al maximo permitido (${this.apuestaMaxima})`
    //   );
    //   this.apuesta = await Menu.pedirNumero("Ingrese su apuesta: ");
    // } else {
    //   console.log("Monto ingresado exitosamente");
    //   this.interfaceTragamonedas(jugador);
    // }

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

    // JOSE: Esto me parece que lo vamos a tener que borrar
    // porque la clase casino, cada vez que se termine una partida
    // tiene que guardarla en la base de datos. (Pero lo vemos despues)
    //Anotado!!
    while (opcion !== "salir") {
      opcion = await Menu.elegirOpcion(
        "¿Qué quieres hacer a continuación?",
        opciones
      );

      if (opcion === "tirada") {
        this.interfaceTragamonedas(jugador, this.apuesta);
        jugador.restarSaldo(this.apuesta);
        console.log(
          (this.ganancia = this.calcularGanancia(this.tirada(), jugador))
        );
      }

      if (opcion === "apuesta") {
        this.apuesta = await Menu.pedirNumero("Ingrese el nuevo monto: ");
      }

      if (opcion === "salir") {
        return exit(0);
      }

      if (jugador.obtenerSaldo() < 5) {
        console.log("Tu saldo es insuficiente para seguir jugando");
        exit(0);
      }
    }

    let resultado: "victoria" | "derrota" = "derrota";
    if (this.ganancia > 0) {
      resultado = "victoria";
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
    //porque si no retornon algo lo toma como VOID
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

  // JOSE: Chequea que los parametros lleguen antes de ponerlos en pantalla
  // Cuando los valores sean undefinded pinta otro simbolo en la pantalla
  private async interfaceTragamonedas(jugador: Jugador, apuestaTotal?: number) {
    apuestaTotal = this.apuesta;
    console.clear();
    console.log("========================================================");
    console.log("                  🎰 Deluxe Crazy DK 🎰                  ");
    console.log("========================================================");
    console.log(
      ` 💲Apuesta total: ${apuestaTotal}    🤑 Saldo: ${jugador.obtenerSaldo()}`
    );
    console.log("--------------------------------------------------------");
  }
}
