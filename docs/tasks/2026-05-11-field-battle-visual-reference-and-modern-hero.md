# Field / Battle Visual Reference & Modern 2D Hero Asset Task

## 目的

Learning RPG の次フェーズで、フィールド画面・戦闘画面・主人公ビジュアルの方向性を明確にする。

現在のプロトタイプはRPGのコアループは成立しているため、次は「見た瞬間にRPGとして気持ちよく遊べそう」と感じる画面密度と、現代版主人公のオリジナル2Dアセットを追加する。

## 重要方針

- 既存有名RPGの画像、UI、音楽、フォント、ロゴ、固有名詞、キャラクターを直接コピーしない。
- 参照するのは、あくまでクラシックJRPGの体験構造・画面構成・情報設計のみ。
- 目指すのは「独自のレトロコマンドRPG風」かつ「学習RPGとして自然に機能する画面」。
- 画面のノスタルジーは活かすが、権利物の模倣にならないようにする。

## 参考にしたい体験要素

ユーザー提供の参考画像では、以下のような方向性を重視する。

### フィールド画面

- トップダウンの2Dフィールド。
- 草原、森、山、川、海、道、城・町などがタイル状に配置されている。
- プレイヤーキャラクターが小さなドット絵で表示され、世界を旅している感覚がある。
- マップ上の地形差によって「進める場所」「危険そうな場所」「目的地」が直感的に分かる。
- 画面全体が冒険の舞台として成立しており、UIよりもフィールドの没入感を優先する。

### 戦闘画面

- 黒背景または暗めの背景に、白枠の情報ウィンドウを配置するクラシックな見せ方。
- 敵は画面中央または上部に表示。
- プレイヤー側のHP/MP/レベル/ゴールド等を読みやすく表示。
- コマンドは「たたかう」「じゅもん」「どうぐ」「にげる」などを押しやすくする。
- 戦闘ログは短く、結果がすぐ分かる文体にする。
- スマホでもコマンドが押しやすいよう、ボタンサイズと余白を確保する。

## 実装タスク

### 1. フィールド画面の改善

- 現在の5x5マップをベースに、タイル表現をよりRPGらしくする。
- 草原、森、山、川、海、道、町、宝箱、ボス地点の視認性を上げる。
- 可能であればCSSだけで簡易ドット絵風の質感を出す。
- プレイヤー位置は「勇」テキストだけでなく、2D主人公アイコンまたはスプライトで表示できるようにする。
- スマホ画面でフィールドがつぶれないよう、正方形マップを維持する。

### 2. 戦闘画面の改善

- 黒背景＋白枠ウィンドウを基調にしたクラシックな戦闘画面へ寄せる。
- 敵表示エリア、プレイヤーステータス、コマンド、ログを明確に分離する。
- コマンドUIはスマホ操作を優先し、4コマンドを大きめに配置する。
- 学習攻撃を追加する場合に備えて、クイズウィンドウを差し込める余白を作る。
- 勝利、レベルアップ、ボス撃破時のログをより気持ちよくする。

### 3. 現代版主人公2Dイラスト / スプライト生成

Image2 などの画像生成ツールで、Learning RPG 用のオリジナル主人公2Dアセットを作成する。

#### キャラクター方針

- 現代版の主人公。
- 学習RPGに合う、知的・冒険者・若手社会人の中間くらいの印象。
- 剣と魔法の古典ファンタジーに寄せすぎず、現代の服装に少しだけ冒険感を加える。
- ノート、タブレット、ペン、軽いバックパックなど、学びを連想する小物があるとよい。
- 表情は前向きで、成長していく主人公感を出す。
- 既存ゲームキャラに似せない。

#### 生成したい素材

- 立ち絵：正面、全身、透過背景推奨。
- フィールド用ミニキャラ：トップダウンまたは斜め上視点の小さな2Dスプライト。
- 戦闘用バストアップ：コマンド戦闘画面のステータス横や演出で使えるもの。
- 可能であれば、通常・集中・勝利の3表情差分。

#### Image2向けプロンプト案

```txt
Original 2D game protagonist for a modern learning RPG, Japanese mobile browser game, young adult learner-adventurer, smart casual outfit with a light jacket, small backpack, notebook and tablet, optimistic expression, clean anime-inspired 2D illustration, simple readable silhouette, full body, transparent background, suitable for small RPG sprite adaptation, original character design, no existing game character, no logos, no text
```

#### ドット絵 / ミニキャラ向けプロンプト案

```txt
Original modern learning RPG hero, small 2D pixel art sprite, top-down RPG overworld character, smart casual outfit, light jacket, backpack, notebook accessory, readable at small size, 32x32 sprite style, four-direction walking poses, original design, transparent background, no existing game character, no logos, no text
```

#### 戦闘用バストアップ向けプロンプト案

```txt
Original modern learning RPG hero battle portrait, 2D anime-inspired game art, young adult learner-adventurer, smart casual jacket, confident and focused expression, notebook or tablet as learning item, clean line art, simple color blocks, transparent background, mobile RPG UI asset, original character design, no existing game character, no logos, no text
```

### 4. アセット配置ルール

生成・採用した画像は以下に配置する。

```txt
public/assets/learning-rpg/hero/
  hero-fullbody.png
  hero-sprite-overworld.png
  hero-battle-portrait.png
  hero-expression-normal.png
  hero-expression-focus.png
  hero-expression-victory.png
```

必要に応じて、画像生成前に以下の仮ファイルまたはREADMEを置く。

```txt
public/assets/learning-rpg/hero/README.md
```

### 5. 実装後の接続

- フィールド上のプレイヤー表示を主人公スプライトに差し替える。
- 戦闘画面のプレイヤーステータス近辺に主人公バストアップを表示できるようにする。
- 画像が未配置の場合は、既存のテキスト表示にフォールバックする。
- 画像パスは定数化し、後から差し替えやすくする。

## 完了条件

- フィールド画面がクラシックJRPG的な冒険感を持つ。
- 戦闘画面がコマンドRPGとして見やすく、押しやすい。
- 現代版主人公2Dアセットの生成プロンプトと配置先が明文化されている。
- 既存RPGの著作物を直接コピーしていない。
- 将来の日本史第1章・学習攻撃・クイズUI追加に耐えられる画面構造になっている。
