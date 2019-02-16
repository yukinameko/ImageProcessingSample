const cv = require('opencv4nodejs');

const argv = process.argv.slice(2);

if(process.argv.length < 2){
	console.log('error: not found argv'+argv.length+'\nnode psnr <input original image path> <imput degraded image path>');
	process.exit(1);
}

const im1 = cv.imread(process.argv[0], cv.CV_8UC1);
const im2 = cv.imread(process.argv[1], cv.CV_8UC1);

if(!im1.sizes == im2.sizes){
	console.log('error: defferent size');
	process.exit(1);
}

const im1_array = im1.getDataAsArray();
const sub = im2.getDataAsArray().map((v, i) => v.map((v, j) => v-im1_array[i][j]));

const mse = sub.reduce((pre, cur) => pre+cur.reduce((pre, cur) => pre+cur*cur, 0), 0)/(im1.rows*im1.cols);
const psnr = 10*Math.log10(255*255/mse);

console.log(`PSNR = ${psnr}dB`);
