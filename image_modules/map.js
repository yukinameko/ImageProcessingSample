module.exports = (img, func) => img.map((v, j) => v.map((v, i) => func(v, i, j, img)));
