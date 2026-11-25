// Entrada do Worker. O catálogo é o mesmo arquivo que gera a vitrine e entra
// no mesmo deploy: o preço cobrado é o preço mostrado.
import catalogo from "../../public/loja/catalogo.json" with { type: "json" };
import { criarServidor } from "./app.js";

const servidor = criarServidor(catalogo);

export default { fetch: servidor.fetch, scheduled: servidor.scheduled };
