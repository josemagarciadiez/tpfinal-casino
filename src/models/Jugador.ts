export class Jugador {
  private nombre: string;
  private saldo: number;

  constructor(nombre: string, saldoInicial: number) {
    this.nombre = nombre;
    this.saldo = saldoInicial;
  }

  obtenerNombre() {
    return this.nombre;
  }

  obtenerSaldo() {
    return this.saldo;
  }

  sumarSaldo(monto: number) {
    this.saldo += monto;
  }

  restarSaldo(monto: number) {
    this.saldo -= monto;
  }
}
