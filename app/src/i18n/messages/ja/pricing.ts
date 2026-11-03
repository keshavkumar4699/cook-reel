import { plural } from '../../catalog';

/** Plans and credits screen. Credits are what AI features spend; saving and cooking are always free. */
export default {
  hero: {
    title: 'シェフともっと料理を',
    notEnough: 'クレジットが足りません',
    outOfCredits: 'クレジットがなくなりました',
    body: 'AIレシピ、アレンジ、YouTubeのステップリールに使えるクレジットが毎月届きます。',
    bodyOut: 'プランを選ぶと、レシピ作成や動画のステップリール化を続けられます。保存したレシピはいつでも無料です。',
  },
  creditsLeft: plural({ other: '残り{count}クレジット' }),
  period: {
    monthly: '月額',
    yearly: '年額',
    yearlySave: '年額 · {percent}%お得',
  },
  plans: {
    basic: {
      name: 'Basic',
      tagline: '毎週いくつか新しい料理を作りたい方に',
      perks: {
        ai: 'AIレシピ、冷蔵庫モード、アレンジ',
        youtube: 'YouTube・ショートのステップリール',
        topups: '足りなくなったら追加パック',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'ほぼ毎日料理する方に',
      perks: {
        everything: 'Basicのすべての機能',
        credits: 'Basicの3倍以上のクレジット',
      },
    },
    max: {
      name: 'Max',
      tagline: '作り置き派・レシピをたくさん作る方に',
      perks: {
        everything: 'Proのすべての機能',
        value: 'クレジット単価がいちばんお得',
      },
    },
  },
  planA11y: {
    monthly: '{name}、月額{price}',
    yearly: '{name}、年額{price}',
  },
  badges: {
    current: '利用中',
    mostPopular: 'いちばん人気',
  },
  perMonth: '月額',
  perMonthApprox: '月あたり約{price}',
  monthlyCredits: plural({ other: '毎月{count}クレジット' }),
  approxRecipes: plural({ other: 'レシピ約{count}件分' }),
  costs: {
    title: 'クレジットを使う機能',
    recipe: 'シェフのAIレシピ',
    experiment: 'レシピのアレンジ',
    youtube: 'YouTube動画の分割',
    youtubeShort: 'YouTubeショートの分割',
    free: '保存・献立・調理モード',
    freeValue: '無料',
    note: 'シェフからの質問は無料です。取り込みに失敗した場合は自動で返却されます。毎月のクレジットは請求月ごとにリセットされ、追加クレジットに有効期限はありません。',
  },
  topups: {
    title: 'クレジットを追加しますか？',
    unit: plural({ other: 'クレジット' }),
    a11y: plural({ other: '{count}クレジット、{price}' }),
  },
  links: {
    restore: '購入を復元',
    terms: '利用規約',
    privacy: 'プライバシー',
  },
  renewal: 'サブスクリプションは、期間終了の24時間前までに{store}の設定で解約しない限り自動更新されます。',
  genericStore: 'アプリストア',
  cta: {
    signUp: '登録して購読する',
    current: '{plan}を利用中',
    continue: '{plan}で続ける',
    perMonth: '{price}/月',
    perYear: '{price}/年',
  },
  toasts: {
    unavailable: 'この商品はお使いのストアではまだご利用いただけません。',
    appsOnly: '購入はiOS・Androidアプリでご利用いただけます。',
    done: plural({ other: '準備完了！{count}クレジットが使えます。' }),
    restored: '購入を復元しました',
  },
  errors: {
    purchaseFailed: '購入を完了できませんでした。',
    restoreFailed: '購入を復元できませんでした。',
  },
} as const;
