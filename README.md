# 動作確認環境
- npm:6.7.0
- node:11.1.0

# 環境設定
nodeはインストール済みとする．

## ライブラリインストール
- opencv4nodejs

> $ npm install --save opencv4nodejs

- math.js

> $ npm install --save mathjs

## 使う(かもしれない)画像のダウンロード

- 顔画像のデータセットのダウンロード  
http://vis-www.cs.umass.edu/lfw/

- 猫(と犬)画像のデータセットのダウンロード  
http://www.robots.ox.ac.uk/~vgg/data/pets/

ダウンロードしたものをフォルダごとimageフォルダに移動

# 動作確認
> node test <画像ファイルのパス>

指定した画像が表示されれば成功(キーを押すと終了)


# プログラム
プログラムのコマンドライン引数を知りたい場合は実行時に引数を与えず

> node <jsファイル>

とすれば必要な引数が返される(括弧内のものは任意指定)

## 動作確認用

- test.js
- convertGrayScale.js

## エッジ検出
edgeフォルダにまとめてある

- sobel.js  
	Sobelフィルタ
- canny.js  
	Canny法
- dinamicColorBoundaryEdge.js  
	色情報を用いたエッジ検出
- colorEdge.js  
	上記の改良版
- DoG.js  
	DoGフィルタ
- FDoG.js  
	流れ場を利用したエッジ検出(FDoG)

## 自作モジュール

- convolution.js  
	畳み込み
- map.js  
	全画素に対する処理
- gaussian.js
- sobel.js
- canny.js
- binary.js
- mapParseInt.js
- mim-max.js
- normalize.js
- dots.js  
行列計算
