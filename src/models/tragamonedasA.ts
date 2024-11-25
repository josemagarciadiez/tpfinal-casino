import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
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
        "🤡":1
    }
    private jugador: Jugador;
    private apuesta: number;
    public constructor(jugador: Jugador){
        super();
        this.apuestaMinima = 5;
        this.apuestaMaxima = 5000; 
        this.simbolos = ["🐈","🐕","🐀","🤡","❤️","💀","🌹"];
        this.jugada = [];
        this.apuesta = 5;
        this.jugador = jugador;
    }

    //getters----
    getApuestaMinima(): number{
        return this.apuestaMinima;
    }
    getApuestaMaxima(): number{
        return this.apuestaMaxima;
    }
    getApuesta(): number{
        return this.apuesta;
    }
    //setters----
    setApuesta(apuesta:number): number{
        return this.apuesta = apuesta;
    }
    //methods----

    public realizarApuesta(apuestaMinima: number, apuestaMaxima: number): number {
        let apuesta: number;
        do {
            apuesta = parseInt(prompt(`Ingresa tu apuesta: `) || "5");
            if (isNaN(apuesta) || apuesta < apuestaMinima || apuesta > apuestaMaxima || apuesta > this.jugador.obtenerSaldo()) {
                alert("Apuesta inválida. Ingresa un valor entre " + apuestaMinima + " y " + apuestaMaxima + " y que no supere tu saldo.");
            }
        } while (isNaN(apuesta) || apuesta < apuestaMinima || apuesta > apuestaMaxima || apuesta > this.jugador.obtenerSaldo());

        this.jugador.restarSaldo(apuesta); // Resta la apuesta del saldo del jugador
        return apuesta;
    }

    async ejecutar(jugador: Jugador): Promise<{
        apuestaTotal: number;
        resultado: "victoria" | "derrota";
        ganancia?: number; 
    }> {
        const apuesta = this.realizarApuesta(this.apuestaMinima, this.apuestaMaxima); 
        const tirada = this.tirada()!;
        const ganancia = this.calcularGanancia(tirada);

        let resultado: "victoria" | "derrota" = "derrota";
        if (ganancia > 0) {
            resultado = "victoria";
        }

        return {
            apuestaTotal: apuesta,
            resultado: resultado,
            ganancia: ganancia // Si no hay ganancia, ganancia será undefined
        };
    }

    public simboloRandom(){
        let i = Math.floor(Math.random() * this.simbolos.length);
        return this.simbolos[i-1]; 
    }
    public tirada(){
        let i:number;
        for (i = 0; i < this.simbolos.length; i++) {
            let newSymbol = this.simboloRandom();
            this.jugada.push(newSymbol); 
            return this.jugada;
        }
    }
    
    //Funcion auxiliar para contar las similitudes de cada simbolo
    public contarOcurrencias(tirada: string[]): Record<string, number>{
        const contador: Record<string, number> = {};
        tirada.forEach(simbolo => {
            //Si el simbolo es 🤡, cuenta como comodin
            if(simbolo === "🤡"){
                contador["🐈"] = (contador["🐈"] || 0) + 1; // || 0 verifica si simbolo existe en contador
                contador["🐕"] = (contador["🐕"] || 0) + 1; // 0 return 0, luego contador[] se establece en 1
                contador["🐀"] = (contador["🐀"] || 0) + 1;
                contador["❤️"] = (contador["❤️"] || 0) + 1;
                contador["💀"] = (contador["💀"] || 0) + 1;
                contador["🌹"] = (contador["🌹"] || 0) + 1;
            } else{
                contador[simbolo] = (contador[simbolo] || 0) + 1;
            }
        });
        return contador;
    }

    public contarSimilitudes(tirada: string[]):boolean{
        const contador = this.contarOcurrencias(tirada);
        for(const simbolo in contador){
            if(contador[simbolo] >= 2){ //controla si hay algun simbolo que se repita
                return true; //Hay dos o  mas simbolos iguales
            }
        }
        return false;
    }

    public calcularGanancia(tirada: string[]):number{
        const contador = this.contarOcurrencias(tirada);
        let gananciaTotal = 0;

        for(const simbolo in contador){
            if(contador[simbolo] >=2){ //verifica que se repita al menos dos veces
                const valorSimbolo = this.valores[simbolo];
                gananciaTotal += valorSimbolo * contador[simbolo]; //habria que agregar para que multiplique tambien por el valor de la apuesta
            }
        }

        return gananciaTotal;
    }

    public analizarTirada(){
        //se almacena lo que retorno la funcion tirada()
        const tirada = this.tirada();
        if(tirada !== undefined){ //se asegura de que tirada no sea undefined
            this.jugada = tirada; //asigna tirada a this.jugada
            return this.contarSimilitudes(this.jugada); //analiza si el usuario ganó, tomando como parametro jugada
        }else{
            return console.error(0); //Si tirada = undefined retorna error
        }
        const ganancia = this.calcularGanancia(this.jugada);
        return ganancia;
    }

}