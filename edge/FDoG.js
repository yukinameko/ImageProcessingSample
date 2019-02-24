const cv = require('opencv4nodejs');
const math = require('mathjs');

const gaussianBlur = require('../image_modules/gaussian.js');
const map = require('../image_modules/map.js');
const sobel = require('../image_modules/sobel.js');
const normalize = require('../image_modules/normalize.js');
const { minMax } = require('../image_modules/min-max.js');

const argv = process.argv.slice(2);

if(argv.length < 1){
	console.log('error: not found argv'+argv.length+'\nnode FDoG <input image path> (<range> <sigma c> <sigma m> <tau>) (<output image path>)');
	process.exit(1);
}

// 関数定義
const G = (r, sig) => math.exp(-(r*r)/2/sig/sig)/math.sqrt(2*math.PI)/sig;
const Wm = (g, g_) => (1 + math.tanh(g_ - g))/2;
const Wd = (tx, ty, tx_, ty_) => tx*tx_ + ty*ty_;

// 定数定義
let sigM = 2.0;
let sigC = 1.1;
let tau = 0.5;
let range = 3;

if(argv.length >= 5){
	range = argv[1]|0;
	sigC = argv[2]-0;
	sigM = argv[3]-0;
	tau = argv[4]-0;
}
const sigS = sigC*1.6;
const rho = 0.997;

const T = parseInt(sigS*2+0.5);
const S = parseInt(sigM*2+0.5);

// 画像データ取得
const image = cv.imread(argv[0], cv.CV_8UC1);
const img = image.getDataAsArray();

const [height, width] = image.sizes;

// ノイズ除去
const imgGaus = gaussianBlur(img, {kSize:3});

// sobelフィルタ
let {sobelImg:g, sobelX:gx, sobelY:gy} = sobel(imgGaus);
sobelImg = normalize(g);
map(g, (v, i, j) => {
	if(v == 0)return;
	gx[j][i] /= v;
	gy[j][i] /= v;
	return;
});

// gx,gyを90度回転したものをtx,tyの初期値とする
let tx = map(gy, v => -v);
let ty = gx.concat();

// 正規化
g = normalize(g);

// ETFを複数回回すループ
for(let n=0;n<3;n++){
	console.log(`Edge Tangent Flow ${n} iteration`);

	const tx_cur = tx.concat();
	const ty_cur = ty.concat();

	// ETF計算
	map(g, (v, i, j) => {
		let tx_sum = 0;
		let ty_sum = 0;

		const tx_num = tx_cur[j][i];
		const ty_num = ty_cur[j][i];

		for(let l=-range; l<=range; l++){
			const j_ = j+l;
			if(j_ < 0 || j_ >= height)continue;
			for(let k=-range; k<=range; k++){
				const i_ = i+k;
				if(i_ < 0 || i_ >= width)continue;
				
				// 対象外領域は弾く
				const r = math.sqrt(k*k+l*l);
				if(r > range)continue;

				// 重み計算
				const w = Wm(v, g[j_][i_])*Wd(tx_num, ty_num, tx_cur[j_][i_], ty_cur[j_][i_]);

				tx_sum += tx_cur[j_][i_]*w;
				ty_sum += ty_cur[j_][i_]*w;
			}
		}

		// 正規化
		const r = math.sqrt(tx_sum*tx_sum + ty_sum*ty_sum);
		if(r != 0){
			tx_sum /= r;
			ty_sum /= r;
		}

		// tx,tyを更新
		tx[j][i] = tx_sum;
		ty[j][i] = ty_sum;
	});
}

// gx,gyを更新
gx = ty.concat();
gy = map(tx, v => -v);

// 定数定義
const THRESHOLD = math.cos(math.PI/8);

let He = img.concat();

// FDoGを複数回回すループ
for(let n=0;n<3;n++){
	console.log(`Flow Based DoG ${n} iteration`);

	// 直交方向に1次元DoGフィルタをかける
	const Hg = map(He, (_, i, j, img) => {
		const x = gx[j][i];
		const y = gy[j][i];
		if(x==0 && y==0)return 0;

		let Csum = 0;
		let Ssum = 0;
		let GCsum = 0;
		let GSsum = 0;

		// 角度に応じて探索方向を定める
		let dk = 0;
		let dl = 0;
		if(math.abs(x) < THRESHOLD){
			dl = 1;
		}
		if(math.abs(y) < THRESHOLD){
			dk = 1;
		}
		if(x*y < 0){
			dl = -1;
		}

		// DoG計算
		for(let l=-T; l<=T; l++){
			const di = l*dk;
			const dj = l*dl;
			const i_ = i + di;
			const j_ = j + dj;
			if(j_ < 0 || j_ >= height || i_ < 0 || i_ >= width)continue;

			const r = math.sqrt(di*di + dj*dj);
			gc = G(r, sigC);
			gs = G(r, sigS);
			GCsum += gc;
			GSsum += gs;
			Csum += img[j_][i_] * gc;
			Ssum += img[j_][i_] * gs;
		}
		return Csum/GCsum - rho*Ssum/GSsum;
	});

	// 流れ場に沿ってGaussianフィルタをかける
	He = map(Hg, (v, i, j, img) => {
		let x = tx[j][i];
		let y = ty[j][i];
		// 流れがなければ白地
		if(x==0 && y==0)return 255;

		sum = v;
		Gsum = G(0, sigM);

		// 接ベクトルの順方向と逆方向に探索
		for(let m=-1; m<2; m+=2){
			let r = 0;
			let i_ = i;
			let j_ = j;

			while(r < S){
				let di = 0;
				let dj = 0;
				if(math.abs(x) < THRESHOLD){
					dj = m;
				}
				if(math.abs(y) < THRESHOLD){
					di = m;
				}
				if(x*y < 0){
					dj *= -1;
				}
				j_ += dj;
				i_ += di;
				if(j_ < 0 || j_ >= height || i_ < 0 || i_ >= width)break;

				r += math.sqrt(di*di + dj*dj);
				const g = G(r, sigM);
				Gsum += g;
				sum += img[j_][i_]*g;

				x = tx[j_][i_];
				y = ty[j_][i_];
				if(x==0 && y==0)break;
			}
		}

		sum /= Gsum;

		// 閾値処理
		return (sum<0 && (1 + math.tanh(sum)) < tau) ? 0 : 255;
	});
}

const imageFDoG = new cv.Mat(He, cv.CV_8UC1);

cv.imshow('FDoG', imageFDoG);
cv.waitKey();

if(argv.length == 6){
	cv.imwrite(argv[5], imageFDoG);
}
