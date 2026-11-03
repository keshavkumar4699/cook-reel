import { plural } from '../../catalog';

/** Library screen and recipe collections. */
export default {
  subtitle: plural({ other: 'この端末に{count}件のレシピを保存中' }),
  newRecipe: '新しいレシピ',
  search: {
    placeholder: 'レシピ・材料・タグで検索',
    clear: '検索をクリア',
  },
  filters: {
    all: 'すべて',
    cookLater: 'あとで作る',
    mine: '自作',
    variations: 'アレンジ',
    quick: '{duration}以内',
    protein: '高たんぱく',
    light: '{kcal}kcal以下',
    mealPrep: '作り置き',
  },
  collections: {
    new: '新しいコレクション',
    delete: 'コレクションを削除',
  },
  newCollection: {
    title: '新しいコレクション',
    subtitle: '「週末」「子ども向け」「おもてなし」など、好きな分け方でまとめられます',
    namePlaceholder: 'コレクション名',
    create: 'コレクションを作成',
    hint: '各レシピの「•••」メニューから追加できます。',
  },
  noResults: {
    title: '該当するレシピがありません',
    body: '別のキーワードや条件で試してください。',
  },
  emptyLibrary: {
    title: 'ここからレシピ帳が始まります',
    body: 'YouTubeから保存したり、シェフと作ったり、自分で書いたりできます。',
    action: 'レシピを追加',
  },
  collectionSheet: {
    title: 'コレクション',
    subtitle: 'タップで追加・削除',
    empty: 'コレクションはまだありません。最初のひとつを作りましょう。',
    newPlaceholder: '新しいコレクション',
  },
} as const;
