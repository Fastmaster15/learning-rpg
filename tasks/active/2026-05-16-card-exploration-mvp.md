# Learning RPG Card Exploration MVP 仮実装タスク

## Repository

- Repository: `Fastmaster15/learning-rpg`
- Branch: `main`
- Task file: `tasks/active/2026-05-16-card-exploration-mvp.md`

## 背景

旧タイル移動・戦闘RPG案は没案として active runtime から削除済み。

現在のLearning RPGは、以下の方針で作り直す。

> 一枚絵の時代絵巻をタップして探索する。  
> 人・物・場所から史実カードを集める。  
> 手持ちカードから3択でカードを使い、NPCやイベントの反応を変える。  
> 特定カードや枚数条件でイベントを進める。  
> 終わった吹き出しは色を変え、次に見る場所を分かりやすくする。  
> 最終的に、カード同士の関係からSランク「飛鳥寺」を解放する。

## 参照仕様

実装前に以下を確認すること。

- `docs/planning/integrated-learning-rpg-mvp-spec.md`
- `docs/planning/illustration-hotspot-exploration-spec.md`
- `docs/planning/card-choice-interaction-spec.md`
- `docs/planning/card-gate-progression-spec.md`
- `docs/planning/card-driven-event-progression-spec.md`
- `docs/planning/chapter-1-asuka-card-inventory.md`
- `docs/planning/historical-grounding-policy.md`
- `docs/deprecated/classic-rpg/README.md`

## 目的

Chapter 1「飛鳥の町」の仮実装として、**一枚絵探索 × 史実カード収集 × 3択カードイベント × カードゲート × Sランク飛鳥寺解放** の最小プレイ可能プロトタイプを作る。

完成度は本番レベルでなくてよい。

まずは、ゲームの芯である以下を触れる状態にする。

1. 飛鳥の町の一枚絵風画面を見る
2. 吹き出しホットスポットをタップする
3. 史実カードを獲得する
4. カード帳で進捗を見る
5. NPCや場所にカード3択を使う
6. カード条件で次イベントが開く
7. Sランク「飛鳥寺」カードが解放される

## 実装方針

### 1. 旧RPG案には戻さない

以下の要素は今回のMVPに入れない。

- タイル移動
- ランダムエンカウント
- 戦闘
- HP/MP
- 装備
- 経験値
- 森のボス
- 宝箱

旧案は `docs/deprecated/classic-rpg/README.md` に退避済みの扱い。

### 2. 背景画像は仮でよい

GPT image2で作った本番背景は後で差し替える。

今回のMVPでは、CSSグラデーションやパネル配置で「一枚絵風」に見せればよい。

ただし、構造は後から画像差し替え可能にする。

### 3. 史実性を崩さない

不確かなものを中核カードやイベントにしない。

以下はMVPでは保留。

- 甘い香りの屋台
- 飛鳥のお菓子
- 子どもの遊び
- 蜜

## 推奨ファイル構成

新規または更新候補。

```text
src/app/product-lab/learning-rpg/page.tsx
src/components/product-lab/LearningRpgCardMvpClient.tsx
src/lib/learning-rpg-card-mvp.ts
```

必要なら分割してもよい。

```text
src/components/product-lab/learning-rpg-card/CardLedger.tsx
src/components/product-lab/learning-rpg-card/HotspotBubble.tsx
src/components/product-lab/learning-rpg-card/CardChoiceModal.tsx
```

ただし、初回は過剰分割しすぎない。

## 画面仕様

### 1. タイトル / 概要

`/product-lab/learning-rpg` にアクセスしたら、カード探索MVPが表示される。

画面上部に以下を出す。

- `Learning RPG`
- `Chapter 1 飛鳥の町`
- 簡単な説明
- 現在の目標

目標例：

> 市の荷物、供物、瓦、木簡、人々の動きをたどり、Sランク「飛鳥寺」カードを解放しよう。

### 2. メイン探索画面

一枚絵風の探索画面を作る。

MVPでは以下3画面を用意する。

- `asuka-town`：飛鳥の町 / 市の一角
- `craft-worksite`：職人の作業場
- `temple-gate`：寺の入口

画面切り替えはボタンまたはホットスポットで行う。

### 3. 吹き出しホットスポット

各画面にホットスポットを配置する。

状態は最低限以下を持つ。

- `unvisited`：未確認
- `in_progress`：進行中
- `completed`：完了済み
- `locked`：ロック中
- `revisit`：再訪あり。今回MVPでは表示だけでも可

完了済みホットスポットは、必ず色や形を変える。

### 4. カード帳

画面右側または下部にカード帳を表示する。

表示項目。

- 飛鳥パック進捗 `x / total`
- Sカード進捗
- 所持カード一覧
- 未発見カード枠
- 複数枚カードの発見数

MVPの総数は `14` でよい。

例：

```text
飛鳥パック 4 / 14
S 0 / 1
A 3 / 6
B 1 / 7
```

## MVPカードデータ

`src/lib/learning-rpg-card-mvp.ts` などに定義する。

### Sランク

1. `asuka-temple` / 飛鳥寺
   - rarity: `S`
   - quantityType: `unique`
   - hiddenNameUntilDiscovered: true
   - 初期表示名: `大きなお寺のカード`

### Aランク

2. `roof-tile` / お寺の瓦
   - quantityType: `stackable`
   - maxCopies: 3
   - gateTheme: 建築

3. `temple-craftworkers` / 寺をつくる職人たち
   - quantityType: `unique`
   - gateTheme: 人 / 建築

4. `wooden-tablet` / 木簡
   - quantityType: `stackable`
   - maxCopies: 3
   - gateTheme: 記録

5. `official` / 役人
   - quantityType: `unique`
   - gateTheme: 記録 / 人

6. `monk` / 僧
   - quantityType: `unique`
   - gateTheme: 人 / 信仰

7. `offering` / 供物
   - quantityType: `stackable`
   - maxCopies: 3
   - gateTheme: 儀式

### Bランク

8. `market-goods` / 市の荷物
9. `timber-carriers` / 木材を運ぶ人々
10. `simple-vessel` / 素朴な器
11. `craftsperson` / 工人
12. `palace-attendant` / 宮に仕える人
13. `monk-robe` / 僧の衣
14. `asuka-town-view` / 飛鳥の町並み

## ホットスポット初期案

### asuka-town

- 店の人
  - type: `talk`
  - initialState: `unvisited`
  - can grant: `market-goods`

- 市の荷物
  - type: `observe/card`
  - grants: `market-goods`

- 供物
  - type: `observe/card`
  - grants: `offering`

- 職人の作業場へ
  - type: `enter`
  - condition: `market-goods` or `offering` discovered
  - target: `craft-worksite`

- 役人
  - type: `talk/card-choice`
  - condition: `market-goods` discovered

- 寺の方向
  - type: `enter`
  - locked until at least 3 core cards discovered
  - target: `temple-gate`

### craft-worksite

- 職人
  - type: `talk/card-choice`
  - choices: `roof-tile`, `timber-carriers`, `offering`

- 瓦
  - type: `observe/card`
  - grants: `roof-tile`
  - stackable up to 3 via multiple places

- 木材
  - type: `observe/card`
  - grants: `timber-carriers`

- 寺へ向かう
  - type: `enter`
  - target: `temple-gate`
  - condition: `roof-tile` discovered OR `temple-craftworkers` discovered

### temple-gate

- 僧
  - type: `talk/card-choice`
  - grants: `monk`
  - choices: `offering`, `roof-tile`, `wooden-tablet`

- 寺の屋根
  - type: `observe/card`
  - grants another copy of `roof-tile`

- 供物置き場
  - type: `observe/card`
  - grants another copy of `offering`

- 木簡を持つ役人
  - type: `talk/card-choice`
  - grants: `wooden-tablet`, `official`

- 大きなお寺のカード
  - type: `s-card-progress`
  - unlocks `asuka-temple` when gate complete

## カード3択仕様

イベントでは、持っているカードの中から3択を出す。

全カードから選ばせない。

各選択には反応タイプを持たせる。

- `strong`
- `medium`
- `weak`

例：職人イベント

```text
職人さんに、どのカードを見せる？

[お寺の瓦]
[木材を運ぶ人々]
[供物]
```

- お寺の瓦: strong
- 木材を運ぶ人々: medium
- 供物: weak

反応例。

- strong: 関連カードがつながり、Sカード進捗が進む
- medium: 追加会話と理解度上昇
- weak: 別ルートへのヒント

## Sランク「飛鳥寺」解放条件

以下5要素を満たしたら解放する。

1. 建築
   - `roof-tile` または `temple-craftworkers`
2. 人
   - `monk` または `temple-craftworkers` または `craftsperson`
3. 儀式
   - `offering`
4. 記録
   - `wooden-tablet` または `official`
5. 場所
   - `temple-gate` 到達

解放時の表示。

```text
Sランクカード「飛鳥寺」が記録帳に刻まれた。
建物、職人、僧、供物、記録。いろいろなものが集まって、このお寺は形になっていた。
```

## UI要件

### 吹き出し状態色

色は厳密指定不要だが、状態差は明確にする。

- 未確認: 目立つ
- 進行中: 中間色
- 完了済み: 落ち着いた色 + チェック
- ロック中: グレー + 鍵
- 再訪あり: 星やアクセント

### カード獲得演出

カードを獲得したら、短いメッセージを出す。

例：

```text
「お寺の瓦」を見つけた！
Sカード「大きなお寺のカード」の手がかりが増えた。
```

### ロック時ヒント

条件不足で進めない時は、うーちゃんがヒントを出す。

例：

```text
うーちゃん：「お寺のことを知るには、作っている人たちの話も聞いた方がよさそう！」
```

## 受け入れ条件

- `/product-lab/learning-rpg` で新しいカード探索MVP画面が表示される
- 旧RPGのタイル移動・戦闘・装備画面は表示されない
- 飛鳥の町、職人の作業場、寺の入口の3画面を遷移できる
- 吹き出しホットスポットが表示される
- ホットスポットは未確認 / 完了済み / ロック中などで見た目が変わる
- カードを獲得できる
- カード帳で飛鳥パック進捗が見える
- 手持ちカードから3択イベントが発生する
- 選んだカードによって反応が変わる
- 条件を満たすとSランク「飛鳥寺」が解放される
- 必須カードを取り逃しても詰まない
- `npm run build` が通る
- 可能なら `npm run lint` も確認する

## 非対象

今回やらない。

- GPT image2本番背景の生成
- 画像ファイルの追加
- 対戦モード
- 時代横断リンクの本実装
- 絵柄違いの本実装
- セーブデータ永続化
- 認証
- サーバー連携
- Personal OS連携

## 実装メモ

- まずはローカル state でよい
- 永続化は不要
- 画像はCSS仮背景でよい
- コンポーネント分割は最小限でよい
- UIはスマホ縦画面を優先
- 史実的に怪しいカードは追加しない

## Codex確認コマンド

```bash
npm run build
npm run lint
```

`npm run lint` が既存設定都合で失敗する場合は、理由を明記すること。

## 完了報告で書くこと

- 変更ファイル
- 実装した画面・機能
- Sカード解放条件の実装状況
- build結果
- lint結果
- 未実装として残したもの
