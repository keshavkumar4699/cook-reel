/** Commande vocale du mode cuisine. */
export default {
  quote: '« {word} »',
  help: {
    move: 'Passer d’une étape à l’autre',
    playPause: 'Mettre l’extrait en pause ou le reprendre',
    repeat: 'Rejouer l’étape depuis le début',
    read: 'Lire l’étape à voix haute',
    timer: 'Lancer le minuteur de l’étape',
    ingredients: 'Écouter la liste des ingrédients',
    wake: 'À dire d’abord pour les phrases plus longues',
  },
} as const;
