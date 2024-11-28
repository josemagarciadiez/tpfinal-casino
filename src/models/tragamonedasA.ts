import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { IJuego } from "./IJuego";
import { Menu } from "../utils/Menu";
import { publicDecrypt } from "crypto";
import { AnyTxtRecord } from "dns";
//fuente de los simbolos: https://emojipedia.org
export class Tragamonedas extends Juego {
  private apuestaMinima: number;
  private apuestaMaxima: number;
  private simbolos: string[];
  private jugada: string[];
  private valores: Record<string, number> = {
    "🐈": 20,
    "🐕": 30,
    "🐀": 25,
    "❤️": 35,
    "💀": 50,
    "🌹": 100,
    "🤡": 1,
  };
  private apuesta: number;
  public constructor() {
    super();
    this.apuestaMinima = 5;
    this.apuestaMaxima = 5000;
    this.simbolos = ["🐈", "🐕", "🐀", "🤡", "❤️", "💀", "🌹"];
    this.jugada = [];
    this.apuesta = 5;
  }

  //getters----
  getApuestaMinima(): number {
    return this.apuestaMinima;
  }
  getApuestaMaxima(): number {
    return this.apuestaMaxima;
  }
  getApuesta(): number {
    return this.apuesta;
  }
  //setters----
  setApuesta(apuesta: number): number {
    return (this.apuesta = apuesta);
  }
  //methods----

  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    const apuesta = await Menu.pedirNumero("Ingrese su apuesta: ");
    if (apuesta < this.apuestaMinima) {
      console.error(
        `El monto ingresado es inferior al minimo (${this.apuestaMinima})`
      );
    } else if (apuesta > this.apuestaMaxima) {
      console.error(
        `El monto ingresado es superior al maximo (${this.apuestaMaxima})`
      );
    } else {
      console.log("Monto ingresado exitosamente");
    }
    const tirada = this.tirada()!;
    const ganancia = this.calcularGanancia(tirada);

    let resultado: "victoria" | "derrota" = "derrota";
    if (ganancia > 0) {
      resultado = "victoria";
    }

    return {
      apuestaTotal: apuesta,
      resultado: resultado,
      ganancia: ganancia, // Si no hay ganancia, ganancia será undefined
    };
  }

  public simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i - 1];
  }
  public tirada() {
    let i: number;
    for (i = 0; i < this.simbolos.length; i++) {
      let newSymbol = this.simboloRandom();
      this.jugada.push(newSymbol);
      return this.jugada;
    }
  }

  //Funcion auxiliar para contar las similitudes de cada simbolo
  public contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};
    tirada.forEach((simbolo) => {
      //Si el simbolo es 🤡, cuenta como comodin
      if (simbolo === "🤡") {
        contador["🐈"] = (contador["🐈"] || 0) + 1; // || 0 verifica si simbolo existe en contador
        contador["🐕"] = (contador["🐕"] || 0) + 1; // 0 return 0, luego contador[] se establece en 1
        contador["🐀"] = (contador["🐀"] || 0) + 1;
        contador["❤️"] = (contador["❤️"] || 0) + 1;
        contador["💀"] = (contador["💀"] || 0) + 1;
        contador["🌹"] = (contador["🌹"] || 0) + 1;
      } else {
        contador[simbolo] = (contador[simbolo] || 0) + 1;
      }
    });
    return contador;
  }

  public contarSimilitudes(tirada: string[]): boolean {
    const contador = this.contarOcurrencias(tirada);
    for (const simbolo in contador) {
      if (contador[simbolo] >= 2) {
        //controla si hay algun simbolo que se repita
        return true; //Hay dos o  mas simbolos iguales
      }
    }
    return false;
  }

  public calcularGanancia(tirada: string[]): number {
    const contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;

    for (const simbolo in contador) {
      if (contador[simbolo] >= 2) {
        //verifica que se repita al menos dos veces
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal += valorSimbolo * contador[simbolo]; //habria que agregar para que multiplique tambien por el valor de la apuesta
      }
    }

    return gananciaTotal;
  }

  public analizarTirada() {
    //se almacena lo que retorno la funcion tirada()
    const tirada = this.tirada();
    if (tirada !== undefined) {
      //se asegura de que tirada no sea undefined
      this.jugada = tirada; //asigna tirada a this.jugada
      return this.contarSimilitudes(this.jugada); //analiza si el usuario ganó, tomando como parametro jugada
    } else {
      return console.error(0); //Si tirada = undefined retorna error
    }
    const ganancia = this.calcularGanancia(this.jugada);
    return ganancia;
  }
}
