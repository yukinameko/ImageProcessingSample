const cv = require('opencv4nodejs');
const fs = require('fs');

const argv = process.argv.slice(2);

if(process.argv.length < 2){
	console.log('error: not found argv'+argv.length+'\nnode diff <input image1 path> <input image2 path>');
	process.exit(1);
}

const img1 = cv.imread(process.argv[0], cv.CV_8UC1);
const img2 = cv.imread(process.argv[1], cv.CV_8UC1);

if(img1.sizes.toString() != img2.sizes.toString()){
	console.log('error: size is different');
	process.exit(1);
}

console.log(img1.getDataAsArray().toString() == img2.getDataAsArray().toString() ? 'same images' : 'different images');
