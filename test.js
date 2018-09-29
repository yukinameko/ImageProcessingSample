const cv = require('opencv4nodejs');

const emptyMat = new cv.Mat(100, 100, cv.CV_8UC3);

cv.imreadAsync('image/images/Ragdoll_63.jpg', (err, mat) => {
	console.log(mat);
	cv.imshow('test', mat);
	cv.waitKey();
});