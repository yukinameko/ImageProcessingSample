const cv = require('opencv4nodejs');
const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode sobel <input image path>');
	process.exit(1);
}

// 画像データ取得
const image = cv.imread(argv[0], cv.CV_8UC1);
const img = image.getDataAsArray();

// Sobelフィルタ作成
const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
const filterSizes = [sobelX.length, sobelX[0].length];

// Sobelフィルタ適用
const edgeXImg = conv.conv(img, image.sizes, sobelX, filterSizes,
	{func:val=>(math.abs(val)>255?255:math.abs(val)), mode:conv.EXPAND});
const edgeYImg = conv.conv(img, image.sizes, sobelY, filterSizes,
	{func:val=>(math.abs(val)>255?255:math.abs(val)), mode:conv.EXPAND});

const edgeImg = map(edgeXImg, (v, i, j) => {
	const r = math.sqrt(v*v+edgeYImg[j][i]*edgeYImg[j][i]);
	return r>255?255:r;
});

const edgeImage = new cv.Mat(edgeImg, cv.CV_8UC1);

cv.imshow('edge image', edgeImage);
cv.waitKey();

cv.imwrite('../outImage/sobel.png', edgeImage);
