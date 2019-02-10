const cv = require('opencv4nodejs');
const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode canny <input image path> (<gaussian filter size> <thresholdLow> <thresholdHigh>)');
	process.exit(1);
}

// 画像データ取得
const image = cv.imread(argv[0], cv.CV_8UC1);
const img = image.getDataAsArray();

// 定数定義
const imgSize = image.sizes;
let gaussianFilterSize = 5;
let thresholdLow = 0.25;
let thresholdHigh = 0.35;
if(argv.length == 4){
	gaussianFilterSize = argv[1];
	thresholdLow = argv[2];
	thresholdHigh = argv[3];
}

// Gaussianフィルタ作成
const gaussianFilterSizeHalf = (gaussianFilterSize-1)/2;
const sigma = gaussianFilterSizeHalf/2;
const gaussianFilter = Array.from(new Array(gaussianFilterSize)).map((_, j) =>
	Array.from(new Array(gaussianFilterSize)).map((_, i) => {
		return math.exp(-(j*j+i*i)/(2/sigma/sigma))/(2*math.PI*sigma*sigma);
	}));

const gaussianImg = conv(img, imgSize, gaussianFilter, [gaussianFilterSize, gaussianFilterSize]);

// Sobelフィルタ作成
const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
const filterSizes = [sobelX.length, sobelX[0].length];

// Sobelフィルタ適用
const sobelXImg = conv(gaussianImg, imgSize, sobelX, filterSizes,
	val=>(math.abs(val)>255?255:math.abs(val))
);
const sobelYImg = conv(gaussianImg, imgSize, sobelY, filterSizes,
	val=>(math.abs(val)>255?255:math.abs(val))
);

const sobelImg = map(sobelXImg, (v, i, j) => {
	const r = math.sqrt(v*v+sobelYImg[j][i]*sobelYImg[j][i]);
	return (r>255?255:r)/255;
});

// エッジに直行する角度の計算
const thetaImg = map(sobelXImg, (v, i, j) => math.atan2(sobelYImg[j][i], v));

// non maximum supperession処理
const nmsImg = map(sobelImg, (v, i, j, img) => {
	const theta = thetaImg[j][i];
	let di = 0;
	let dj = 0;
	if(math.abs(theta) < math.PI*7/8){
		di = 1;
	}
	if(math.abs(theta) > math.PI/8){
		dj = (theta<0?theta+math.PI:theta)<(math.PI/2)?1:-1;
	}
	if((img[j+dj]?(img[j+dj][i+di] > v):true) || (img[j-dj]?(img[j-dj][i-di] > v):true)){
		return 0;
	}
	return v;
});

// hysteresis threshold処理
const cannyImg = map(nmsImg, (v, i, j, img) => {
	if(v < thresholdLow)return 0;
	if(v > thresholdHigh)return v;
	const theta = thetaImg[j][i];
	let di = 0;
	let dj = 0;
	if(math.abs(theta) < math.PI*7/8){
		dj = 1;
	}
	if(math.abs(theta) > math.PI/8){
		di = (theta<0?theta+math.PI:theta)<(math.PI/2)?-1:1;
	}
	if((img[j+dj]?(img[j+dj][i+di] > thresholdHigh):false) || (img[j-dj]?(img[j-dj][i-di] > thresholdHigh):false)){
		return v;
	}
	return 0;
});

const gaussianImage = new cv.Mat(gaussianImg, cv.CV_8UC1);
const sobelImage = new cv.Mat(sobelImg, cv.CV_32FC1);
const nmsImage = new cv.Mat(nmsImg, cv.CV_32FC1);
const cannyImage = new cv.Mat(cannyImg, cv.CV_32FC1);

cv.imshow('gaussian image', gaussianImage);
cv.imshow('sobel image', sobelImage);
cv.imshow('non maximum supperession image', nmsImage);
cv.imshow('canny image', cannyImage);
cv.waitKey();

const sobelImage_ = new cv.Mat(map(sobelImg, v=>math.abs(v*255)), cv.CV_8UC1);
const nmsImage_ = new cv.Mat(map(nmsImg, v=>math.abs(v*255)), cv.CV_8UC1);
const cannyImage_ = new cv.Mat(map(cannyImg, v=>math.abs(v*255)), cv.CV_8UC1);

cv.imwrite('../outImage/canny-gaussian.png', gaussianImage);
cv.imwrite('../outImage/canny-sobel.png', sobelImage_);
cv.imwrite('../outImage/canny-non-maximum-supperession.png', nmsImage_);
cv.imwrite('../outImage/canny.png', cannyImage_);
