// Fuentes:
// https://javascript.plainenglish.io/how-to-inquirer-js-c10a4e05ef1f
// https://refactoring.guru/design-patterns/facade

import inquirer from "inquirer";
import { UnnamedDistinctQuestion } from "inquirer/dist/commonjs/types";

/**
 * Clase utilitaria para facilitar el uso del paquete "inquirer.js" para
 * aplicaciones de consola, proporcionando una API simple y coherente para
 * diferentes tipos de preguntas.
 */
export class Menu {
  // Se modifica el acceso al contructor a privado
  // con el fin de bloquear cualquier instancia de la clase.
  private constructor() {}

  /**
   * Muestra una pregunta al usuario y obtiene una respuesta de texto.
   * @param {string} mensaje El mensaje o la pregunta que se mostrará al usuario.
   * @param {(entrada: string | number | null) => boolean | string} [validar] Función opcional para validar la entrada del usuario.
   *  Debe retornar `true` si la entrada es válida, o un mensaje de error en caso contrario.
   * @returns {Promise<string>} La respuesta ingresada por el usuario como una cadena.
   *
   * **Nota:** Este método es asincrónico y debe usarse dentro de una función `async` con `await`.
   * @example
   * async function main() {
   *   const nombre = await Menu.pedirTexto("¿Cuál es tu nombre?");
   *   console.log("Nombre:", nombre);
   * }
   *
   * main();
   */
  static async pedirTexto(
    mensaje: string,
    validar?: (entrada: string | number | null) => boolean | string
  ): Promise<string> {
    const pregunta = await inquirer.prompt({
      name: "respuesta",
      type: "input",
      message: `${mensaje}: `,
      validate: validar,
    });

    return pregunta.respuesta;
  }

  /**
   * Muestra una pregunta al usuario y obtiene una respuesta númerica.
   * @param {string} mensaje El mensaje o la pregunta que se mostrará al usuario.
   * @param {(entrada: string | number | null) => boolean | string} [validar]
   * Función opcional para validar el número ingresado. Debe retornar `true` si el número es válido,
   * o un mensaje de error en caso contrario.
   * @returns {Promise<number>} La respuesta ingresada por el usuario como un número.
   *
   * **Nota:** Este método es asincrónico y debe usarse dentro de una función `async` con `await`.
   * @example
   * async function main() {
   *   const edad = await Menu.pedirNumero("¿Cuál es tu edad?");
   *   console.log("Edad:", edad);
   * }
   *
   * main();
   */
  static async pedirNumero(
    mensaje: string,
    validar?: (
      valor: number | undefined
    ) => string | boolean | Promise<string | boolean>
  ): Promise<number> {
    const answer = await inquirer.prompt({
      name: "respuesta",
      type: "number",
      message: `${mensaje}: `,
      validate: validar,
    });

    return answer.respuesta;
  }

  /**
   * Muestra una pregunta de confirmación al usuario y obtiene una respuesta de tipo (sí/no).
   * @param {string} mensaje El mensaje o la pregunta que se mostrará al usuario.
   * @returns {Promise<boolean>} `true` si el usuario confirma, `false` si no.
   *
   * **Nota:** Este método es asincrónico y debe usarse dentro de una función `async` con `await`.
   * @example
   * async function main() {
   *   const procede = await Menu.pedirConfirmacion("¿Deseas continuar?");
   *   console.log("Continuar:", procede);
   * }
   *
   * main();
   */
  static async pedirConfirmacion(mensaje: string): Promise<boolean> {
    const answer = await inquirer.prompt({
      name: "respuesta",
      type: "confirm",
      message: `${mensaje}: `,
    });

    return answer.respuesta;
  }

  /**
   * Muestra una lista de opciones y permite al usuario seleccionar una.
   * @param {string} mensaje El mensaje o la pregunta que se mostrará al usuario.
   * @param {string[]} opciones Un array de opciones que el usuario puede elegir.
   * @returns {Promise<string>} La opción seleccionada por el usuario.
   *
   * **Nota:** Este método es asincrónico y debe usarse dentro de una función `async` con `await`.
   * @example
   * async function main() {
   *   const color = await Menu.elegirOpcion("Elige un color", ["Rojo", "Verde", "Azul"]);
   *   console.log("Color elegido:", color);
   * }
   *
   * main();
   */
  static async elegirOpcion(
    mensaje: string,
    opciones: { valor: string; nombre: string }[]
  ): Promise<string> {
    const listaOpciones = opciones.map((opcion) => {
      return { value: opcion.valor, name: opcion.nombre };
    });

    const pregunta = await inquirer.prompt({
      name: "respuesta",
      type: "list",
      message: `${mensaje}: `,
      choices: listaOpciones,
    });

    return pregunta.respuesta;
  }

  /**
   * Muestra una lista de preguntas utilizando la biblioteca `inquirer` y devuelve las respuestas del usuario.
   *
   * @param {Object} preguntas - Un arreglo de preguntas que se mostrarán al usuario. Cada pregunta debe incluir
   * un `name`, un `type`, un `message` y, opcionalmente, `choices` para las preguntas de tipo lista.
   *
   * @returns {Promise<Record<string, any>>} Una promesa que se resuelve con un objeto que contiene las respuestas del usuario,
   * donde cada clave es el `name` de la pregunta y el valor es la respuesta proporcionada.
   *
   * @example
   * async function main() {
   *  const preguntas = [
   *   {
   *      nombre: "nombre",
   *      mensaje: "Cual es tu nombre",
   *      tipo: "texto" as const,
   *   },
   *   { nombre: "edad", mensaje: "Cual es tu edad", tipo: "numero" as const },
   *   {
   *      nombre: "mayor",
   *      mensaje: "Eres mayor de edad",
   *      tipo: "confirmacion" as const,
   *   },
   *   {
   *      nombre: "deporte",
   *      mensaje: "Elige tu deporte favorito",
   *      tipo: "lista" as const,
   *      opciones: [
   *          { valor: "futbol", nombre: "Futbol" },
   *          { valor: "rugby", nombre: "Rugby" },
   *          { valor: "basquet", nombre: "Basquet" },
   *      ],
   *    },
   *  ];
   *  const respuesta = await Menu.listaPreguntas(preguntas);
   *  console.log(respuesta);
   * }
   *
   * main();
   */
  static async listaPreguntas(
    preguntas: {
      nombre: string;
      tipo: "texto" | "numero" | "confirmacion" | "lista";
      mensaje: string;
      opciones?: { valor: string; nombre: string }[];
      validacion?: (entrada: string | number | null) => string | boolean;
    }[]
  ) {
    const tipos = {
      texto: "input",
      numero: "number",
      confirmacion: "confirm",
      lista: "list",
    };
    const listaPreguntas = preguntas.map((pregunta) => {
      return {
        name: pregunta.nombre,
        type: tipos[pregunta.tipo],
        message: pregunta.mensaje,
        choices: pregunta.opciones?.map((opcion) => {
          return { value: opcion.valor, name: opcion.nombre };
        }),
        validate: pregunta.validacion,
      };
    }) as unknown as (UnnamedDistinctQuestion<{
      [x: string]: any;
    }> & { name: string })[];

    return await inquirer.prompt(listaPreguntas);
  }
}
