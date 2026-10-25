export const instruments = Object.freeze({
  timpani: { label: 'timpani', bank: 0, program: 47, note: 45, decay: 3 },
  taiko: { label: 'taiko', bank: 0, program: 116, note: 48, decay: 2 },
  concertDrum: { label: 'concertDrum', bank: 8, program: 116, note: 48, decay: 3 },
  bassDrum: { label: 'bassDrum', bank: 0, program: 0, note: 36, drum: true, decay: 1.5 },
  lowTom: { label: 'lowTom', bank: 0, program: 0, note: 41, drum: true, decay: 1.5 },
  highTom: { label: 'highTom', bank: 0, program: 0, note: 48, drum: true, decay: 1.5 },
  largeGong: { label: 'largeGong', bank: 127, program: 112, note: 60, decay: 6 },
  smallGong: { label: 'smallGong', bank: 127, program: 113, note: 60, decay: 5 },
  crash: { label: 'crash', bank: 0, program: 0, note: 49, drum: true, decay: 4 },
  ride: { label: 'ride', bank: 0, program: 0, note: 51, drum: true, decay: 4 },
  china: { label: 'china', bank: 0, program: 0, note: 52, drum: true, decay: 4 },
  splash: { label: 'splash', bank: 0, program: 0, note: 55, drum: true, decay: 3 },
  ...Object.fromEntries([
    ['highQ', 27, .4], ['slap', 28, .4], ['scratchPush', 29, .5], ['scratchPull', 30, .5],
    ['sticks', 31, .4], ['squareClick', 32, .4], ['metronomeClick', 33, .4], ['metronomeBell', 34, 2],
    ['acousticBassDrum', 35, 1.5], ['sideStick', 37, .5], ['snare', 38, 1], ['handClap', 39, .5], ['electricSnare', 40, 1],
    ['closedHiHat', 42, .5], ['lowFloorTom', 43, 1.5], ['pedalHiHat', 44, .5], ['midTom', 45, 1.5],
    ['openHiHat', 46, 2], ['highMidTom', 47, 1.5], ['veryHighTom', 50, 1.5], ['rideBell', 53, 3],
    ['tambourine', 54, 1], ['cowbell', 56, 1], ['crash2', 57, 4], ['vibraslap', 58, 2], ['ride2', 59, 4],
    ['highBongo', 60, 1], ['lowBongo', 61, 1], ['muteHighConga', 62, .5], ['openHighConga', 63, 1], ['lowConga', 64, 1],
    ['highTimbale', 65, 1], ['lowTimbale', 66, 1], ['highAgogo', 67, 1.5], ['lowAgogo', 68, 1.5],
    ['cabasa', 69, .5], ['maracas', 70, .5], ['shortWhistle', 71, .5], ['longWhistle', 72, 2],
    ['shortGuiro', 73, .5], ['longGuiro', 74, 1.5], ['claves', 75, .5],
    ['highWoodBlock', 76, .5], ['lowWoodBlock', 77, .5], ['muteCuica', 78, .5], ['openCuica', 79, 1],
    ['muteTriangle', 80, .5], ['triangle', 81, 4], ['shaker', 82, .5], ['jingleBells', 83, 2], ['bellTree', 84, 4],
    ['castanets', 85, .5], ['muteSurdo', 86, .5], ['surdo', 87, 1.5]
  ].map(([label, note, decay]) => [label, { label, bank: 0, program: 0, note, drum: true, decay }])),
  ...Object.fromEntries([
    ['celesta', 8, 3], ['glockenspiel', 9, 4], ['musicBox', 10, 3], ['vibraphone', 11, 4],
    ['marimba', 12, 2], ['xylophone', 13, 2], ['tubularBells', 14, 5], ['dulcimer', 15, 3],
    ['tinkleBell', 112, 3], ['agogo', 113, 2], ['steelDrum', 114, 3], ['woodBlock', 115, 1],
    ['melodicTom', 117, 2], ['synthDrum', 118, 2], ['reverseCymbal', 119, 4]
  ].map(([label, program, decay]) => [label, { label, bank: 0, program, note: 60, decay }])),
  windChime: { label: 'windChime', bank: 5, program: 124, note: 60, decay: 5 }
});
