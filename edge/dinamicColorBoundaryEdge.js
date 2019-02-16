const cv = require('opencv4nodejs');
const math = require('mathjs');

const map = require('../image_modules/map.js');
const bin = require('../image_modules/binary.js');
const sobel = require('../image_modules/sobel.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode dinamicColorBoundaryEdge <input image path> (<gaussian filter size> <thresholdLow> <thresholdHigh>)');
	process.exit(1);
}

// 画像データ取得
const image = cv.imread(argv[0]);
const img = image.getDataAsArray();

const imgBGR = [];
const imgBGRbin = [];
const imgBGRsobel = [];

// 色ごとに操作
for(let n=0; n<3; n++){
	// 単色のデータ取得
	imgBGR[n] = map(img, v=>v[n]);
	// 2値化
	imgBGRbin[n] = bin(imgBGR[n], {maxVal:255});
	// エッジ検出
	imgBGRsobel[n] = sobel(imgBGRbin[n]).sobelImg;
}
// RGB画像に戻す処理
const imgBin = map(imgBGRbin[0], (v,i,j) => [v, imgBGRbin[1][j][i], imgBGRbin[2][j][i]]);
// いずれかの色画像にエッジがあればカラー画像のエッジとして処理
const imgEdge = map(imgBGRsobel[0], (v,i,j) => (v+imgBGRsobel[1][j][i]+imgBGRsobel[2][j][i])>0?255:0);

const imageBin = new cv.Mat(imgBin, cv.CV_8UC3);
const imageEdge = new cv.Mat(imgEdge, cv.CV_8UC1);

cv.imshow('bin', imageBin);
cv.imshow('edge', imageEdge);
cv.waitKey();

cv.imwrite('../outImage/dinamicColorBoundaryEdge-binary.png', imageBin);
cv.imwrite('../outImage/dinamicColorBoundaryEdge.png', imageEdge);
