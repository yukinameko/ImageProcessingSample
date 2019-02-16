const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');

module.exports = (img) => {
	const sizes = [img.length, img[0].length];
	// Sobelフィルタ作成
	const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
	const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
	const filterSizes = [sobelX.length, sobelX[0].length];

	// Sobelフィルタ適用
	const edgeXImg = conv.conv(img, sizes, sobelX, filterSizes, {mode:conv.EXPAND});
	const edgeYImg = conv.conv(img, sizes, sobelY, filterSizes, {mode:conv.EXPAND});

	const sobelImg =map(edgeXImg, (v, i, j) => {
		const r = math.sqrt(v*v+edgeYImg[j][i]*edgeYImg[j][i]);
		return r>255?255:r;
	});

	return {sobelImg:sobelImg, sobelX:sobelX, sobelY:sobelY};
}
