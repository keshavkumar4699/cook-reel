import { plural } from '../../catalog';

/** edit screen strings. */
export default {
  titleEdit: 'レシピを編集',
  titleNew: '新しいレシピ',
  fields: {
    name: 'レシピ名',
    namePlaceholder: 'お母さんの肉じゃが',
    description: '説明',
    descriptionPlaceholder: 'このレシピのおすすめポイントは？',
    servings: '人数',
    prep: '下準備（分）',
    cook: '調理（分）',
    difficulty: '難易度',
    tags: 'タグ',
    tagsPlaceholder: '時短, 高たんぱく, ほっこり',
  },
  ingredients: {
    title: '材料',
    quantity: '量',
    unit: '単位',
    name: '材料名',
    remove: '材料を削除',
    add: '材料を追加',
  },
  steps: {
    title: '作り方',
    placeholder: 'このステップですること',
    timer: 'タイマー（分）',
    keepsClip: '動画クリップはそのまま',
    remove: 'ステップを削除',
    add: 'ステップを追加',
  },
  defaultStepTitle: 'ステップ{n}',
  nutrition: {
    title: '1人分の栄養成分',
    hint: '任意です。わかる範囲で入力してください。',
    kcal: 'kcal',
    protein: 'たんぱく質 g',
    carbs: '炭水化物 g',
    fat: '脂質 g',
  },
  errors: {
    noTitle: 'レシピ名を入力してください。',
    noIngredients: '材料を1つ以上追加してください。',
    noSteps: 'ステップを1つ以上追加してください。',
  },
  saveChanges: '変更を保存',
  saveRecipe: 'レシピを保存',
  toasts: {
    updated: 'レシピを更新しました',
    saved: 'レシピ帳に保存しました',
  },
  paste: {
    open: 'まとめて貼り付け',
    title: '材料を貼り付け',
    subtitle: '1行に1つずつ。「米 カップ2」「塩 小さじ½」「パニール 200g（角切り）」',
    placeholder: 'バスマティ米 カップ2\nギー 大さじ1\nターメリック 小さじ½',
    add: '追加する',
    added: plural({ other: '材料を{count}品追加しました' }),
  },
} as const;
