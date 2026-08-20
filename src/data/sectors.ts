export const sectors = [
  {
    slug: "impianti-tecnologici",
    title: "Impianti tecnologici civili e industriali",
    short:
      "Impianti elettrici, meccanici, termoidraulici e speciali per edifici civili e industriali.",
    description:
      "Realizziamo impianti elettrici, meccanici, idrosanitari, di climatizzazione, antincendio, fotovoltaici e speciali, per il settore civile e industriale. Progettazione integrata, esecuzione certificata e collaudo finale a regola d'arte.",
    items: [
      "Impianti elettrici BT/MT",
      "Climatizzazione e riscaldamento",
      "Idrosanitari e antincendio",
      "Fotovoltaico ed efficientamento",
      "Sistemi speciali e BMS",
    ],
    image: "electrical",
  },
  {
    slug: "settore-edile",
    title: "Settore edile",
    short: "Edilizia integrata, ristrutturazioni e opere civili a supporto degli impianti.",
    description:
      "Realizziamo opere civili ed edili integrate ai progetti impiantistici: ristrutturazioni complete, finiture, opere strutturali, sistemazioni esterne e cantieri chiavi in mano per committenti privati, pubblici e industriali.",
    items: [
      "Ristrutturazioni complete",
      "Opere strutturali e finiture",
      "Cantieri chiavi in mano",
      "Sistemazioni esterne",
      "Edilizia industriale",
    ],
    image: "edile",
  },
  {
    slug: "manutenzione-impianti",
    title: "Manutenzione e conduzione impianti",
    short: "Servizi di manutenzione ordinaria, programmata e su chiamata 24/7.",
    description:
      "Garantiamo la continuità operativa degli impianti con contratti di manutenzione ordinaria, straordinaria, programmata e gestione tecnica completa. Squadre specializzate, reperibilità 24/7 e reportistica digitale.",
    items: [
      "Manutenzione programmata",
      "Pronto intervento 24/7",
      "Conduzione e gestione",
      "Audit energetico",
      "Reportistica digitale",
    ],
    image: "maintenance",
  },
  {
    slug: "progettazione",
    title: "Progettazione",
    short: "Studio di fattibilità, progettazione esecutiva e direzione lavori.",
    description:
      "Il nostro studio tecnico interno cura ogni fase progettuale: fattibilità, definitiva, esecutiva, direzione lavori e collaudo. Lavoriamo in BIM e in stretta collaborazione con architetti e committenti.",
    items: [
      "Studio di fattibilità",
      "Progettazione esecutiva",
      "Direzione lavori",
      "Modellazione BIM",
      "Pratiche e collaudi",
    ],
    image: "design",
  },
] as const;

export type SectorSlug = (typeof sectors)[number]["slug"];
