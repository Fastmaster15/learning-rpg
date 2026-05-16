# learning-rpg

Learning RPG の別レポジトリ版プロトタイプです。まずは日本史の第1章を軽く遊べる状態を目標にしています。

## 目的

- 学習をダッシュボードではなく、遊べる探索型カードMVPとして表現する
- 飛鳥章の史実カードを集めながら、3択イベントとカードゲートで進行を作る
- 史実の地形・人物・建立の流れを、単一画面の探索で検証する

## 起動方法

```bash
npm install
npm run dev
```

## 現在の実装範囲

- タイトル画面
- 飛鳥の町、職人の作業場、寺の入口の3シーン遷移
- 吹き出しホットスポット
- 未確認 / 完了済み / ロック中の状態表示
- 史実カードの収集とカード帳進捗
- 手持ちカードを使った3択イベント
- 選択カードに応じた反応変化
- Sランク「飛鳥寺」のゲート解放

## 要件・設計メモ

- `docs/requirements/classic-jrpg-experience-requirements.md` : クラシックJRPG体験を成立させるための要件。機能一覧ではなく、プレイヤーがどう気持ちよく進むかを中心に整理する。

## 個人OS本体との関係

- 個人OS本体は、構想、導線、プロトタイプ一覧、データ連携のハブとして扱う
- `learning-rpg` は、本格ゲーム実装とゲーム体験の検証を育てる別レポジトリ
- OS 本体にはゲーム機能を詰め込みすぎず、学習RPGはこの repo で育てる

## 今後の開発タスク

- 第2章以降を増やす
- クエスト数を増やす
- 宝箱や小目的地を増やす
- 戦闘バランスを調整する
- セーブデータの設計を固める
- 画像素材を差し替えやすい構造にする
- ゲームロジックとUIを分離し、敵・装備・宝箱データを追加しやすくする
- 音量・ミュート設定を追加する

## 画像素材の配置

この repo では、画像を `public/images/learning-rpg/` 配下に置く前提で扱います。

現在コードが参照している代表的なパスは以下です。

- `public/images/learning-rpg/characters/hero-front.jpg`
- `public/images/learning-rpg/bosses/forest-lord.jpg`
- `public/images/learning-rpg/field-atlas/grassland-road.jpg`
- `public/images/learning-rpg/field-atlas/forest-edge.jpg`
- `public/images/learning-rpg/field-atlas/forest-depth.jpg`
- `public/images/learning-rpg/field-atlas/boss-depth.jpg`
- `public/images/learning-rpg/field-atlas/town-outskirts.jpg`

差し替える場合は、同じパスに上書きするか、`src/lib/learning-rpg-assets.ts` の定数を更新してください。

タイルセットは 001〜200 の連番想定です。今は 5 枚の atlas 画像を使っていますが、将来的にはこの root に
細かいタイル画像を増やしていける構造にしています。

## 音源について

- 現在は外部音源ファイルを使用していません。
- 効果音はブラウザの WebAudio API で短い矩形波を生成しています。
- 既存RPGの音楽、効果音、メロディ、ジングルは直接使わない方針です。

## デザイン方針

- 旧RPGのタイル移動・戦闘・装備画面は出さない
- 一枚絵の探索、カード帳、イベント、ゲートを同じ画面内でつなぐ
- 歴史の地形や人物を、カード収集のリズムで見せる
