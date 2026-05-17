# Task: Vercel Blob アップロードスクリプトを追加する

Created: 2026-05-17
Repository: `Fastmaster15/learning-rpg`
Priority: High

## 背景

Learning RPG では、画像・音声などの大容量素材を GitHub に直接置かず、外部ストレージ/CDN から読み込む方針にする。

初期運用では Vercel Blob を優先し、容量が厳しくなった場合は Cloudflare R2 へ移行する。

そのため、ローカルまたは Codex 実行環境から Vercel Blob に素材をアップロードし、発行された URL を asset manifest に反映しやすい仕組みを用意する。

## 目的

Vercel Blob へ画像・音声素材を安全にアップロードするための CLI スクリプトを追加する。

GitHub には素材本体を置かず、アップロード用スクリプト、manifest、URL、メタデータだけを管理する。

## 実装対象

候補ファイル:

```text
scripts/upload-blob.mjs
src/data/assets/maps.ts
README.md
package.json
.env.example
```

## 要件

### 1. 依存パッケージ

Vercel Blob SDK を使う。

```bash
npm install @vercel/blob
```

`package.json` にアップロード用スクリプトを追加する。

```json
{
  "scripts": {
    "upload:blob": "node scripts/upload-blob.mjs"
  }
}
```

既存の `dev`, `build`, `start`, `lint` は壊さない。

### 2. 環境変数

`.env.example` を追加または更新し、以下を明記する。

```text
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_RPG_ASSET_BASE_URL=
```

注意:

- `BLOB_READ_WRITE_TOKEN` は絶対に GitHub にコミットしない。
- `.env.local` にのみ設定する。
- ブラウザ側に `BLOB_READ_WRITE_TOKEN` を渡さない。
- `NEXT_PUBLIC_RPG_ASSET_BASE_URL` は公開されてもよい素材配信用の基準 URL として使う。

### 3. CLI仕様

以下の形で使えるようにする。

```bash
npm run upload:blob -- ./local-assets/asuka-town-v1.webp learning-rpg/maps/asuka-town-v1.webp
```

引数:

```text
第1引数: ローカル素材ファイルパス
第2引数: Blob上の保存先パス
```

例:

```bash
npm run upload:blob -- ./local-assets/asuka-town-v1.webp learning-rpg/maps/asuka-town-v1.webp
```

出力例:

```text
Uploaded to Vercel Blob
- pathname: learning-rpg/maps/asuka-town-v1.webp
- url: https://xxxx.public.blob.vercel-storage.com/learning-rpg/maps/asuka-town-v1.webp
```

### 4. スクリプト仕様

`scripts/upload-blob.mjs` は以下を満たす。

- `BLOB_READ_WRITE_TOKEN` が未設定ならエラー終了する
- 引数不足なら使い方を表示してエラー終了する
- ローカルファイルが存在しなければエラー終了する
- `put()` で Vercel Blob にアップロードする
- `access: "public"` を使い、ゲーム画面から読み込める URL を発行する
- ファイル名・保存先パスをログに出す
- 発行された URL をログに出す
- 失敗時はエラー内容を表示して `process.exit(1)` する

擬似コード:

```js
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const token = process.env.BLOB_READ_WRITE_TOKEN;
const [localFilePath, blobPath] = process.argv.slice(2);

// validate token / args / file exists
// read file
// infer content type where possible
// await put(blobPath, fileBuffer, { access: "public", token, contentType })
// print url
```

### 5. Content-Type

最低限、以下の拡張子に対応する。

```text
.webp  image/webp
.jpeg  image/jpeg
.jpg   image/jpeg
.png   image/png
.mp3   audio/mpeg
.ogg   audio/ogg
.wav   audio/wav
```

不明な拡張子は `application/octet-stream` として扱う。

### 6. asset manifest との関係

アップロード後、発行URLに合わせて以下を更新できる状態にする。

```text
src/data/assets/maps.ts
```

現時点では `NEXT_PUBLIC_RPG_ASSET_BASE_URL` を使う設計のため、Blobの公開URLのベースに合わせて環境変数を設定する。

例:

```text
NEXT_PUBLIC_RPG_ASSET_BASE_URL=https://xxxx.public.blob.vercel-storage.com
```

その場合、manifest 側の path は以下のまま使う。

```text
/learning-rpg/maps/asuka-town-v1.webp
```

### 7. README 更新

README の素材管理方針に、アップロード手順を追記する。

追記する内容:

```text
Vercel Blob へ素材をアップロードする場合:
1. Vercel で Blob Store を作成する
2. `.env.local` に `BLOB_READ_WRITE_TOKEN` を設定する
3. `.env.local` に `NEXT_PUBLIC_RPG_ASSET_BASE_URL` を設定する
4. `npm run upload:blob -- <local-file> <blob-path>` を実行する
5. 発行URLを確認し、必要に応じて `src/data/assets/maps.ts` の manifest を更新する
```

### 8. セキュリティ

- `.env.local` はコミットしない
- `BLOB_READ_WRITE_TOKEN` は README やログに直接貼らない
- GitHub Actions で使う場合は GitHub Secrets に登録する
- ブラウザ側には読み込み用 URL のみ渡す

### 9. 検証

以下を実行する。

```bash
npm run build
npm run lint
```

可能なら、ダミーの小さな画像でアップロードスクリプトを手元検証する。

ただし、本番トークンがない場合はアップロード実行は不要。スクリプトの引数チェック・トークン未設定時のエラー確認だけでもよい。

## 完了条件

- `scripts/upload-blob.mjs` が追加されている
- `package.json` に `upload:blob` が追加されている
- `.env.example` に必要な環境変数がある
- README にアップロード手順がある
- `npm run build` が成功する
- 可能なら `npm run lint` も成功する
- 素材本体は GitHub にコミットされていない

## 補足

Vercel Blob は初期運用向け。無料枠 1GB を警戒ラインとして管理し、素材容量が増えた場合は Cloudflare R2 へ移行する。
