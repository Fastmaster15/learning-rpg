# Learning RPG Field / Battle Visual Refinement & Modern Hero Asset Task

## 0. このタスクの位置づけ

Learning RPG は、すでに「町 → フィールド → 戦闘 → 成長 → 装備更新 → 宝箱 → 小ボス」という最小RPGループを持っている。

このタスクでは、既存ループを壊さずに、以下の3点を精緻化する。

1. フィールド画面を、探索したくなるクラシック2D RPG風にする。
2. 戦闘画面を、コマンドRPGとして直感的に分かる画面構造にする。
3. 現代版主人公2Dアセットを将来差し替えられる接続口を作る。

今回の目的は「豪華にすること」ではない。
将来の日本史第1章、学習攻撃、クイズUI、章追加に耐える **UI/UX基盤** を作ることを主目的とする。

---

## 1. 実装前の前提確認

### 1.1 現在の実装で維持すべきコアループ

以下の体験は必ず維持する。

```txt
タイトル画面
  ↓
町でNPC・宿屋・店を使う
  ↓
フィールドへ出る
  ↓
移動する
  ↓
敵と遭遇する
  ↓
コマンド戦闘を行う
  ↓
EXP / GOLD を得る
  ↓
レベルアップまたは装備更新で強くなる
  ↓
宝箱を見つける
  ↓
小ボスに挑む
  ↓
撃破して一区切りを得る
```

この流れを壊す変更は今回のスコープ外。

### 1.2 既存機能で壊してはいけないもの

- はじめる
- つづきから
- localStorage セーブ
- 町画面への遷移
- NPC会話
- 宿屋回復
- 装備購入
- フィールド移動
- 町への帰還
- 宝箱取得
- 通常敵エンカウント
- 小ボスエンカウント
- たたかう
- 火の玉
- 小回復
- 薬草
- にげる
- 勝利報酬
- レベルアップ
- 敗北時の町戻り
- WebAudio API の簡易効果音

---

## 2. 重要方針

### 2.1 デザイン方針

- 参照するのは、クラシックJRPGの画面構造・情報設計・プレイフィールのみ。
- 既存有名RPGの画像、UI、音楽、フォント、ロゴ、固有名詞、キャラクター、敵デザインは直接コピーしない。
- 「ドラクエ風」ではなく、「独自のレトロコマンドRPG風」として実装する。
- 学習RPGであることを忘れず、将来クイズや学習カードが自然に入る余白を残す。
- スマホブラウザでの操作感を優先する。
- 画像がなくても遊べる状態を必ず維持する。

### 2.2 実装方針

- 大規模リライトではなく、既存の `LearningRpgClient.tsx` を尊重しながら段階的に分離する。
- 見た目の改善と同時に、将来差し替えやすい構造に寄せる。
- 画像アセットはまだ未生成でもよい。
- まずは画像未配置でも壊れないフォールバックを作る。
- CSSだけでできる改善を優先する。
- `npm run build` が通ることを完了条件にする。

---

## 3. 参考にする体験要素

ユーザー提供の参考画像から、以下の体験構造だけを抽出する。

### 3.1 フィールド画面で参考にしたいこと

- トップダウンの2Dマップ。
- 草原、森、山、川、海、道、町などがタイルで分かれている。
- プレイヤーが小さなキャラとして表示され、世界を旅している感覚がある。
- 道や地形によって、進む方向が自然に分かる。
- 森や山など、危険そうな場所が視覚的に分かる。
- 宝箱や目的地が、小さくても特別な場所として見える。

### 3.2 戦闘画面で参考にしたいこと

- 暗い背景。
- 白枠または明るい枠の情報ウィンドウ。
- 敵エリア、ステータス、コマンド、ログが明確に分かれている。
- 文字情報が主役で、短いログでテンポよく進む。
- スマホでもコマンドが押しやすい。
- 戦闘中に画面の緊張感が切り替わる。

### 3.3 直接やってはいけないこと

- 参考画像そのものを使う。
- 既存ゲームのタイル、敵、主人公、UI枠を真似て作る。
- 既存ゲーム名、モンスター名、呪文名、街名などを流用する。
- 既存ゲームのBGM、効果音、メロディ、ジングルを使う。
- 既存ゲーム固有のフォント・ロゴ風に寄せすぎる。

---

## 4. 優先順位

### P0: 必ず実装する

1. フィールド画面の視認性改善。
2. 戦闘画面のコマンドRPG風レイアウト改善。
3. 主人公表示のフォールバック実装。
4. 画像パスの定数化。
5. `public/assets/learning-rpg/hero/README.md` の追加。
6. Image2向けプロンプトのREADME記録。
7. スマホ幅での操作性担保。
8. `npm run build` の成功。

### P1: 可能なら実装する

1. `FieldMap` / `FieldTile` / `HeroSprite` のコンポーネント分離。
2. `BattleScreen` / `BattleCommandWindow` / `BattleLogWindow` のコンポーネント分離。
3. クイズウィンドウのプレースホルダー追加。
4. ボス戦の見た目差別化。
5. 勝利・レベルアップ・ボス撃破ログの演出強化。

### P2: 後続タスクに回す

1. 本物の画像生成。
2. 敵スプライト生成。
3. 4方向歩行アニメーション。
4. 学習クイズロジック。
5. 学び攻撃の本実装。
6. 章別マップデータ化。
7. BGM。
8. セーブデータの本格マイグレーション。

---

## 5. 想定ファイル変更

### 5.1 変更候補

```txt
src/components/product-lab/LearningRpgClient.tsx
src/lib/learning-rpg-assets.ts
public/assets/learning-rpg/hero/README.md
```

### 5.2 分離できるなら作るファイル

```txt
src/components/product-lab/learning-rpg/FieldMap.tsx
src/components/product-lab/learning-rpg/FieldTile.tsx
src/components/product-lab/learning-rpg/HeroSprite.tsx
src/components/product-lab/learning-rpg/HeroPortrait.tsx
src/components/product-lab/learning-rpg/BattleCommandWindow.tsx
src/components/product-lab/learning-rpg/BattleLogWindow.tsx
src/components/product-lab/learning-rpg/BattleStatusWindow.tsx
```

### 5.3 今回は作らなくてよいファイル

```txt
src/data/learning-rpg/japanese-history/chapter-1.json
src/data/learning-rpg/japanese-history/quizzes.json
src/data/learning-rpg/japanese-history/enemies.json
```

上記は後続の日本史第1章タスクで扱う。

---

## 6. フィールド画面の詳細仕様

### 6.1 目標

フィールド画面を見た瞬間に、以下が伝わる状態にする。

- ここは町の外である。
- プレイヤーがマップ上にいる。
- 進める場所と進めない場所が分かる。
- 森やボス地点が少し危険そうに見える。
- 宝箱を探したくなる。

### 6.2 既存5x5マップは維持する

P0ではマップサイズを広げない。

理由：

- 既存のゲームバランスを壊さないため。
- まずは画面密度と視認性を改善するため。
- データ駆動化は後続タスクに回すため。

### 6.3 タイル別の表現方針

| タイル | 表現方針 | プレイヤーに伝えたいこと |
|---|---|---|
| `town` | 屋根・入口・安全色 | 拠点、戻れる場所 |
| `road` | 土色・連続感 | 進行ルート |
| `grass` | 明るい緑・軽い粒感 | 比較的安全な草原 |
| `forest` | 濃い緑・密度 | 少し危険、奥に進む感覚 |
| `hill` | 影・三角形・高低差 | 地形の壁、山地感 |
| `water` | 青系・波模様 | 通れない場所 |
| `shore` | 砂色・水辺の境界 | 海岸、端の地形 |
| `chest` | 小さな宝箱アイコン風 | 報酬がある場所 |
| `boss` | 暗め・強調枠・気配 | 小ボス地点、危険 |

### 6.4 CSS実装の方向

CSSだけで簡易ドット絵感を出す。

候補：

- `linear-gradient`
- `radial-gradient`
- `box-shadow`
- `inset shadow`
- `border`
- `::before` / `::after`
- 小さな疑似パターン

注意：

- 複雑にしすぎない。
- スマホで潰れない。
- 文字や主人公表示を邪魔しない。
- Tailwindだけで難しければ、局所的なCSS classを使ってもよい。

### 6.5 主人公表示

現在の「勇」表示は、以下の順で置き換える。

1. `hero-sprite-overworld.png` があれば画像表示。
2. 画像がない場合はCSS製の仮主人公アイコン。
3. それも難しい場合は「勇」。

要件：

- タイル中央に表示する。
- 背景に埋もれないよう縁取りまたは影を付ける。
- タップ対象ではなく、位置表示として扱う。
- 将来4方向スプライトに差し替えられる名前にする。

推奨コンポーネント名：

```txt
HeroSprite
```

### 6.6 フィールド操作UI

- 移動ボタンは上下左右が直感的に分かる配置にする。
- 各ボタンはスマホで押しやすいサイズにする。
- 「敵を探す」「町へ戻る」「ステータス」は移動ボタンと混ざりすぎないようにする。
- GOALとログは重要だが、マップの主役感を奪わない。

---

## 7. 戦闘画面の詳細仕様

### 7.1 目標

戦闘画面を見た瞬間に、以下が伝わる状態にする。

- 戦闘に入った。
- 敵が誰か分かる。
- 敵の残りHPが分かる。
- 自分のHP/MPが分かる。
- 押せるコマンドが分かる。
- 直前の行動結果がログで分かる。

### 7.2 基本レイアウト

スマホ優先で、縦積みを基本とする。

```txt
+--------------------------------+
| ENEMY WINDOW                   |
| 敵名 / 敵HP / 敵の表示          |
+--------------------------------+
| PLAYER WINDOW                  |
| Lv / HP / MP / Gold / 装備      |
+--------------------------------+
| COMMAND WINDOW                 |
| たたかう / じゅもん             |
| どうぐ   / にげる               |
+--------------------------------+
| LOG WINDOW                     |
| 直近ログ                       |
+--------------------------------+
```

PC幅では横並びにしてもよいが、P0ではスマホの縦積みを優先する。

### 7.3 敵表示

P0では敵画像は不要。

ただし、将来差し込める場所を作る。

表示したいもの：

- 敵名
- 敵HP / maxHP
- 敵HPバー
- 通常敵 / 小ボスの差

小ボス差別化案：

- 枠線を少し強くする
- 背景を暗くする
- 「森の奥に重い気配が満ちた」などのログを活かす
- `role === "mini_boss"` で見た目を切り替える

### 7.4 コマンドUI

P0では現行機能を壊さないことを優先する。

既存行動：

- `attackEnemy`: 通常攻撃
- `castSpell("fire")`: 火の玉
- `castSpell("heal")`: 小回復
- `useHerb`: 薬草
- `fleeBattle`: にげる

表示案：

```txt
たたかう
火の玉
小回復
薬草
にげる
```

または、余力があれば以下に整理する。

```txt
たたかう | じゅもん
どうぐ   | にげる
```

ただし、サブメニュー化でバグが出るなら今回は直接ボタンのままでよい。

### 7.5 タッチ要件

- ボタン高さは最低44px以上。
- コマンド間の余白を確保する。
- HPが低い時でもログやボタンが見切れない。
- 連打で状態が壊れないようにする。
- 勝利後・敗北後は、ボタンの扱いを明確にする。

### 7.6 ログ文体

ログは短く、読みやすくする。

良い例：

- Heroのこうげき！
- ぷるぷるに5のダメージ！
- よるこうもりのこうげき！
- Heroは3のダメージをうけた！
- 森のぬしをたおした！
- レベルが2に上がった！

避ける例：

- 長すぎる説明。
- 学習内容を詰め込みすぎるログ。
- 結果が分からない抽象表現。

---

## 8. 学習攻撃・クイズUIへの接続余地

今回、学習攻撃の本実装はしない。
ただし、戦闘画面に将来入れられる余白を作る。

想定UI：

```txt
+--------------------------------+
| LEARNING WINDOW                |
| Q. 弥生時代に広がったものは？   |
| [稲作] [仏教] [刀狩] [文明開化] |
+--------------------------------+
```

将来の接続に必要なこと：

- 戦闘画面内に追加ウィンドウを入れられる構造。
- コマンド選択後、一時的にクイズ選択肢を表示できる構造。
- 正解 / 不正解をログに流せる構造。
- 正解時に追加ダメージを出せる構造。
- 不正解時に小ダメージまたは行動失敗にできる構造。

P1で可能なら、`LearningWindowPlaceholder` のようなコンポーネント名だけ用意してもよい。

---

## 9. 現代版主人公2Dアセット仕様

### 9.1 キャラクターコンセプト

Learning RPG の主人公は、古典ファンタジーの勇者ではなく、現代の学び手・冒険者として設計する。

方向性：

- 現代版主人公。
- 学習RPGに合う、知的・冒険者・若手社会人の中間くらい。
- 剣と魔法に寄せすぎない。
- 現代服に少しだけ冒険感を加える。
- ノート、タブレット、ペン、軽いバックパックなど学びを連想する小物を持つ。
- 表情は前向き。
- 成長していく主人公感がある。
- 既存ゲームキャラに似せない。

### 9.2 デザインキーワード

```txt
modern learner
smart casual
light jacket
small backpack
notebook
tablet
optimistic
focused
readable silhouette
original character
mobile RPG asset
```

### 9.3 避けるもの

- 既存ゲームキャラに似た髪型・服装・色構成。
- 有名RPG風の鎧・兜・剣・盾への寄せすぎ。
- ロゴや文字入りの服。
- 実在ブランド風のアイコン。
- 写実寄りすぎる絵柄。
- 小さくした時に読めない複雑な装飾。

---

## 10. アセット配置仕様

### 10.1 P0で作るディレクトリ

```txt
public/assets/learning-rpg/hero/
```

### 10.2 P0で置くREADME

```txt
public/assets/learning-rpg/hero/README.md
```

READMEには以下を書く。

- このディレクトリの目的。
- まだ実画像がない場合はフォールバックで動かすこと。
- Image2向けプロンプト。
- 採用時の注意。
- 既存作品を直接模倣しないこと。

### 10.3 将来置く画像

```txt
public/assets/learning-rpg/hero/
  hero-fullbody.png
  hero-sprite-overworld.png
  hero-battle-portrait.png
  hero-expression-normal.png
  hero-expression-focus.png
  hero-expression-victory.png
  hero-sprite-overworld-sheet.png
```

### 10.4 推奨サイズ

| ファイル | 推奨サイズ | 用途 |
|---|---:|---|
| `hero-fullbody.png` | 768x1024 or 1024x1024 | 立ち絵 |
| `hero-battle-portrait.png` | 512x512 | 戦闘画面 |
| `hero-sprite-overworld.png` | 64x64 or 128x128 | フィールド表示 |
| `hero-sprite-overworld-sheet.png` | 任意 | 4方向歩行用 |

---

## 11. 画像パス定数

画像パスはコンポーネント内に直接散らさない。

作成候補：

```txt
src/lib/learning-rpg-assets.ts
```

実装例：

```ts
export const learningRpgAssets = {
  hero: {
    fullbody: "/assets/learning-rpg/hero/hero-fullbody.png",
    overworldSprite: "/assets/learning-rpg/hero/hero-sprite-overworld.png",
    battlePortrait: "/assets/learning-rpg/hero/hero-battle-portrait.png"
  }
} as const;
```

### 11.1 フォールバック方針

画像が未配置でも壊れないこと。

実装方法の候補：

- 通常の `img` タグで `onError` を使い、失敗時にCSSアイコンへ切り替える。
- Next.js `Image` を使う場合も、読み込み失敗時の代替表示を用意する。
- 最初から `HeroSprite` 内で `imageLoaded` / `imageFailed` state を持つ。

フォールバック順：

```txt
画像表示
  ↓ 失敗
CSS製アイコン
  ↓ 失敗
「勇」テキスト
```

---

## 12. Image2向けプロンプト

### 12.1 立ち絵

```txt
Original 2D game protagonist for a modern learning RPG, Japanese mobile browser game, young adult learner-adventurer, smart casual outfit with a light jacket, small backpack, notebook and tablet, optimistic expression, clean anime-inspired 2D illustration, simple readable silhouette, full body, transparent background, suitable for small RPG sprite adaptation, original character design, no existing game character, no logos, no text
```

### 12.2 フィールド用ミニキャラ / ドット絵

```txt
Original modern learning RPG hero, small 2D pixel art sprite, top-down RPG overworld character, smart casual outfit, light jacket, backpack, notebook accessory, readable at small size, 32x32 sprite style, four-direction walking poses, original design, transparent background, no existing game character, no logos, no text
```

### 12.3 戦闘用バストアップ

```txt
Original modern learning RPG hero battle portrait, 2D anime-inspired game art, young adult learner-adventurer, smart casual jacket, confident and focused expression, notebook or tablet as learning item, clean line art, simple color blocks, transparent background, mobile RPG UI asset, original character design, no existing game character, no logos, no text
```

### 12.4 表情差分：通常

```txt
Original modern learning RPG hero portrait, normal calm expression, young adult learner-adventurer, smart casual jacket, notebook and tablet motif, clean 2D anime-inspired game art, transparent background, original character, no logos, no text
```

### 12.5 表情差分：集中

```txt
Original modern learning RPG hero portrait, focused thinking expression, young adult learner-adventurer, smart casual jacket, notebook and tablet motif, clean 2D anime-inspired game art, transparent background, original character, no logos, no text
```

### 12.6 表情差分：勝利

```txt
Original modern learning RPG hero portrait, victory smile, confident and optimistic, young adult learner-adventurer, smart casual jacket, notebook and tablet motif, clean 2D anime-inspired game art, transparent background, original character, no logos, no text
```

---

## 13. 推奨実装順

Codexは以下の順で作業する。

### Step 1: 現状把握

- `src/components/product-lab/LearningRpgClient.tsx` を読む。
- 現在の `FieldScreen` / `BattleScreen` / `tileClass` / `StatusBar` / `MessageWindow` の関係を見る。
- 既存の状態管理を壊さない方針を立てる。

### Step 2: アセット定数とREADMEを追加

- `src/lib/learning-rpg-assets.ts` を作る。
- `public/assets/learning-rpg/hero/README.md` を作る。
- 実画像はまだ置かなくてよい。

### Step 3: HeroSprite / HeroPortrait の導入

- 画像未配置でも動くフォールバックを実装する。
- フィールド上の「勇」表示を `HeroSprite` に置き換える。
- 戦闘画面に `HeroPortrait` を置ける場合は置く。

### Step 4: フィールド視認性改善

- タイルの見た目を改善する。
- 主人公位置を見やすくする。
- 宝箱・ボス地点を分かりやすくする。
- 既存の移動・宝箱・ボス判定を壊さない。

### Step 5: 戦闘画面改善

- 敵エリア、プレイヤーステータス、コマンド、ログを分かりやすく分離する。
- ボタンサイズをスマホ向けに調整する。
- 小ボス戦の見た目を少し特別にする。

### Step 6: 確認

- 新規プレイでコアループを確認する。
- 画像未配置でも壊れないことを確認する。
- `npm run build` を実行する。
- 変更内容と未実装項目をREADMEまたはタスクファイルに追記する。

---

## 14. 受け入れ条件

### 14.1 機能面

- 新規プレイで町に入れる。
- フィールドへ出られる。
- 上下左右に移動できる。
- 水など通れない場所の制御が維持されている。
- 敵と遭遇できる。
- 通常戦闘で勝てる。
- EXP / GOLD が得られる。
- レベルアップできる。
- 宿屋で回復できる。
- 装備購入できる。
- 宝箱を取得できる。
- 小ボスに挑める。
- localStorage の続きからが壊れていない。

### 14.2 UI/UX面

- フィールドで主人公位置が以前より分かりやすい。
- タイルごとの意味が直感的に分かる。
- 宝箱とボス地点が見つけやすい。
- 戦闘画面で敵・自分・コマンド・ログの区別が明確。
- スマホ幅390px前後でボタンが押しやすい。
- HP / MP / Gold / ログが読める。
- 小ボス戦が通常戦闘より少し特別に見える。

### 14.3 実装面

- `npm run build` が成功する。
- TypeScriptエラーがない。
- 画像未配置でも画面が壊れない。
- 画像パスが定数化されている。
- 既存ゲームの著作物を直接含まない。
- 既存ゲーム由来の固有名詞を増やしていない。

---

## 15. 手動確認シナリオ

### 15.1 新規プレイ

1. トップ画面を開く。
2. 「はじめる」を押す。
3. 町画面が表示される。
4. NPCと会話する。
5. 宿屋で回復する。
6. 店で装備購入を試す。
7. フィールドへ出る。
8. 主人公位置が分かることを確認する。
9. 移動ボタンで上下左右に移動する。
10. 水辺で進めないことを確認する。
11. 宝箱を取得する。
12. 敵と戦う。
13. 勝利してEXP/GOLDを得る。
14. HPが減ったら町に戻る。
15. 小ボス地点へ行く。
16. 小ボス戦の見た目が通常戦闘と少し違うことを確認する。

### 15.2 画像未配置確認

1. `public/assets/learning-rpg/hero/` に画像がない状態で起動する。
2. フィールド上でCSS製主人公アイコンまたは「勇」が表示される。
3. 戦闘画面が壊れない。
4. コンソールエラーが致命的でない。

### 15.3 セーブ確認

1. 新規プレイする。
2. フィールドへ出る。
3. 何度か移動する。
4. リロードする。
5. 「つづきから」が表示される。
6. 進行状態が復元される。

---

## 16. 実装しないことリスト

今回やらない。

- 本物の画像生成。
- 敵画像の本格実装。
- BGM追加。
- マップ拡張。
- 学習クイズの本実装。
- 学び攻撃の本実装。
- セーブデータ構造の大幅変更。
- 章データ分離。
- 町画面の大幅改修。

---

## 17. 実装後に記録すること

実装完了後、以下を追記する。

```txt
## 実装結果

- 実装日:
- 実装コミット:
- 実装したこと:
- 未実装のこと:
- build結果:
- 手動確認結果:
- 次にやるべきこと:
```

---

## 18. 後続タスク候補

このタスク完了後、以下を別タスクで進める。

1. Japanese History RPG 第1章の学習クイズ実装。
2. 「学び攻撃」コマンドの本実装。
3. 敵・NPC・宝箱・クエストの章データ分離。
4. 敵スプライト生成。
5. ボス戦専用演出。
6. クリア後の学習サマリー表示。
7. セーブデータのバージョン管理。
8. フィールドマップの7x7 / 9x9拡張。

---

## 19. Codexへの短縮指示

Codexに投げる時は、以下の短縮指示でよい。

```txt
docs/tasks/2026-05-11-field-battle-visual-reference-and-modern-hero.md を読んで、P0を優先して実装してください。
実画像生成はまだ不要です。
画像未配置でも壊れないフォールバック、フィールド視認性改善、戦闘画面改善、主人公アセットREADME追加を優先してください。
既存のゲームループ、localStorageセーブ、戦闘処理、宝箱、小ボスは壊さないでください。
npm run build が通る状態にしてください。
```
