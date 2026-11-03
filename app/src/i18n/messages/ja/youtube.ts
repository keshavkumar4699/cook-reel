import { plural } from '../../catalog';

/** youtube screen strings. */
export default {
  title: 'YouTubeから',
  intro: {
    title: '動画を\nステップごとのリールに',
    body: 'レシピ動画やショートのリンクを貼るだけ。シェフが動画を見て作り方を書き出し、ステップごとに該当シーンをくり返し再生します。ショートには各ステップを説明する音声も付きます。',
    placeholder: 'YouTubeまたはショートのリンク',
    invalidLink: 'YouTubeのリンクではないようです',
    paste: '貼り付け',
    noLinkOnClipboard: 'クリップボードにYouTubeのリンクがありません',
  },
  how: {
    copyLink: 'YouTubeアプリでリンクをコピー（共有 → リンクをコピー）',
    chefBreaksItDown: 'シェフがクリップ・コツ・栄養成分付きのステップに分けます',
    handsFree: 'ハンズフリーで料理：「次へ」「戻って」「ストップ」と話しかけるだけ',
  },
  preview: {
    short: 'ショート',
    video: '動画',
    usesCredits: plural({ other: '{count}クレジット使用' }),
    loading: '動画の情報を読み込み中…',
    breakItDown: 'ステップに分ける',
    notCharged: 'レシピ動画でなければ、クレジットは消費されません。',
  },
  stages: {
    watching: {
      title: '動画を視聴中',
      body: '材料と手順をすべてチェック',
    },
    writing: {
      title: 'ステップを作成中',
      body: 'ステップごとにクリップを合わせ、初心者向けのコツを追加',
    },
    nutrition: {
      title: '栄養成分とナレーション',
      body: 'カロリー、PFC、読み上げ用の文章',
    },
  },
  working: {
    title: 'ステップに分けています…',
    body: 'ふつうは1分もかかりません。この画面を離れても処理は続きます。',
    tip: '💡 待っている間に：調理モードでは「もう一回」でステップのクリップを再生し直し、時間を計るステップでは「タイマースタート」と話しかけられます。',
  },
  done: {
    title: '準備完了 🎉',
    cached: 'この動画はすでに分割済みです。クレジットは使われていません。',
    stepsWithClips: plural({ other: '{count}ステップ、それぞれにクリップ付き。' }),
    stepsAndClips: 'ステップとクリップ',
    cookNow: '保存して料理をはじめる',
    saveForLater: 'あとで作る',
    savedCookNow: '保存しました。さあ、作りましょう！',
    savedForLater: '「あとで作る」に保存しました',
  },
  failed: {
    title: 'うまくいきませんでした',
    refunded: '✓ クレジットは返却されました。',
    tryAnother: '別の動画で試す',
  },
  errors: {
    notStarted: '取り込みを開始できませんでした。もう一度お試しください。',
    expired: 'この取り込みは期限切れです。もう一度やり直してください。',
  },
} as const;
