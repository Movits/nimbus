// Frete da loja própria (plano de 13/11/2026, seção 5).
//
// A regra é do dono, de 28/10/2026: grátis fora da região Norte; no Norte,
// R$ 19,90, e grátis a partir de R$ 399,90 em produtos. Quem cobra é o
// servidor, por este arquivo. Na fase 4 o build do catálogo copia estes
// números daqui para a sacola mostrar o mesmo valor; se um dia os dois
// discordarem, vale o do servidor, que aparece no resumo antes de pagar.

export const FRETE_NORTE_CENTAVOS = 1990;
export const FRETE_NORTE_GRATIS_A_PARTIR_DE_CENTAVOS = 39990;
export const UF_NORTE = new Set(["AC", "AM", "AP", "PA", "RO", "RR", "TO"]);

// Faixas de CEP por estado, em número de 8 dígitos. As sete do Norte são as da
// seção 5 do plano; as outras vêm das mesmas fontes (Wikipedia e pacote geobr
// do IPEA; conferida linha a linha com r-package/R/cep_to_state.R em
// 25/11/2026). Só a do Acre foi vista em página dos Correios: conferir todas na
// Busca Faixa de CEP dos Correios antes de abrir a loja. As fontes deixam um
// buraco, de 78900-000 a 78999-999, entre Mato Grosso e Mato Grosso do Sul:
// CEP ali é recusado ("Confira o CEP") até a conferência dizer de quem é.
export const FAIXAS_CEP = [
  ["SP", 1000000, 19999999],
  ["RJ", 20000000, 28999999],
  ["ES", 29000000, 29999999],
  ["MG", 30000000, 39999999],
  ["BA", 40000000, 48999999],
  ["SE", 49000000, 49999999],
  ["PE", 50000000, 56999999],
  ["AL", 57000000, 57999999],
  ["PB", 58000000, 58999999],
  ["RN", 59000000, 59999999],
  ["CE", 60000000, 63999999],
  ["PI", 64000000, 64999999],
  ["MA", 65000000, 65999999],
  ["PA", 66000000, 68899999],
  ["AP", 68900000, 68999999],
  ["AM", 69000000, 69299999],
  ["RR", 69300000, 69399999],
  ["AM", 69400000, 69899999],
  ["AC", 69900000, 69999999],
  ["DF", 70000000, 72799999],
  ["GO", 72800000, 72999999],
  ["DF", 73000000, 73699999],
  ["GO", 73700000, 76799999],
  ["RO", 76800000, 76999999],
  ["TO", 77000000, 77999999],
  ["MT", 78000000, 78899999],
  ["MS", 79000000, 79999999],
  ["PR", 80000000, 87999999],
  ["SC", 88000000, 89999999],
  ["RS", 90000000, 99999999],
];

export const UFS = new Set(FAIXAS_CEP.map(([uf]) => uf));

/** Estado do CEP (8 dígitos, só números), ou null se não cair em faixa nenhuma. */
export function ufDoCep(cep) {
  if (!/^\d{8}$/.test(cep)) return null;
  const n = Number(cep);
  for (const [uf, de, ate] of FAIXAS_CEP) if (n >= de && n <= ate) return uf;
  return null;
}

/** Frete em centavos para o estado e o subtotal dos produtos, em centavos. */
export function freteCentavos(uf, subtotalCentavos) {
  if (!UF_NORTE.has(uf)) return 0;
  return subtotalCentavos >= FRETE_NORTE_GRATIS_A_PARTIR_DE_CENTAVOS ? 0 : FRETE_NORTE_CENTAVOS;
}
