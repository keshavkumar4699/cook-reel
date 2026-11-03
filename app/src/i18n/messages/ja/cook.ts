import { plural } from '../../catalog';

/** Cooking mode: the full-screen, step-by-step player (cook/[id], StepCard, YouTubeStage). */
export default {
  notFound: 'レシピが見つかりません',
  voiceState: {
    off: '音声オフ',
    starting: '起動中…',
    listening: '聞き取り中',
    paused: '一時停止中',
    denied: 'マイク無効',
    unavailable: '音声なし',
  },
  top: {
    close: '調理モードを閉じる',
    stepOf: 'ステップ{current}/{total}',
    voiceControl: '音声操作：{state}。タップで切り替え、長押しでコマンド一覧。',
    ingredients: '材料',
  },
  heard: '「{text}」',
  video: {
    allDone: 'すべてのステップが完了',
    noClip: 'このステップにはクリップがありません。下の説明を見て進めてください',
    looping: '▶ {start}〜{end}をくり返し再生中',
    aiNarration: 'AIナレーション',
    embedBlocked: '投稿者が他のアプリでの再生をオフにしています。',
    unavailable: 'この動画は現在再生できません。',
    playerTitle: 'レシピ動画',
  },
  done: {
    title: '完成です！',
    subtitle: '{title}ができあがりました。仕上がりはいかがですか？',
    stars: plural({ other: '星{count}つ' }),
    finish: '料理を終える',
    toast: 'お疲れさまでした！ 🎉',
  },
  timer: {
    started: 'タイマー開始 · {time}',
    doneToast: '⏰ タイマー終了：{label}',
    noTimer: 'このステップにはタイマーがありません',
    timesUp: '時間です！',
    pause: 'タイマーを一時停止',
    resume: 'タイマーを再開',
    cancel: 'タイマーを取り消す',
  },
  controls: {
    previous: '前のステップ',
    replay: 'このステップをもう一度再生',
    play: '再生',
    pause: '一時停止',
    mute: '動画をミュート',
    unmute: 'ミュートを解除',
    readAloud: 'ステップを読み上げる',
    stopReading: '読み上げを止める',
    next: '次のステップ',
  },
  ingredients: {
    title: '材料',
    forServings: plural({ other: '{count}人分' }),
    readAloud: '読み上げてもらう',
  },
  narration: {
    preparing: 'シェフの声を準備中…',
  },
  help: {
    title: '音声コマンド',
    subtitle: 'ふだんどおりに話しかけてください。短い言葉がいちばん伝わります',
    micBlocked: 'マイクへのアクセスがオフになっています。音声操作を使うには「設定」でオンにしてください。',
  },
  step: {
    startTimerLabel: plural({ other: '{count}分のタイマーを開始' }),
    startTimer: '{time}のタイマーを開始',
    timeLeft: '残り{time}',
    timerDone: 'タイマー終了',
    whatDoesTermMean: '「{term}」とは？',
    glossaryTerm: '{term}：',
    doneWhen: '目安',
  },
} as const;
