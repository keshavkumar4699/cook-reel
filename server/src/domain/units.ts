/**
 * Canonical ingredient units. The AI may write units in any of the app's languages ("cucharadas",
 * "EL", "大さじ"); recipes store the canonical code and each app language displays it its own way.
 * Copy of app/src/lib/units.ts — keep the alias table in sync.
 */
export const UNIT_CODES = [
  'g', 'kg', 'ml', 'l', 'oz', 'lb', 'tsp', 'tbsp', 'cup', 'piece', 'clove', 'slice', 'can', 'bunch', 'pinch', 'handful', 'sprig', 'stick', 'packet',
] as const;
export type UnitCode = (typeof UNIT_CODES)[number];

const ALIASES: Record<UnitCode, string[]> = {
  g: ['g', 'gm', 'gms', 'gr', 'gram', 'grams', 'gramme', 'grammes', 'gramo', 'gramos', 'grama', 'gramas', 'grammo', 'grammi', 'gramm', 'غرام', 'غ', 'جرام', 'جم', 'グラム'],
  kg: ['kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms', 'kilogramme', 'kilogrammes', 'kilogramo', 'kilogramos', 'quilo', 'quilos', 'quilograma', 'quilogramas', 'kilogramm', 'كيلو', 'كيلوغرام', 'كغ', 'キロ'],
  ml: ['ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters', 'mililitro', 'mililitros', 'millilitro', 'millilitri', 'cc', 'مل', 'مليلتر', 'ミリリットル'],
  l: ['l', 'ltr', 'litre', 'litres', 'liter', 'liters', 'litro', 'litros', 'litri', 'لتر', 'リットル'],
  oz: ['oz', 'ounce', 'ounces', 'onza', 'onzas', 'once', 'onça', 'onças', 'oncia', 'unze', 'أونصة'],
  lb: ['lb', 'lbs', 'pound', 'pounds', 'libra', 'libras', 'livre', 'livres', 'libbra', 'pfund', 'رطل'],
  tsp: [
    'tsp', 'teaspoon', 'teaspoons', 'cucharadita', 'cucharaditas', 'cdta', 'cdtas', 'cdita', 'c. à c.', 'c.à.c.', 'càc', 'cuillère à café', 'cuillères à café',
    'tl', 'teelöffel', 'colher de chá', 'colheres de chá', 'c. chá', 'cucchiaino', 'cucchiaini', 'ملعقة صغيرة', 'ملاعق صغيرة', '小さじ',
  ],
  tbsp: [
    'tbsp', 'tbs', 'tablespoon', 'tablespoons', 'cucharada', 'cucharadas', 'cda', 'cdas', 'c. à s.', 'c.à.s.', 'càs', 'cuillère à soupe', 'cuillères à soupe',
    'el', 'esslöffel', 'colher de sopa', 'colheres de sopa', 'c. sopa', 'cucchiaio', 'cucchiai', 'ملعقة كبيرة', 'ملاعق كبيرة', '大さじ',
  ],
  cup: ['cup', 'cups', 'taza', 'tazas', 'tasse', 'tassen', 'xícara', 'xícaras', 'chávena', 'chávenas', 'tazza', 'tazze', 'كوب', 'أكواب', 'カップ'],
  piece: ['piece', 'pieces', 'pc', 'pcs', 'pieza', 'piezas', 'unidad', 'unidades', 'ud', 'uds', 'pièce', 'pièces', 'stück', 'stk', 'unidade', 'pedaço', 'pedaços', 'pezzo', 'pezzi', 'حبة', 'حبات', 'قطعة', 'قطع', '個', 'つ', '本'],
  clove: ['clove', 'cloves', 'diente', 'dientes', 'gousse', 'gousses', 'zehe', 'zehen', 'dente', 'dentes', 'spicchio', 'spicchi', 'فص', 'فصوص', '片', 'かけ'],
  slice: ['slice', 'slices', 'rebanada', 'rebanadas', 'loncha', 'lonchas', 'rodaja', 'rodajas', 'tranche', 'tranches', 'scheibe', 'scheiben', 'fatia', 'fatias', 'fetta', 'fette', 'شريحة', 'شرائح', '枚'],
  can: ['can', 'cans', 'tin', 'tins', 'lata', 'latas', 'boîte', 'boîtes', 'dose', 'dosen', 'lattina', 'lattine', 'barattolo', 'علبة', 'علب', '缶'],
  bunch: ['bunch', 'bunches', 'manojo', 'manojos', 'botte', 'bottes', 'bouquet', 'bund', 'maço', 'maços', 'mazzo', 'mazzi', 'mazzetto', 'حزمة', 'باقة', '束', '把'],
  pinch: ['pinch', 'pinches', 'pizca', 'pizcas', 'pincée', 'pincées', 'prise', 'prisen', 'pitada', 'pitadas', 'pizzico', 'pizzichi', 'رشة', 'つまみ', 'ひとつまみ'],
  handful: ['handful', 'handfuls', 'puñado', 'puñados', 'poignée', 'poignées', 'handvoll', 'punhado', 'punhados', 'manciata', 'manciate', 'حفنة', 'つかみ', 'ひとつかみ'],
  sprig: ['sprig', 'sprigs', 'ramita', 'ramitas', 'brin', 'brins', 'zweig', 'zweige', 'raminho', 'raminhos', 'rametto', 'rametti', 'غصن', 'أغصان', '枝'],
  stick: ['stick', 'sticks', 'rama', 'ramas', 'bâton', 'bâtons', 'stange', 'stangen', 'pau', 'paus', 'stecca', 'stecche', 'عود'],
  packet: ['packet', 'packets', 'pack', 'packs', 'sachet', 'sachets', 'sobre', 'sobres', 'paquete', 'paquetes', 'paquet', 'paquets', 'päckchen', 'packung', 'pck', 'pacote', 'pacotes', 'sachê', 'bustina', 'bustine', 'confezione', 'كيس', 'عبوة', '袋', 'パック'],
};

/** Lower-cases and drops a trailing dot, so "Cucharadas." and "cucharadas" match. */
export function foldUnit(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/\s+/g, ' ');
}

const LOOKUP = new Map<string, UnitCode>();
for (const code of UNIT_CODES) {
  for (const alias of ALIASES[code]) LOOKUP.set(foldUnit(alias), code);
}

/** The canonical code for a unit; '' for whole countable items; unknown units are kept as written. */
export function canonicalUnit(unit: string | null | undefined): string {
  const raw = (unit ?? '').replace(/\s+/g, ' ').trim();
  const key = foldUnit(raw);
  if (!key) return '';
  return LOOKUP.get(key) ?? raw;
}
