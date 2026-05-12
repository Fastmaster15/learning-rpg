# Field / Battle Visual Reference & Modern 2D Hero Asset Task

## 目的

Learning RPG の次フェーズで、フィールド画面・戦闘画面・主人公ビジュアルの方向性を明確にする。

現在のプロトタイプは、町 → フィールド → 戦闘 → 成長 → 装備更新 → 宝箱 → 小ボスというRPGのコアループは成立している。次は、見た瞬間に「RPGとして気持ちよく遊べそう」と感じる画面密度を作り、現代版主人公のオリジナル2Dアセットを接続できる状態にする。

このタスクは単なる見た目変更ではなく、今後の「日本史第1章」「学習攻撃」「クイズUI」「章追加」に耐えるためのUI/UX基盤整備とする。

---

## 現在地

### 既にあるもの

- タイトル画面
- 町画面
- NPC会話
- 宿屋
- 店・装備購入
- フィールド移動
- ランダムエンカウント
- コマンド戦闘
- HP / MP / EXP / GOLD
- レベルアップ
- 薬草
- 宝箱
- 小ボス
- localStorageによる簡易セーブ
- WebAudio APIによる簡易効果音

### まだ弱いもの

- フィールドが「冒険している世界」としてまだ薄い
- 戦闘画面が「クラシックなコマンドRPGらしい緊張感」まで届いていない
- 主人公がテキスト表示中心で、キャラクターとして認識しづらい
- 画像アセット未配置時のフォールバック方針が弱い
- 学習攻撃やクイズウィンドウを入れるためのUI余白がまだ明確でない
- 今後データ駆動化する前提の画面コンポーネント分離が不十分

---

## 重要方針

- 既存有名RPGの画像、UI、音楽、フォント、ロゴ、固有名詞、キャラクターを直接コピーしない。
- 参照するのは、あくまでクラシックJRPGの体験構造・画面構成・情報設計のみ。
- 目指すのは「独自のレトロコマンドRPG風」かつ「学習RPGとして自然に機能する画面」。
- 画面のノスタルジーは活かすが、権利物の模倣にならないようにする。
- スマホブラウザでのプレイ感を優先する。
- 画像がない状態でもゲームが壊れないよう、必ずフォールバックを用意する。
- 派手なアニメーションより、読みやすさ・押しやすさ・状態変化の分かりやすさを優先する。

---

## 参考にしたい体験要素

ユーザー提供の参考画像では、以下のような方向性を重視する。

### フィールド画面

- トップダウンの2Dフィールド。
- 草原、森、山、川、海、道、城・町などがタイル状に配置されている。
- プレイヤーキャラクターが小さなドット絵で表示され、世界を旅している感覚がある。
- マップ上の地形差によって「進める場所」「危険そうな場所」「目的地」が直感的に分かる。
- 画面全体が冒険の舞台として成立しており、UIよりもフィールドの没入感を優先する。
- 実装では既存作品のマップ画像やタイルを使わず、独自CSSまたは独自生成素材で作る。

### 戦闘画面

- 黒背景または暗めの背景に、白枠の情報ウィンドウを配置するクラシックな見せ方。
- 敵は画面中央または上部に表示。
- プレイヤー側のHP/MP/レベル/ゴールド等を読みやすく表示。
- コマンドは「たたかう」「じゅもん」「どうぐ」「にげる」などを押しやすくする。
- 戦闘ログは短く、結果がすぐ分かる文体にする。
- スマホでもコマンドが押しやすいよう、ボタンサイズと余白を確保する。
- 将来の「学び攻撃」「クイズ選択肢」「正解/不正解演出」を差し込めるウィンドウ構造にする。

---

## 目指すプレイ感

### フィールドで感じたいこと

- 町の外に出た瞬間、冒険が始まった感じがする
- 町の周りは安全そうに見える
- 森や山の近くは少し危険そうに見える
- 宝箱や目的地を見つける楽しさがある
- 小さなマップでも、世界を旅している感覚がある
- 主人公が「自分の分身」として見える

### 戦闘で感じたいこと

- 敵が出た瞬間に、画面の緊張感が切り替わる
- HPの減少が分かりやすい
- コマンド選択が迷わない
- 1ターンごとの結果がログで気持ちよく分かる
- 勝利・レベルアップ・ボス撃破の区切りが気持ちいい
- 学習要素が入っても、クイズアプリではなくRPGとして成立している

---

## スコープ

### P0: 必ずやる

1. フィールド画面の視認性改善
2. 戦闘画面のクラシックコマンドRPG風レイアウト改善
3. 主人公アセット配置ルールとフォールバック実装
4. Image2向け主人公生成プロンプトの明文化
5. スマホ幅での操作性担保
6. 既存ゲームループを壊さないこと

### P1: 可能ならやる

1. フィールド用主人公スプライトの仮差し替え
2. 戦闘用主人公ポートレートの仮差し替え
3. 勝利・レベルアップ・ボス撃破時の簡易演出強化
4. クイズウィンドウ用のプレースホルダーUI追加
5. 戦闘コマンドに「まなぶ」または「学び攻撃」の仮ボタンを置ける構造化

### P2: 後続タスクに回してよい

1. 実際の学習クイズロジック
2. 敵画像の本格生成
3. 4方向歩行アニメーション
4. マップの章別データ駆動化
5. 音楽・BGM
6. セーブデータの本格マイグレーション

---

## 実装タスク詳細

### 1. フィールド画面の改善

#### 1.1 タイル表現

現在の5x5マップをベースに、タイル表現をよりRPGらしくする。

対象タイル：

- `town`: 町・拠点
- `road`: 道
- `grass`: 草原
- `forest`: 森
- `hill`: 丘・山地
- `water`: 水辺・海
- `shore`: 海岸
- `chest`: 宝箱
- `boss`: 小ボス地点

改善方針：

- タイルごとの色差を強める
- CSS gradient / box-shadow / pseudo element を使って、簡易ドット絵風の質感を出す
- 森は密度が高く見えるようにする
- 山・丘は三角形や影で高低差を表現する
- 水辺は少し波のパターンを出す
- 道はプレイヤーが進む導線として認識できるようにする
- 宝箱とボス地点は一目で特別な場所と分かるようにする

#### 1.2 主人公表示

現在の「勇」テキスト表示を、以下の順で改善する。

1. 画像が存在する場合は `hero-sprite-overworld.png` を表示する
2. 画像が存在しない場合は、CSS製の仮アイコンを表示する
3. それも難しい場合のみ「勇」テキストにフォールバックする

要件：

- プレイヤー位置が一目で分かる
- タイルの上で埋もれない
- スマホでも視認できる
- 画像サイズはタイルに対して大きすぎない
- 将来4方向スプライトに差し替えられる構造にする

#### 1.3 マップサイズ

- P0では既存の5x5を維持する
- ただし、コンポーネントは将来7x7や9x9に拡張できるようにする
- `fieldMap` の配列サイズに依存しすぎない描画にする
- CSS Grid は `gridTemplateColumns: repeat(width, minmax(0, 1fr))` のように動的化できると望ましい

#### 1.4 フィールドUI

- フィールド本体を主役にする
- 移動ボタンは押しやすく、画面下部または右側にまとめる
- 「町へ戻る」「敵を探す」「ステータス」を明確に分ける
- GOAL表示とログ表示は、フィールドの没入感を邪魔しない配置にする

---

### 2. 戦闘画面の改善

#### 2.1 レイアウト

黒背景＋白枠ウィンドウを基調にしたクラシックな戦闘画面へ寄せる。

基本構成：

```txt
+--------------------------------+
| ENEMY AREA                     |
|        enemy sprite/name        |
|        enemy HP                 |
+--------------------------------+
| STATUS WINDOW                  |
| Lv / HP / MP / Gold / Equip     |
+--------------------------------+
| COMMAND WINDOW                 |
| たたかう / じゅもん / どうぐ / にげる |
+--------------------------------+
| LOG WINDOW                     |
| 敵に5のダメージ！              |
+--------------------------------+
```

スマホでは縦積み、PCでは敵エリア＋サイド情報でもよい。

#### 2.2 敵表示

- P0では敵画像がなくてもよい
- 既存の敵名表示をより強く見せる
- 敵HPバーまたはHP数値を表示する
- 小ボスの場合は背景・枠・ログで通常敵との差を出す
- 将来 `enemy-sprite` を差し込める余白を作る

#### 2.3 コマンドUI

既存コマンド：

- たたかう
- 火の玉
- 小回復
- 薬草
- にげる

整理案：

```txt
たたかう | じゅもん
どうぐ   | にげる
```

`じゅもん` を押した後に `火の玉 / 小回復` を選ぶサブメニューにするか、P0では現状の直接ボタンでもよい。重要なのは、将来「学び攻撃」を追加できるように、コマンド処理を読みやすくしておくこと。

タッチ要件：

- 主要ボタンは高さ44px以上
- 文字サイズはスマホで読めるサイズ
- 連打で状態が壊れないようにする
- 勝利・敗北直後は無効化または画面遷移を明確にする

#### 2.4 ログ文体

ログは短く、1行で結果が分かるようにする。

良い例：

- Heroのこうげき！
- ぷるぷるに5のダメージ！
- よるこうもりのこうげき！
- Heroは3のダメージをうけた！
- 森のぬしをたおした！
- レベルが2に上がった！

避ける例：

- 長すぎる説明文
- 学習内容を戦闘ログに詰め込みすぎる
- 何が起きたか分からない抽象表現

#### 2.5 学習攻撃のための余白

このタスクでは本格実装しなくてよいが、以下を想定してUIを作る。

```txt
+--------------------------------+
| LEARNING WINDOW                |
| Q. 弥生時代に広がったものは？   |
| [稲作] [仏教] [刀狩] [文明開化] |
+--------------------------------+
```

- 戦闘中にクイズウィンドウを挿入できる
- 正解/不正解の結果をログに流せる
- 正解時に追加ダメージを出せる
- 不正解時に小ダメージまたは行動失敗にできる

---

### 3. UIコンポーネント分離

現状 `LearningRpgClient.tsx` にゲームロジックとUIが多く集まっているため、今回の見た目改善に合わせて、無理のない範囲で分離する。

P0で分離したい候補：

```txt
src/components/product-lab/learning-rpg/
  FieldMap.tsx
  FieldTile.tsx
  BattleScreen.tsx
  BattleCommandWindow.tsx
  BattleStatusWindow.tsx
  BattleLogWindow.tsx
  HeroSprite.tsx
  HeroPortrait.tsx
```

難しければ、まずは `LearningRpgClient.tsx` 内で関数コンポーネントを整理するだけでもよい。ただし、将来の章追加・画像差し替え・クイズUI追加に耐える名前付けにする。

---

### 4. 現代版主人公2Dイラスト / スプライト生成

Image2 などの画像生成ツールで、Learning RPG 用のオリジナル主人公2Dアセットを作成する。

#### キャラクター方針

- 現代版の主人公。
- 学習RPGに合う、知的・冒険者・若手社会人の中間くらいの印象。
- 剣と魔法の古典ファンタジーに寄せすぎず、現代の服装に少しだけ冒険感を加える。
- ノート、タブレット、ペン、軽いバックパックなど、学びを連想する小物があるとよい。
- 表情は前向きで、成長していく主人公感を出す。
- 既存ゲームキャラに似せない。
- 学習・仕事・冒険が自然に混ざった「現代の旅人」にする。

#### デザインキーワード

- modern learner
- smart casual
- light jacket
- small backpack
- notebook
- tablet
- optimistic
- focused
- readable silhouette
- original character
- mobile RPG asset

#### 避けるもの

- 既存ゲームキャラに似た髪型・服装・色構成
- 有名RPG風の鎧・兜・剣・盾への寄せすぎ
- ロゴや文字入りの服
- 実在ブランド風のアイコン
- 写実寄りすぎる絵柄
- 小さくした時に読めない複雑な装飾

---

## 生成したい素材

### P0素材

```txt
public/assets/learning-rpg/hero/
  hero-fullbody.png
  hero-sprite-overworld.png
  hero-battle-portrait.png
  README.md
```

### P1素材

```txt
public/assets/learning-rpg/hero/
  hero-expression-normal.png
  hero-expression-focus.png
  hero-expression-victory.png
  hero-sprite-overworld-sheet.png
```

### 推奨サイズ

- `hero-fullbody.png`: 1024x1024 または 768x1024、透過背景
- `hero-battle-portrait.png`: 512x512、透過背景
- `hero-sprite-overworld.png`: 64x64 または 128x128、透過背景
- `hero-sprite-overworld-sheet.png`: 4方向または待機モーション対応、透過背景

### READMEに記録すること

`public/assets/learning-rpg/hero/README.md` に以下を記録する。

- 生成日
- 使用プロンプト
- 採用理由
- 差し替え候補
- 使用用途
- 注意事項：既存作品を直接模倣しないこと

---

## Image2向けプロンプト案

### 立ち絵

```txt
Original 2D game protagonist for a modern learning RPG, Japanese mobile browser game, young adult learner-adventurer, smart casual outfit with a light jacket, small backpack, notebook and tablet, optimistic expression, clean anime-inspired 2D illustration, simple readable silhouette, full body, transparent background, suitable for small RPG sprite adaptation, original character design, no existing game character, no logos, no text
```

### フィールド用ミニキャラ / ドット絵

```txt
Original modern learning RPG hero, small 2D pixel art sprite, top-down RPG overworld character, smart casual outfit, light jacket, backpack, notebook accessory, readable at small size, 32x32 sprite style, four-direction walking poses, original design, transparent background, no existing game character, no logos, no text
```

### 戦闘用バストアップ

```txt
Original modern learning RPG hero battle portrait, 2D anime-inspired game art, young adult learner-adventurer, smart casual jacket, confident and focused expression, notebook or tablet as learning item, clean line art, simple color blocks, transparent background, mobile RPG UI asset, original character design, no existing game character, no logos, no text
```

### 表情差分：通常

```txt
Original modern learning RPG hero portrait, normal calm expression, young adult learner-adventurer, smart casual jacket, notebook and tablet motif, clean 2D anime-inspired game art, transparent background, original character, no logos, no text
```

### 表情差分：集中

```txt
Original modern learning RPG hero portrait, focused thinking expression, young adult learner-adventurer, smart casual jacket, notebook and tablet motif, clean 2D anime-inspired game art, transparent background, original character, no logos, no text
```

### 表情差分：勝利

```txt
Original modern learning RPG hero portrait, victory smile, confident and optimistic, young adult learner-adventurer, smart casual jacket, notebook and tablet motif, clean 2D anime-inspired game art, transparent background, original character, no logos, no text
```

---

## アセット接続仕様

### 画像パス定数

画像パスはコンポーネント内に直接散らさず、定数化する。

例：

```ts
export const learningRpgAssets = {
  hero: {
    fullbody: "/assets/learning-rpg/hero/hero-fullbody.png",
    overworldSprite: "/assets/learning-rpg/hero/hero-sprite-overworld.png",
    battlePortrait: "/assets/learning-rpg/hero/hero-battle-portrait.png"
  }
};
```

配置候補：

```txt
src/lib/learning-rpg-assets.ts
```

### フォールバック

- 画像が読み込めない場合はCSS製の仮主人公アイコンを表示する
- 画像の読み込み失敗で画面全体が壊れないようにする
- Next.jsのImageを使う場合も、ローカルpublic配下のパスで扱う

### フィールド接続

- `HeroSprite` コンポーネントを作る
- フィールド上のプレイヤー表示で使用する
- 画像がない場合はCSSアイコンまたは「勇」へフォールバックする

### 戦闘接続

- `HeroPortrait` コンポーネントを作る
- プレイヤーステータス横、または戦闘画面下部に表示する
- スマホでは邪魔にならないサイズに抑える

---

## 実装時の注意

### 既存機能を壊さない

以下は必ず維持する。

- はじめる
- つづきから
- 町画面への遷移
- フィールド移動
- ランダムエンカウント
- 通常攻撃
- 火の玉
- 小回復
- 薬草
- にげる
- 勝利報酬
- レベルアップ
- 敗北時の町戻り
- 宝箱取得
- 小ボス撃破
- localStorage保存

### やりすぎない

今回の主目的は画面体験とアセット接続基盤。以下は後続でよい。

- 敵画像を大量に作る
- 完全な歩行アニメーション
- 大規模なマップエディタ
- 複数章対応
- クイズデータの完全実装
- BGM作曲

---

## 受け入れ条件

### 機能面

- 新規プレイで、町 → フィールド → 戦闘 → 勝利 → 成長 → 町帰還 → 小ボスまでの既存ループが壊れていない
- フィールド上で主人公位置が以前より分かりやすい
- 戦闘画面で敵、プレイヤーステータス、コマンド、ログが分かりやすい
- 画像未配置でもフォールバック表示で動作する
- 画像配置後は主人公スプライト・ポートレートを表示できる

### UX面

- スマホ幅390px前後で操作しやすい
- 主要ボタンのタップ領域が十分にある
- HP/MP/Gold/ログが読みやすい
- フィールドと戦闘で画面の雰囲気が切り替わる
- ボス戦が通常戦闘より少し特別に見える

### 実装面

- `npm run build` が通る
- TypeScriptエラーがない
- 既存のデータ構造を破壊しない
- 画像パスが定数化されている
- 著作物の直接コピーになりうる素材・名称・UI画像を含まない

---

## Codexへの作業指示

1. まず現在の `LearningRpgClient.tsx` と関連ファイルを確認する。
2. 既存ゲームループを壊さず、画面改善を小さな差分で進める。
3. 可能ならフィールド・戦闘・主人公表示をコンポーネント分離する。
4. 画像が存在しない状態でも動くフォールバックを先に作る。
5. `public/assets/learning-rpg/hero/README.md` を追加し、Image2用プロンプトと配置ルールを記録する。
6. 実画像の生成は別工程でもよい。今回の実装では、画像未配置でも壊れないことを優先する。
7. 最後にREADMEまたはこのタスクファイルへ、実装したこと・未実装のことを追記する。

---

## 完了後に確認する観点

- フィールドを見た瞬間、探索したくなるか
- 戦闘画面を見た瞬間、コマンドRPGだと分かるか
- 主人公がただの文字ではなくキャラクターとして見えるか
- スマホで押しづらいボタンがないか
- 学習攻撃を追加する余白があるか
- 著作権的に危ない直コピー表現が入っていないか
- 次に日本史第1章のクイズ実装へ進みやすいか

---

## 次の後続タスク候補

このタスク完了後、以下を別タスクとして進める。

1. Japanese History RPG 第1章の学習クイズ実装
2. 「学び攻撃」コマンドの本実装
3. 敵・NPC・宝箱・クエストの章データ分離
4. 敵スプライト生成
5. ボス戦専用演出
6. クリア後の学習サマリー表示
7. セーブデータのバージョン管理
