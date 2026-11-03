/** Home screen strings. */
export default {
  nameTitle: '{name}さん 👋',
  guestTitle: 'こんにちは 👋',
  composer: {
    title: '今日は何を作りますか？',
    placeholder: '例：20分でできるピリ辛パニール',
    inputLabel: '作りたい料理を入力',
    send: 'シェフに聞く',
  },
  prompts: {
    highProteinDinner: '高たんぱくな夕食',
    quickBreakfast: '15分でできる朝ごはん',
    cosyDal: 'ひとり分のほっこりダール',
    useLeftovers: '残り物を使い切りたい',
    cheapFilling: '安くてお腹いっぱい',
    impressDate: 'デートで喜ばれる料理',
  },
  actions: {
    youtube: { title: 'YouTubeから', body: '動画をステップに' },
    builder: { title: 'シェフと作る', body: 'どんな料理でもOK' },
    fridge: { title: '冷蔵庫から', body: '手元の食材で' },
    manual: { title: '自分で書く', body: '家庭の味を保存' },
  },
  upsell: {
    badge: '無料クレジット',
    title: 'シェフとYouTubeリールを使おう',
    body: '無料アカウントを作るとAIが使えます。最初のレシピは無料です。',
  },
  sections: {
    cookLater: { title: 'あとで作る', subtitle: 'お腹がすいたときのために' },
    quick: { title: '時短＆高たんぱく', subtitle: 'すぐできて満足感のある一皿' },
    experiments: { title: 'あなたのアレンジ', subtitle: 'シェフと作ったアレンジレシピ' },
    recent: { title: '最近追加したレシピ', subtitle: 'レシピ帳に新しく追加' },
  },
  voiceTip: {
    title: 'ハンズフリーで料理',
    body: '調理モードでは「次へ」「戻って」「ストップ」と話しかけるだけ。汚れた手で画面に触れる必要はありません。',
    dismiss: 'ヒントを閉じる',
  },
} as const;
