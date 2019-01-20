const cv = require('opencv4nodejs');

const bgrImg1 = cv.imread('image/images/Ragdoll_63.jpg');
const bgrImg2 = cv.imread('image/images/Ragdoll_64.jpg');

const grayImg1 = bgrImg1.bgrToGray();
const grayImg2 = bgrImg2.bgrToGray();

console.log(grayImg2.getDataAsArray());

cv.imshow('gray image', grayImg1);
// cv.waitKey();
