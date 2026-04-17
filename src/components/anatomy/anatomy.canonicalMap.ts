/**
 * Diccionario explícito de nombres raw → nombre canónico de músculo.
 *
 * Este mapeo es la única fuente de verdad para agrupar variantes (izquierdo/
 * derecho, masculino/femenino, vistas distintas) bajo un mismo identificador,
 * que también se usa como etiqueta visible en el inspector y como clave del
 * estado de recuperación.
 *
 * Si añades un nuevo SVG, regístralo aquí; la función `getCanonical()` hace
 * fallback a una normalización heurística si falta una entrada (útil en dev,
 * pero lo ideal es siempre mapear).
 */
export const MUSCLE_CANONICAL: Readonly<Record<string, string>> = {
  // ─── Front · Male ──────────────────────────────────────────────────────────
  Sternocleidomastoid:    'Neck',
  TrapeziusAnterior:      'Front Traps',
  DeltoidFrontLeft:       'Front Delts',
  DeltoidFrontRight:      'Front Delts',
  DeltoidSide:            'Side Delts',
  ChestUpperLeft:         'Upper Chest',
  ChestUpperRight:        'Upper Chest',
  ChestMiddleLeft:        'Mid Chest',
  ChestMiddleRight:       'Mid Chest',
  ChestLowerLeft:         'Lower Chest',
  ChestLowerRight:        'Lower Chest',
  BicepsLeft:             'Biceps',
  BicepsRight:            'Biceps',
  TricepsFrontView:       'Triceps',
  Forearms:               'Forearms',
  Abs:                    'Abs',
  ObliquesLeft:           'Obliques',
  ObliquesRight:          'Obliques',
  HipFlexors:             'Hip Flexors',
  QuadsLeft:              'Quads',
  QuadsRight:             'Quads',
  CalvesFrontLeft:        'Calves',
  CalvesFrontRight:       'Calves',

  // ─── Front · Female ────────────────────────────────────────────────────────
  SternocleidomastoidFemale:          'Neck',
  'Trapezius(Frontview)Female':       'Front Traps',
  FrontDeltoidFemale:                 'Front Delts',
  'SideDelts(FrontView)Female':       'Side Delts',
  UpperChestFemale:                   'Upper Chest',
  MidChestFemale:                     'Mid Chest',
  LowerChestFemale:                   'Lower Chest',
  BicepsFemale:                       'Biceps',
  'Triceps(FrontView)Female':         'Triceps',
  'Forearms(FrontView)Female':        'Forearms',
  AbsFemale:                          'Abs',
  ObliquesFemale:                     'Obliques',
  HipFlexorsFemale:                   'Hip Flexors',
  QuadsFemale:                        'Quads',
  LateralShinFemale:                  'Shins',
  'Gastrocnemius(frontview)Female':   'Calves',

  // ─── Side · Male ───────────────────────────────────────────────────────────
  UpperTrapsSideView:     'Upper Traps',
  NeckFlexorsSideView:    'Neck Flexors',
  TrapsSideView:          'Mid Traps',
  FrontDelt:              'Front Delts',
  SideDelt:               'Side Delts',
  RearDelt:               'Rear Delts',
  ChestSideView:          'Mid Chest',
  Triceps:                'Triceps',
  BicepSideView:          'Biceps',
  ForearmsSideView:       'Forearms',
  AbsSideView:            'Abs',
  ObliquesSideView:       'Obliques',
  GlutesSideView:         'Glutes',
  QuadsSideView:          'Quads',
  HamstringSideView:      'Hamstrings',
  CalvesSideView:         'Calves',
  TibialisSideView:       'Shins',

  // ─── Side · Female ─────────────────────────────────────────────────────────
  'UpperTraps(SideView)Female':   'Upper Traps',
  'NeckFlexors(SideView)Female':  'Neck Flexors',
  'Traps(SideView)Female':        'Mid Traps',
  'FrontDelts(SideView)Female':   'Front Delts',
  'SideDelts(SideView)Female':    'Side Delts',
  'RearDelts(SideView)Female':    'Rear Delts',
  'UpperChest(SideView)Female':   'Upper Chest',
  'MidChest(sideView)Female':     'Mid Chest',
  'LowerChest(SideView)Female':   'Lower Chest',
  'Triceps(SideView)Female':      'Triceps',
  'Bicep(SideView)Female':        'Biceps',
  'Forearms(SideView)Female':     'Forearms',
  'Abs(SideView)Female':          'Abs',
  'Obliques(SideView)Female':     'Obliques',
  'HipFlexors(SideView)Female':   'Hip Flexors',
  'Glutes(SideView)Female':       'Glutes',
  'Quads(SideView)Female':        'Quads',
  'HamString(SideView)Female':    'Hamstrings',
  'Calves(SideView)Female':       'Calves',
  'Tibialis(SideView)Female':     'Shins',

  // ─── Back · Male ───────────────────────────────────────────────────────────
  UpperTrapsLeft:         'Upper Traps',
  UpperTrapsRight:        'Upper Traps',
  MidTrapsLeft:           'Mid Traps',
  MidTrapsRight:          'Mid Traps',
  RearDeltsLeft:          'Rear Delts',
  RearDeltsRight:         'Rear Delts',
  RearShoulderBlade:      'Rhomboids',
  TricepsLongheadLeft:    'Triceps',
  TricepsLongHeadRight:   'Triceps',
  ForearmsPosterior:      'Forearms',
  LatsLeft:               'Lats',
  LatsRight:              'Lats',
  LowerBack:              'Lower Back',
  ObliquesBackView:       'Obliques',
  GlutesMedius:           'Glutes Medius',
  GlutesMaximus:          'Glutes',
  HamstringsLeft:         'Hamstrings',
  HamstringsRight:        'Hamstrings',
  CalvesLateral:          'Calves',
  CalvesMedial:           'Calves',

  // ─── Back · Female ─────────────────────────────────────────────────────────
  'UpperTraps(BackView)Female':       'Upper Traps',
  'MidTraps(BackView)Female':         'Mid Traps',
  'RearDelts(BackView)Female':        'Rear Delts',
  'RearShoulderBlade(BackView)Female':'Rhomboids',
  'TricepsLonghead(BackView)Female':  'Triceps',
  'Forearms(BackView)Female':         'Forearms',
  'Lats(BackView)Female':             'Lats',
  'LowerBack(BackView)Female':        'Lower Back',
  'Obliques(BackView)Female':         'Obliques',
  'GlutesMedius(BackView)Female':     'Glutes Medius',
  'GlutesMaximus(BackView)Female':    'Glutes',
  'HamString(BackView)Female':        'Hamstrings',
  'CalvesLateral(BackView)Female':    'Calves',
  'CalvesMedial(BackView)Female':     'Calves',
};

if (import.meta.env?.DEV) {
  // Importación diferida para evitar ciclos: MUSCLE_MAP no depende de este mapa.
  import('./anatomy.constants').then(({ MUSCLE_MAP }) => {
    const missing: string[] = [];
    for (const byGender of Object.values(MUSCLE_MAP)) {
      for (const names of Object.values(byGender)) {
        for (const name of names) {
          if (!(name in MUSCLE_CANONICAL)) missing.push(name);
        }
      }
    }
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn(
        `[anatomy] ${missing.length} músculo(s) sin mapeo canónico:`,
        missing,
      );
    }
  });
}
