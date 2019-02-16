const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');

module.exports = (img, {gaussianFilterSize=5, thresholdLow=0.25, thresholdHigh=0.35} = {gaussianFilterSize:5, thresholdLow:0.25, thresholdHigh:0.35}) => {
	const imgSize = [img.length, img[0].length];

	// Gaussianフィルタ作成
	const gaussianFilterSizeHalf = (gaussianFilterSize-1)/2;
	const sigma = gaussianFilterSizeHalf/2;
	const gaussianFilter = Array.from(new Array(gaussianFilterSize)).map((_, j) =>
		Array.from(new Array(gaussianFilterSize)).map((_, i) => {
			return math.exp(-(j*j+i*i)/(2/sigma/sigma))/(2*math.PI*sigma*sigma);
		}));

	const gaussianImg = conv.conv(img, imgSize, gaussianFilter, [gaussianFilterSize, gaussianFilterSize], {mode:conv.EXPAND});

	// Sobelフィルタ作成
	const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
	const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
	const filterSizes = [sobelX.length, sobelX[0].length];

	// Sobelフィルタ適用
	const sobelXImg = conv.conv(gaussianImg, imgSize, sobelX, filterSizes, {mode:conv.EXPAND});
	const sobelYImg = conv.conv(gaussianImg, imgSize, sobelY, filterSizes, {mode:conv.EXPAND});

	const sobelImg = map(sobelXImg, (v, i, j) => {
		const r = math.sqrt(v*v+sobelYImg[j][i]*sobelYImg[j][i]);
		return (r>255?255:r)/255;
	});

	// エッジに直行する角度の計算
	const thetaImg = map(sobelXImg, (v, i, j) => math.atan2(sobelYImg[j][i], v));

	// non maximum supperession処理
	const nmsImg = map(sobelImg, (v, i, j, img) => {
		const theta = thetaImg[j][i];
		let di = 0;
		let dj = 0;
		const t = math.abs(theta);
		if(t < math.PI*3/8 || t > math.PI*5/8){
			di = 1;
		}
		if(t > math.PI/8 && t < math.PI*7/8){
			dj = (theta<0?theta+math.PI:theta)<(math.PI/2)?1:-1;
		}
		if((img[j+dj]?(img[j+dj][i+di] > v):true) || (img[j-dj]?(img[j-dj][i-di] > v):true)){
			return 0;
		}
		return v;
	});

	// hysteresis threshold処理
	return map(nmsImg, (v, i, j, img) => {
		if(v < thresholdLow)return 0;
		if(v > thresholdHigh)return v*255;
		const theta = thetaImg[j][i];
		let di = 0;
		let dj = 0;
		const t = math.abs(theta);
		if(t < math.PI*3/8 || t > math.PI*5/8){
			dj = 1;
		}
		if(t > math.PI/8 && t < math.PI*7/8){
			di = (theta<0?theta+math.PI:theta)<(math.PI/2)?-1:1;
		}
		if((img[j+dj]?(img[j+dj][i+di] > thresholdHigh):false) || (img[j-dj]?(img[j-dj][i-di] > thresholdHigh):false)){
			return v*255;
		}
		return 0;
	});
}
