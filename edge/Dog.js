const cv = require('opencv4nodejs');
const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');
const bin = require('../image_modules/binary.js');
const { max } = require('../image_modules/min-max.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode DoG <input image path>');
	process.exit(1);
}

const image = cv.imread(argv[0], cv.CV_8UC1);
const img = image.getDataAsArray();

let sig1 = 1.3;
let sig2 = 3.2;

if(argv.length == 3){
	sig1 = argv[1]-0;
	sig2 = argv[2]-0;
}
if(sig2 == 0)
	sig2 = 1.6*sig1;
const filterSize = parseInt(sig2*4+1);
const filterSizeHalf = (filterSize-1)/2;

function gaussian(sig, x, y){
	return math.exp(-(x*x+y*y)/2/sig/sig)/2/math.PI/sig/sig;
}

// DoGフィルタの作成
const filter1 = Array.from(new Array(filterSize)).map((v, i) =>
	Array.from(new Array(filterSize)).map((v, j) => 
		gaussian(sig1,i-filterSizeHalf,j-filterSizeHalf)
		));
const filter2 = Array.from(new Array(filterSize)).map((v, i) =>
	Array.from(new Array(filterSize)).map((v, j) => 
		gaussian(sig2,i-filterSizeHalf,j-filterSizeHalf)
		));

// 各フィルタの総和計算
const filter1_sum = filter1.reduce((pre ,cur) => pre+cur.reduce((pre, cur) => pre+cur, 0),0);
const filter2_sum = filter2.reduce((pre ,cur) => pre+cur.reduce((pre, cur) => pre+cur, 0),0);

// フィルタを正規化しつつ合成
const filter = map(filter1, (v, i, j) => v/filter1_sum-filter2[j][i]/filter2_sum);

// DoGフィルタ適用
const img_dog = conv.conv(img, image.sizes, filter, [filterSize,filterSize], {mode:conv.EXPAND});

// abs
const maxVal = max(img_dog);
const img_dog_abs = map(img_dog, v => v<0?0:(v/maxVal*255));

// 2値化
const img_dog_abs_bin = bin(img_dog_abs, {threshold:20, maxVal:255});

const image_dog_abs = new cv.Mat(img_dog_abs, cv.CV_8UC1);
const image_dog_abs_bin = new cv.Mat(img_dog_abs_bin, cv.CV_8UC1);

cv.imshow('dog-abs', image_dog_abs);
cv.imshow('dog-abs-threshold', image_dog_abs_bin);
cv.waitKey();

cv.imwrite('../outImage/DoG.png', image_dog_abs);
cv.imwrite('../outImage/DoG-bin.png', image_dog_abs_bin);
