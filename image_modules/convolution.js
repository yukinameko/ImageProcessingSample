module.exports = (img, imgSizes, filter, filterSize, func=null) => {
	const cols = imgSizes[1];
	const rows = imgSizes[0];
	const filterCols = filterSize[0];
	const filterRows = filterSize[0];
	const filterColsHalf = filterCols/2;
	const filterRowsHalf = filterRows/2;

	if(func == null){
		return Array.from(new Array(rows)).map((_, j) => Array.from(new Array(cols)).map((v, i) => 
			filter.reduce((pre, cur, l) => {
				const row = j+l-filterRows;
				if(row < 0 || rows <= row){
					return 0;
				}
				return pre+cur.reduce((pre, cur, k) => {
					const col = i+k-filterCols;
					if(col < 0 || cols <= col){
						return 0;
					}
					return pre+img[row][col]*cur;
				}, 0);
			}, 0)
		));
	}else{
		return Array.from(new Array(rows)).map((_, j) => Array.from(new Array(cols)).map((v, i) => 
			func(filter.reduce((pre, cur, l) => {
				const row = j+l-filterRows;
				if(row < 0 || rows <= row){
					return 0;
				}
				return pre+cur.reduce((pre, cur, k) => {
					const col = i+k-filterCols;
					if(col < 0 || cols <= col){
						return 0;
					}
					return pre+img[row][col]*cur;
				}, 0);
			}, 0))
		));
	}
};
