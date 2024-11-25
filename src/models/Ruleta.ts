import path from "path";
import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { promises } from "dns";
import * as rls from "readline-sync"


class Ruleta extends Juego {
    protected tablero:{[key: number]: string;}
    protected apuestaMinima:number
    protected instrucciones: string;

    constructor(){
        super()
        this.apuestaMinima=20
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

        while(juegoActivo==true){
            let juegaAlColorOAlNumero:string=rls.question("Juega al color o al numero?  ")
            let valorApostado:number=rls.questionInt("Ingrese el monto a apostar: ")//aca va implementado inquirer
            let resul:number=Math.round(Math.random()*36)
            let color=this.tablero[resul]
            
    
            if (juegaAlColorOAlNumero=="color"){
                let colorIngresado:string=rls.question("Ingrese el color al que apuesta: ")//aca va inquirer
                if (color==colorIngresado){
                    jugador.sumarSaldo(valorApostado*10)
                    resultado="victoria"
                    ganancia=ganancia+valorApostado*10
                }else{ jugador.restarSaldo(valorApostado)}
    
            }else {
                    let valorIngresado:number=rls.questionInt("ingrese numero al que apuesta: ")//aca va inquirer
                
                    if (resul==valorIngresado){
                        jugador.sumarSaldo(valorApostado*100)
                        resultado="victoria"
                        ganancia=ganancia+valorApostado*100
                    }else{ jugador.restarSaldo(valorApostado)}
                }
    
            
            apuestaTotal=apuestaTotal+valorApostado
            console.log(resul)
            console.log(color)

            let mje:string=rls.question("Desea apostar de nuevo: ")// aca va inquirer

            if (mje=="no"){
                juegoActivo=false
            }
        
            

        }
        return {apuestaTotal,resultado,ganancia }
        

        

      
    }

 

}
/*Instancias para probar juego
let ruleta=new Ruleta()
let jugador=new Jugador("Jose",2000)
console.log(jugador)
let resultado=ruleta.ejecutar(jugador)
console.log(resultado)
console.log(jugador)*/