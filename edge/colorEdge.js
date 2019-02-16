const cv = require('opencv4nodejs');
const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');
const bin = require('../image_modules/binary.js');
const canny = require('../image_modules/canny.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode colorEdge <input image path> (<gaussian filter size> <thresholdLow> <thresholdHigh>)');
	process.exit(1);
}

// 画像データ取得
const image = cv.imread(argv[0]);
const img = image.getDataAsArray();

const imgG = map(img, v=>v[0]);
const imgB = map(img, v=>v[1]);
const imgR = map(img, v=>v[2]);

const imgGbin = bin(imgG, {maxVal:255});
const imgBbin = bin(imgB, {maxVal:255});
const imgRbin = bin(imgR, {maxVal:255});

const imgGcanny = canny(imgGbin);
const imgBcanny = canny(imgBbin);
const imgRcanny = canny(imgRbin);

const imgBin = map(imgGbin, (v,i,j) => [v, imgBbin[j][i], imgRbin[j][i]]);
const imgEdge = map(imgGcanny, (v,i,j) => v+imgBcanny[j][i]+imgRcanny[j][i]>0?255:0);

const imageBin = new cv.Mat(imgBin, cv.CV_8UC3);
const imageEdge = new cv.Mat(imgEdge, cv.CV_8UC1);
// cv.imshow('bin', imageBin);
cv.imshow('edge', imageEdge);
cv.waitKey();
