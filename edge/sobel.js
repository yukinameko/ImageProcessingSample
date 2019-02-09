const cv = require('opencv4nodejs');
const math = require('mathjs');

const conv = require('../image_modules/convolution.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode H <input original-image path> <input noise-image path> <psf.json> <output images name>');
	process.exit(1);
}

const image = cv.imread(argv[0], cv.CV_8UC1);
const img = image.getDataAsArray();

const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
const filterSizes = [sobelX.length, sobelX[0].length];

const edgeXImg = conv(img, image.sizes, sobelX, filterSizes,
	val=>(math.abs(val)>255?255:math.abs(val))
);
const edgeYImg = conv(img, image.sizes, sobelY, filterSizes,
	val=>(math.abs(val)>255?255:math.abs(val))
);

const edgeImg = edgeXImg.map((v, j) => v.map((v, i) => {
	const r = math.sqrt(v*v+edgeYImg[j][i]*edgeYImg[j][i]);
	return r>255?255:r;
}))

const edgeImage = new cv.Mat(edgeImg, cv.CV_8UC1);

cv.imshow('edge image', edgeImage);
cv.waitKey();
