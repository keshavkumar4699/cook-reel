import { plural } from '../../catalog';

export default {
  createSheet: {
    title: 'Añadir una receta',
    subtitleSignedIn: 'Las opciones con IA usan créditos',
    subtitleGuest: 'Las opciones con IA necesitan una cuenta gratis',
    aiBadge: 'IA',
    youtubeTitle: 'Desde un video de YouTube',
    youtubeBody: 'Pega un enlace y obtén clips paso a paso',
    chefTitle: 'Crear con Chef',
    chefBody: 'Describe un antojo y responde un par de preguntas',
    fridgeTitle: 'Cocinar con lo que tengo',
    fridgeBody: 'Dile a Chef qué tienes y recibe una receta',
    manualTitle: 'Escribir mi receta',
    manualBody: 'Guarda una receta familiar o una creación tuya',
  },
  creditsPill: {
    a11y: plural({ one: '{count} crédito. Consigue más', other: '{count} créditos. Consigue más' }),
  },
  stepper: {
    decrease: 'Disminuir',
    increase: 'Aumentar',
  },
  hero: {
    sideStep: 'PASO {n}',
    stepOf: 'PASO {current} DE {total} · {range}',
    stepTitle: 'Saltea los fideos',
    sayNext: 'Di «siguiente»',
  },
} as const;
