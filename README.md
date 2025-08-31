# Space Invaders Game

懐かしのスペースインベーダーゲームをHTML5 Canvasで再現しました。

## デモ
🎮 [今すぐプレイ](https://vk-8b8f-kcc9ghpoz-hiroaki-yoshikuras-projects-7b26a5a1.vercel.app)

## 特徴
- 🚀 クラシックなゲームプレイを忠実に再現
- 👾 5行×11列の敵インベーダー（3種類の敵タイプ）
- 🛡️ 4つの防御壁でプレイヤーを守る
- 📊 スコアシステムとハイスコア記録（ローカルストレージ保存）
- ⚡ 段階的な難易度上昇システム
- 🎨 レトロな緑色のグラフィック

## 操作方法
- **← → キー**: 自機を左右に移動
- **スペースキー**: 弾を発射（最大2発まで同時発射可能）

## ゲームルール
- 全てのインベーダーを倒すと次のウェーブへ
- インベーダーが自機の高さまで到達するとゲームオーバー
- 敵の弾に当たるとライフが減少（初期ライフ3）
- 上段の敵ほど高得点
  - 赤色（最上段）: 30点
  - 黄色（中段）: 20点
  - 水色（下段）: 10点

## 技術スタック
- HTML5 Canvas
- Vanilla JavaScript
- CSS3

## ローカルで実行
```bash
# リポジトリをクローン
git clone https://github.com/takamiya1021/space-invaders-game.git

# ディレクトリに移動
cd space-invaders-game

# サーバーを起動（Python 3）
python3 -m http.server 8000

# ブラウザでアクセス
# http://localhost:8000
```

## デプロイ
Vercelにデプロイされています。

## ライセンス
MIT