
import { promises } from "dns";
import { Juego } from "./Juego";
import { Jugador } from "./Jugador";

import { Menu } from "../utils/Menu";


class Ruleta extends Juego {
    protected tablero:{[key: number]: string;}
    protected apuestaMinima:number
    protected instrucciones: string;

    constructor(){
        super()
        this.apuestaMinima=500
        this.instrucciones=""
    
        this.tablero = {
            1: "rojo",
            2: "negro",
            3: "rojo",
            4: "negro",
            5: "rojo",
            6: "negro",
            7: "rojo",
            8: "negro",
            9: "rojo",
            10: "negro",
            11: "negro",
            12: "rojo",
            13: "negro",
            14: "rojo",
            15: "negro",
            16: "rojo",
            17: "negro",
            18: "rojo",
            19: "rojo",
            20: "negro",
            21: "rojo",
            22: "negro",
            23: "rojo",
            24: "negro",
            25: "rojo",
            26: "negro",
            27: "rojo",
            28: "negro",
            29: "negro",
            30: "rojo",
            31: "negro",
            32: "rojo",
            33: "negro",
            34: "rojo",
            35: "negro",
            36: "rojo"
        };
    }

    async ejecutar(jugador:Jugador):Promise<{
        apuestaTotal: number;
        resultado: "victoria" | "derrota";
        ganancia?: number;
      }>{
        
        let juegoActivo:boolean=true
        let apuestaTotal:number=0
        let ganancia:number=0
        let resultado:"victoria" | "derrota"="derrota"

        console.log("==========================================");
        console.log("     🎰 🎲 Bienvenido a Devil's Roullette 🎡 🎲 🎰    ");
        console.log("------------------------------------------");

       while(juegoActivo==true){

            if (jugador.obtenerSaldo()<this.apuestaMinima){
            console.log("Su saldo es menor a la apuesta minima requerida para jugar."+"\n"+
                "Por favor cargue saldo y vuelva a ingresar al juego, lo esperamos")
            process.exit()};

            juegoActivo=false;

            let juegaAlColorOAlNumero= await Menu.elegirOpcion("Apuesta al color o al numero? ",
                [{valor:"color",nombre:"Color"},{valor:"numero",nombre:"Numero"}]);

            let valorApostadoStr=await Menu.elegirOpcion("Seleccione el monto a apostar",
                [{valor:"500",nombre:"$ 500"},{valor:"1000",nombre:"$ 1.000"},
                    {valor:"5000",nombre:"$ 5.000"},{valor:"10000",nombre:"$ 10.000"}]);

            let valorApostado=parseInt(valorApostadoStr);

            let resul:number=Math.round(Math.random()*36);

            let color=this.tablero[resul];
            
    

            if (juegaAlColorOAlNumero=="color"){
                let colorIngresado= await Menu.elegirOpcion("seleccione el color al que apuesta",[{valor:"rojo",nombre:"Rojo"},{valor:"negro",nombre:"Negro"}])
                if (color==colorIngresado){
                    jugador.sumarSaldo(valorApostado*10);
                    resultado="victoria";
                    ganancia=ganancia+valorApostado*10;
                }else{ jugador.restarSaldo(valorApostado)};
    
            }else {
                    let valorIngresado=await Menu.pedirNumero("Ingrese el numero al que apuesta ", (valor) => {
                        if (valor === undefined) {
                          return 'El valor no puede ser undefined';
                        }
                        if (typeof valor !== 'number') {
                          return 'El valor debe ser un número';
                        }
                        if (valor <= 0 || valor > 36) {
                          return 'El valor debe ser mayor que 0 y menor o igual a 36';
                        }
                        return true;
                      })
                
                    if (resul==valorIngresado){
                        jugador.sumarSaldo(valorApostado*100);
                        resultado="victoria";
                        ganancia=ganancia+valorApostado*100;
                    }else{ jugador.restarSaldo(valorApostado)};
                }
    
            
            apuestaTotal=apuestaTotal+valorApostado;
            
            setTimeout(()=> console.log("\n"+"No va mas, ya no se reciben mas apuestas!!!"),3000);

            setTimeout(()=>console.log("La rueta esta girando..."),5000);
            
            setTimeout(()=>console.log(" Ha salido el "+resul+" "+color),7000);
            
            let mje:Promise<string>;

            async function esperarOpcion() {
                return new Promise<string>((resolve) => {
                    setTimeout(async () => {    
                        const mje = await Menu.elegirOpcion(
                            "Desea volver a jugar?",
                            [{ valor: "apostar", nombre: "Volver a Jugar" }, { valor: "no", nombre: "Salir del juego" }]
                        );
                        resolve(mje);  
                    }, 9000);
            })};
            

            

            async function reiniciarJuego(): Promise<boolean> {
                // Esperamos a que la promesa se resuelva para obtener el valor de mje
                const mje = await esperarOpcion();
            
                // Evaluamos el valor de mje y actualizamos la variable juegoActivo
                if (mje === "apostar") {
                    juegoActivo = true;
                } else {
                    juegoActivo = false;
                }
            
                // Devolvemos el valor de juegoActivo
                return juegoActivo;
            }
            juegoActivo=await reiniciarJuego();
        
            

        }
        return {apuestaTotal,resultado,ganancia };
        
        
        

      
    }

 

}
/* Instancias para probar el juego
let ruleta=new Ruleta()
let jugador=new Jugador("Jose",100000)


ruleta.ejecutar(jugador)*/