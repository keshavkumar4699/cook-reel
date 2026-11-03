import { plural } from '../../catalog';

/** Shared chrome: the "add a recipe" sheet, credits pill, stepper and the welcome hero illustration. */
export default {
  createSheet: {
    title: 'レシピを追加',
    subtitleSignedIn: 'AI機能はクレジットを使います',
    subtitleGuest: 'AI機能には無料アカウントが必要です',
    aiBadge: 'AI',
    youtubeTitle: 'YouTube動画から',
    youtubeBody: 'リンクを貼るだけでステップごとのクリップに',
    chefTitle: 'シェフと作る',
    chefBody: '食べたいものを伝えて、いくつか質問に答えるだけ',
    fridgeTitle: '冷蔵庫の中身で作る',
    fridgeBody: '手元の食材を伝えると、シェフがレシピを提案',
    manualTitle: '自分で書く',
    manualBody: '家庭の味やオリジナルレシピを保存',
  },
  creditsPill: {
    a11y: plural({ other: '{count}クレジット。追加する' }),
  },
  stepper: {
    decrease: '減らす',
    increase: '増やす',
  },
  hero: {
    sideStep: 'ステップ{n}',
    stepOf: 'ステップ{current}/{total} · {range}',
    stepTitle: '麺を和える',
    sayNext: '「次へ」と話しかける',
  },
} as const;
