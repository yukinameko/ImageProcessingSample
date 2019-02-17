const cv = require('opencv4nodejs');
const math = require('mathjs');

const conv = require('../image_modules/convolution.js');
const map = require('../image_modules/map.js');
const bin = require('../image_modules/binary.js');
const sobel = require('../image_modules/sobel.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode colorEdge <input image path> (<split size>) (<threshold>)');
	process.exit(1);
}

// 画像データ取得
const image = cv.imread(argv[0]);
const img = image.getDataAsArray();

// 定数設定
let splitsize = 64;
let threshold = 1;
if(argv.length == 3){
	splitsize = argv[1]|0;
	threshold = argv[2]-0;
}

// ガウシアンフィルタ設定
const gaussianFilterSize = 5;
const gaussianFilterSizeHalf = (gaussianFilterSize-1)/2;
const sigma = gaussianFilterSizeHalf/2;
const gaussianFilter = Array.from(new Array(gaussianFilterSize)).map((_, j) =>
	Array.from(new Array(gaussianFilterSize)).map((_, i) => {
		return math.exp(-(j*j+i*i)/(2/sigma/sigma))/(2*math.PI*sigma*sigma);
	}));

// 変数準備
const imgBGR = [];
const imgBGRbin = [];
const imgBGRsobel = [];
const sizes = image.sizes;
const rowNum = sizes[0]/splitsize;
const colNum = sizes[1]/splitsize;

// 色ごとに操作
for(let n=0; n<3; n++){
	// 単色のデータ取得
	const v = map(img, v=>v[n]);
	// ガウシアンフィルタの適用
	const vGaus = conv.conv(v, image.sizes, gaussianFilter, [gaussianFilterSize,gaussianFilterSize], {mode:conv.EXPAND});
	const val = map(v, v=>0);
	const valBin = map(v, v=>0);

	// 小領域ごとに処理
	for(let j=0; j<rowNum; j++){
		for(let i=0; i<colNum; i++){
			const img_small = v.slice(j*splitsize, (j+1)*splitsize).map(v => v.slice(i*splitsize, (i+1)*splitsize));
			
			// otsuの2値化
			const img_smallbin = (img => {
				maxVal = 255;
				const hystgram = Array.from(new Array(256)).fill(0);
				let t = 0;
				let sum = 0;
				let sumPow = 0;
				let omg = img.length*img[0].length;
				for(let V of img){
					for(let v of V){
						hystgram[v]++;
						sum += v;
						sumPow += v*v;
					}
				}
				// 全体平均の計算
				const mean = sum/omg;
				if(mean == 0){
					return map(img, v => 0);
				}

				let omg1 = 0;
				let sum1 = 0;
				let sigmab_max = 0;
				for(let [i, n] of hystgram.entries()){
					omg1 += n;
					sum1 += i*n;
					const omg2 = omg - omg1;
					const sum2 = sum - sum1;
					const m = sum1/omg1 - sum2/omg2;
					const sigmab = omg1*omg2*m*m;
					if(sigmab > sigmab_max){
						sigmab_max = sigmab;
						t = i;
					}
				}
				sigmab_max /= omg*omg;
				// 全体平均と分散による閾値処理
				if(sigmab_max/mean < threshold){
					return map(img, v => 0);
				}
				return map(img, v => t<v?maxVal:0);
			})(img_small);

			// Sobelフィルタの適用
			const img_smallsobel = sobel(img_smallbin).sobelImg;

			// 画像の結合処理
			for(let l=0; l<splitsize; l++){
				for(let k=0; k<splitsize; k++){
					if(j*splitsize+l < sizes[0] && i*splitsize+k < sizes[1]){
						valBin[j*splitsize+l][i*splitsize+k] = img_smallbin[l][k];
						val[j*splitsize+l][i*splitsize+k] = img_smallsobel[l][k];
					}
				}
			}
		}
	}
	// 2値化画像
	imgBGRbin[n] = valBin;
	// エッジ画像
	imgBGRsobel[n] = val;
}
// RGB画像に戻す処理
const imgBin = map(imgBGRbin[0], (v,i,j) => [v, imgBGRbin[1][j][i], imgBGRbin[2][j][i]]);
// いずれかの色画像にエッジがあればカラー画像のエッジとして処理
const imgEdge = map(imgBGRsobel[0], (v,i,j) => (v+imgBGRsobel[1][j][i]+imgBGRsobel[2][j][i])>0?255:0);

const imageBin = new cv.Mat(imgBin, cv.CV_8UC3);
const imageEdge = new cv.Mat(imgEdge, cv.CV_8UC1);

cv.imshow('bin', imageBin);
cv.imshow('edge', imageEdge);
cv.waitKey();

cv.imwrite('../outImage/colorEdge-binary.png', imageBin);
cv.imwrite('../outImage/colorEdge.png', imageEdge);
