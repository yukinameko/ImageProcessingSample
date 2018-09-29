#動作確認環境
- npm:3.10.9
- node:7.2.1

#環境設定
##node install済
- opencv4nodejsをインストール

> $ npm install --save opencv4nodejs

- 顔画像のデータセットのダウンロード  
http://vis-www.cs.umass.edu/lfw/

- 猫(と犬)画像のデータセットのダウンロード  
http://www.robots.ox.ac.uk/~vgg/data/pets/

ダウンロードしたものをフォルダごとimageフォルダに移動

#動作確認
> node test.js

猫の画像が表示されれば成功(キーを押すと終了)
