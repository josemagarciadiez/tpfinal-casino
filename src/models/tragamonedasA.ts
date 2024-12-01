import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { IJuego } from "./IJuego";
import { Menu } from "../utils/Menu";
import { publicDecrypt } from "crypto";
import { AnyTxtRecord } from "dns";
import { Serializer } from "v8";
import { Casino } from "./Casino";
import { exit } from "process";
//fuente de los simbolos: https://emojipedia.org
export class DeluxeCrazyDK extends Juego {
  private apuestaMinima: number;
  private apuestaMaxima: number;
  private simbolos: string[];
  private jugada: string[];
  private valores: Record<string, number> = {
    "🐈": 200,
    "🌹": 1000,
    "🤡": 1,
  };
  private apuesta: number;
  public constructor() {
    super();
    this.apuestaMinima = 5;
    this.apuestaMaxima = 5000;
    this.simbolos = ["🐈","🤡","🌹"];
    this.jugada = [];
    this.apuesta = 5; //Iniciliza en 5 para evitar conflictos
  }
  //methods----
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    //opciones del jugador dentro del juego
    this.interfaceTragamonedas();
    while(true){
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

    while (opcion != "salir" && jugador.obtenerSaldo() > 0) {
      opcion = await Menu.elegirOpcion(
        "¿Que quieres hacer a continuacion?",
        opciones
      );
      if (opcion === "tirada") {
        this.interfaceTragamonedas(this.apuesta, jugador);
        console.log(this.tirada(this.apuesta));
        jugador.restarSaldo(this.apuesta);
        this.calcularGanancia(tirada, jugador);
      }
      if (opcion === "apuesta") {
        this.apuesta = await Menu.pedirNumero("Ingrese el nuevo monto: ");
      }
      if (opcion === "salir") {
        return exit(0);
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

  //Funcion auxiliar para contar las similitudes de cada simbolo
  public contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};
    tirada.forEach((simbolo) => {
      //Si el simbolo es 🤡, cuenta como comodin
      if (simbolo === "🤡") {
        contador["🐈"] = (contador["🐈"] || 0) + 1; // || 0 verifica si simbolo existe en contador
        contador["🌹"] = (contador["🌹"] || 0) + 1;// 0 return 0, luego contador[] se establece en 1
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

  public calcularGanancia(
    tirada: string[],
    jugador?: Jugador
  ): number {
    const contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;
    for (const simbolo in contador) {
      if (contador[simbolo] >= 2) {
        //verifica que se repita al menos dos veces
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal +=valorSimbolo * contador[simbolo];
        jugador?.sumarSaldo(gananciaTotal);
      }
    }

    return gananciaTotal;
  }

  public analizarTirada(apuesta: any) {
    //se almacena lo que retorno la funcion tirada()
    const tirada = this.tirada();
    if (tirada !== undefined) {
      //se asegura de que tirada no sea undefined
      this.jugada = tirada; //asigna tirada a this.jugada
      this.calcularGanancia(tirada!, apuesta);
      return this.contarSimilitudes(this.jugada); //analiza si el usuario ganó, tomando como parametro jugada
    } else {
      return console.error(0); //Si tirada = undefined retorna error
    }
  }

  private async interfaceTragamonedas(
    apuestaTotal?: number,
    jugador?: Jugador
  ) {
    apuestaTotal = apuestaTotal;
    console.clear();
    console.log("========================================================");
    console.log("                  🎰Deluxe Crazy DK🎰                  ");
    console.log("========================================================");
    console.log(` 💲Apuesta total: ${apuestaTotal}    🤑Saldo: ${jugador?.obtenerSaldo()}`);
    console.log("--------------------------------------------------------");  
  }
}
