const cv = require('opencv4nodejs');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode convertGrayScale <input image path>');
	process.exit(1);
}

const grayImage = cv.imread(argv[0], cv.CV_8UC1);

cv.imshow('gray image', grayImage);
cv.waitKey();

if(argv.length > 1){
	cv.imwrite(argv[1], grayImage);
}
