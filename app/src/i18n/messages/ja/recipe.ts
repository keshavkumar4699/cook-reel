import { plural } from '../../catalog';

/** recipe screen strings. */
export default {
  notFound: {
    title: 'レシピが見つかりません',
    body: '削除された可能性があります。',
    action: 'レシピ帳に戻る',
  },
  youtubeShort: 'ショート',
  variationOf: '{title}のアレンジ',
  stats: {
    totalTime: '合計時間',
    kcalPerServing: 'kcal/1人分',
    protein: 'たんぱく質',
  },
  badges: {
    mealPrep: '作り置き',
    costPerServing: '1人分{price}',
  },
  changes: {
    title: '変更点',
  },
  servings: {
    title: '人数',
    asWritten: 'レシピどおり',
    scaled: '分量を×{factor}に調整',
  },
  sections: {
    equipment: '使う道具',
    ingredients: '材料',
    addToList: 'リストに追加',
    ingredientsHint: '手元にあるものはタップでチェック。',
    method: '作り方',
    storage: '残りの保存方法',
  },
  experiment: {
    title: 'アレンジ',
    variations: plural({ other: 'アレンジ{count}件' }),
    create: 'アレンジを作る',
    headline: '自分好みにアレンジ',
    body: 'ヴィーガン、高たんぱく、エアフライヤー、節約…シェフが書き換えます。',
    variation: 'アレンジ',
  },
  notes: {
    title: 'メモ',
    placeholder: '次は唐辛子を控えめに、ライムを少し絞る…',
  },
  rating: {
    title: 'いかがでしたか？',
    rate: plural({ other: '5段階中{count}で評価' }),
    timesCooked: plural({ other: '{count}回作りました' }),
  },
  cookLater: {
    save: 'あとで作るに保存',
    add: 'あとで作る',
    remove: 'あとで作るから削除',
    saved: '「あとで作る」に保存しました',
    removed: '「あとで作る」から削除しました',
  },
  menu: {
    more: 'その他',
    edit: 'レシピを編集',
    addToCollection: 'コレクションに追加',
    addToPlan: '献立に追加',
    addToShopping: '材料を買い物リストに追加',
    share: 'レシピを共有',
    delete: 'レシピを削除',
  },
  deleteConfirm: {
    title: 'このレシピを削除しますか？',
    message: 'この端末から削除されます。',
  },
  toasts: {
    addedToShopping: plural({ other: '買い物リストに{count}点追加しました' }),
    shoppingUpdated: '買い物リストを更新しました',
    view: '見る',
    deleted: 'レシピを削除しました',
  },
  cta: {
    experiment: 'アレンジ',
    startCooking: '作りはじめる',
    narratedClips: 'ナレーション付きクリップ',
    videoClips: '動画クリップ',
    voiceGuided: '音声ガイド付き',
  },
  facts: {
    kcal: '{n}kcal',
    protein: 'たんぱく質{n}g',
  },
  nutrition: {
    title: '栄養成分',
    kcalUnit: 'kcal',
    serving: '1人分',
    allServings: plural({ other: '{count}人分' }),
    barLabel: '栄養素別のカロリー',
    protein: 'たんぱく質',
    carbs: '炭水化物',
    fat: '脂質',
    fibre: '食物繊維',
    disclaimer: '一般的な食品データからの推定値です。メーカーや分量によって異なります。',
  },
  ingredients: {
    line: '{name} {quantity}',
    optional: 'お好みで',
    toTaste: '適量',
    swapWith: '代用：{items}',
    substitutesFor: '{name}の代用品',
  },
  steps: {
    doneWhen: '目安',
    clipRange: '{start}〜{end}',
    glossaryTerm: '{term}：',
  },
} as const;
