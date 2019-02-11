const cv = require('opencv4nodejs');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode test <input image path>');
	process.exit(1);
}

const image = cv.imread(argv[0]);

cv.imshow('test', image);
cv.waitKey();
