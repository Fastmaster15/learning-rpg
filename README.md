# learning-rpg

Learning RPG の別レポジトリ版プロトタイプです。まずは日本史の第1章を軽く遊べる状態を目標にしています。

## 目的

- 学習をダッシュボードではなく、遊べるレトロコマンドRPGとして表現する
- Python / English / Japanese History のテーマを、共通のゲーム基盤で育てる
- 1問クエスト、HP、EXP、レベルアップ、アイテム獲得などのゲーム体験を検証する

## 起動方法

```bash
npm install
npm run dev
```

## 現在の実装範囲

- タイトル画面
- 日本史テーマの第1章
- 町、NPC会話、宿屋、店、フィールド出口
- 16x12 の複数フィールド移動と敵エンカウント
- コマンド戦闘、HP/MP、EXP、GOLD、レベルアップ
- 薬草、装備購入、ステータス確認
- 宝箱1つと探索報酬
- 森の奥の小ボス
- 小ボス撃破によるミニクエスト完了
- WebAudio API による短い効果音

## 要件・設計メモ

- `docs/requirements/classic-jrpg-experience-requirements.md` : クラシックJRPG体験を成立させるための要件。機能一覧ではなく、プレイヤーがどう気持ちよく進むかを中心に整理する。

## 素材管理方針

画像・音声などの大容量素材は GitHub に直接置かず、Vercel Blob / Cloudflare R2 などの外部ストレージ/CDNから読み込む。

- 初期実装は Vercel Blob を優先する
- Vercel Blob の無料枠は 1GB までとして管理する
- Blob容量が厳しくなった場合は Cloudflare R2 へ移行する
- GitHubには素材本体ではなく、asset manifest、外部URL、ホットスポット座標、イベント定義を置く
- 外部URLの差し替えを容易にするため、`NEXT_PUBLIC_RPG_ASSET_BASE_URL` を基準URLとして使う
- 素材ファイルは `asuka-town-v1.webp` のようにバージョン付きで管理し、同一URLの上書きは避ける

初期のマップ素材manifest:

```text
src/data/assets/maps.ts
```

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

## 音源について

- 現在は外部音源ファイルを使用していません。
- 効果音はブラウザの WebAudio API で短い矩形波を生成しています。
- 既存RPGの音楽、効果音、メロディ、ジングルは直接使わない方針です。

## 素材管理

画像や音声の素材本体は GitHub に置かず、Vercel Blob へアップロードして配信します。

アップロード手順:

1. Vercel で Blob Store を作成する
2. `.env.local` に `BLOB_READ_WRITE_TOKEN` を設定する
3. `.env.local` に `NEXT_PUBLIC_RPG_ASSET_BASE_URL` を設定する
4. `npm run upload:blob -- <local-file> <blob-path>` を実行する
5. 発行 URL を確認し、必要に応じて `src/data/assets/maps.ts` の manifest を更新する

`BLOB_READ_WRITE_TOKEN` は `.env.local` のみに置き、GitHub にはコミットしません。ブラウザ側には読み込み用の公開 URL だけを渡します。

## デザイン方針

- 既存RPGの固有名詞、キャラクター、敵、フォント、ロゴ、画面意匠は直接使わない
- `ドラクエ風` ではなく、独自のレトロコマンドRPG風として表現する
- 学習ダッシュボードではなく、遊んで進めるゲーム画面を優先する
- 機能を並べるだけでなく、プレイヤーがどう気持ちよく前に進むかを設計の中心に置く
- フィールドは町はずれ、草原街道、森の入口、森の深部の4区画でつなぐ
