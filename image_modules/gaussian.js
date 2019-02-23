const math = require('mathjs');

const conv = require('../image_modules/convolution.js');

module.exports = (img, {kSize=0, sigma=0} = {kSize:5, sigma:1}) => {
	let kSizeHalf = 0;
	if(kSize == 0){
		kSizeHalf = parseInt(sigma*2+0.5);
		kSize = kSizeHalf*2+1;
	}else if(sigma == 0){
		if(kSize|1 == 0)kSize++;
		kSizeHalf = (kSize-1)/2;
		sigma = kSizeHalf/2;
	}
	const gaussianFilter = Array.from(new Array(kSize)).map((_, j) =>
		Array.from(new Array(kSize)).map((_, i) => {
			return math.exp(-(j*j+i*i)/(2/sigma/sigma))/(2*math.PI*sigma*sigma);
		}));
	return conv.conv(img, [img.length, img[0].length], gaussianFilter, [kSize,kSize], {mode:conv.EXPAND});
}
