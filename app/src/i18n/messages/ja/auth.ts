import { plural } from '../../catalog';

/** Welcome screen, sign-in and account creation. */
export default {
  welcome: {
    heroLine1: 'どんな料理も、',
    heroLine2: 'ひとつずつ、かんたんに。',
    body: 'YouTubeのレシピをハンズフリーのステップリールに。シェフなら、あなたのキッチン・目標・予算に合った料理を考えてくれます。',
    guest: 'アカウントなしで続ける',
    note: 'レシピの保存と調理は無料です。AI機能にはアカウントが必要です。新規アカウントには最初から無料クレジットが付きます。',
    language: '言語：{language}',
  },
  signIn: {
    title: '登録してAIで料理しよう',
    body: 'ワンタップで完了。レシピ、献立、リストはこの端末に保存されたままです。',
    perks: {
      chef: { title: 'AI料理アシスタントのシェフ', body: '食べたいものを伝えると、キッチンと目標に合ったレシピが届きます。' },
      youtube: { title: 'YouTubeをステップリールに', body: 'どんなレシピ動画も、声で操作できる短いクリップに。' },
      credits: { title: '最初は無料クレジット付き', body: 'すべてのAI機能を無料でお試しください。保存したレシピは端末に残ります。' },
    },
    legal: '続けることで、利用規約とプライバシーポリシーに同意したものとみなされます。',
  },
  buttons: {
    google: 'Googleで続ける',
    devTitle: '開発用ログイン',
    devName: '名前',
    devButton: 'テスト用にログイン',
  },
  welcomeCredits: plural({
    other: 'ようこそ！無料クレジット{count}をアカウントに追加しました。',
  }),
  errors: {
    generic: 'ログインできませんでした。もう一度お試しください。',
    appleNoToken: 'Appleでログインを確認できませんでした。もう一度お試しください。',
    appleIosOnly: 'Appleでサインインは、iOSアプリでご利用いただけます。',
    googleNeedsBuild: 'Googleログインには、CookReelアプリのビルドが必要です（Expo Goでは使えません）。',
    googleNoToken: 'Googleでログインを確認できませんでした。もう一度お試しください。',
    googleNoPlayServices: 'この端末ではGoogle Play開発者サービスを利用できません。',
    googleAppsOnly: 'Googleログインは、iOS・Androidアプリでご利用いただけます。',
    purchasesAppsOnly: '購入はiOS・Androidアプリでご利用いただけます。',
  },
} as const;
