import numpy as np
import cv2
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import sys, os

def weightFunction(Ii, Ij, sigma_T, Yi, Yj, sigma_Y):
	a = math.acos(np.dot(Ii, Ij))
	return math.exp(-(a**2/sigma_T + (Yi-Yj)**2/sigma_Y))
	# return math.exp(-((Yi-Yj)**2)/sigma_Y)

def computeR(R, weights, h, w, Range, r):
	ER = np.zeros((h, w, 3))
	for dh in range(Range):
		for dw in range(Range):
			ER += weights[dh, dw] * R[dh:h+dh, dw:w+dw]

	return ER

def computeER(R, weights, h, w, Range, r):
	ER = np.copy(R[r:h+r, r:w+r])
	for dh in range(Range):
		for dw in range(Range):
			ER -= weights[dh, dw] * R[dh:h+dh, dw:w+dw]

	return ER

def computeERDR(ER, weights, h, w, Range, r):
	ERDR = ER[r:h+r, r:w+r]
	for dh in range(Range):
		for dw in range(Range):
			ERDR -= weights[dh, dw] * ER[Range-dh-1:h+Range-dh-1, Range-dw-1:w+Range-dw-1]

	return ERDR

def Energy(imgNormalize, sInvert, R, weights, h, w, Range, r):
	ER = computeER(R, weights, h, w, Range, r)

	ER = (ER**2).sum()

	Es = imgNormalize[r:-r, r:-r]*sInvert - R[r:-r,r:-r]
	Es = (Es**2).sum()

	# print(ER/Es)

	return ER + Es

def EnergyDR(imgNormalize, sInvert, R, weights, h, w, Range, r):
	ER = computeER(R, weights, h, w, Range, r)

	ER = np.pad(ER, [(r,r), (r,r),(0,0)], 'edge')

	ERDR = computeERDR(ER, weights, h, w, Range, r)

	ERDR -= imgNormalize[r:-r, r:-r]*sInvert - R[r:-r, r:-r]

	return ERDR

def EnergyDs(imgNormalize, sInvert, R, r):
	EDs = imgNormalize[r:-r, r:-r]*(imgNormalize[r:-r, r:-r]*sInvert - R[r:-r, r:-r])

	return EDs.sum(axis = 2)

def computeWeights(img, imgGray, h, w, R, r, sigma_Y, sigma_T):
	weights = np.zeros((R, R))
	for dh in range(R):
		for dw in range(R):
			weights[dh, dw] = weightFunction(img[h, w], img[h+dh-r, w+dw-r], sigma_T, imgGray
				[h, w], imgGray[h+dh-r, w+dw-r], sigma_Y)

	weights[r, r] = 1

	weights /= weights.sum()

	return weights


def intrinsicImage(image):
	img = np.array(image).astype('float')
	height = img.shape[0]
	width = img.shape[1]
	Range = 5
	n_R = 1/100000
	n_s = 1/10000
	a_R = 0.9
	a_s = 0.9
	r = int((Range-1)/2)
	weights = np.zeros((Range, Range, height, width, 3))

	img = np.pad(img, [(r,r),(r,r),(0,0)], 'edge')
	imgGray = np.array(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)).astype('float')
	imgGray = np.pad(imgGray, [(r,r),(r,r)], 'edge')
	imgNormalize = img / 255.0 / math.sqrt(3)
	sInvert = np.ones((height, width, 3))
	# sInvert = np.ones((height, width, 3)) / 255.0
	# sInvert = np.zeros((height, width, 3))
	# sInvert[:, :, 0] = 255/(imgGray[r:-r, r:-r]+0.1)
	sInvert[:,:,1] = sInvert[:,:,0]
	sInvert[:,:,2] = sInvert[:,:,0]
	R = imgNormalize.copy()

	sigma_T = 3.23518
	sigma_Y = (imgGray[r:-r, r:-r]**2).sum()/height/width-(imgGray[r:-r, r:-r].sum()/height/width)**2

	for h in range(0, height):
		for w in range(0, width):
			weights[:, :, h, w, 0] = computeWeights(imgNormalize, imgGray, h+r, w+r, Range, r, sigma_Y, sigma_T)
			# weight = weights[r, r, h, w, 0]
			# weights[:, :, h, w, 0] /= -weight
			# weights[r, r, h, w, 0] = 1 / weight

	weights[:, :, :, :, 1] = weights[:, :, :, :, 0]
	weights[:, :, :, :, 2] = weights[:, :, :, :, 0]

	# print(Energy(imgNormalize, sInvert, R, weights))
	# print(EnergyDR(imgNormalize, sInvert, R, weights).shape)
	# print(EnergyDs(imgNormalize, sInvert, R).shape)

	# E = Energy(img, sInvert, R, weights)
	imgNormalize = imgNormalize * math.sqrt(3)
	E = Energy(imgNormalize, sInvert, R, weights, height, width, Range, r)
	print(E)
	preE = 0
	v_R = 0
	v_s = 0

	# data = []
	# data.push(E)
	# dataCount = 0

	while True:
		# EdR = EnergyDR(img, sInvert, R, weights)
		# Eds = EnergyDs(img, sInvert, R)

		# EdR = EnergyDR(imgNormalize, sInvert, R, weights, height, width, Range, r)
		# Eds = EnergyDs(imgNormalize, sInvert, R, r)
		# v_R = a_R*v_R - n_R*EdR
		# v_s = a_s*v_s - n_s+Eds
		# R[r:-r, r:-r] = R[r:-r, r:-r] + v_R
		# sInvert[:,:,0] = sInvert[:,:,0] + v_s
		# # R[r:-r, r:-r] = R[r:-r, r:-r] - EdR/10000
		# # sInvert[:,:,0] = sInvert[:,:,0] - Eds/1000
		# sInvert[:,:,1] = sInvert[:,:,0]
		# sInvert[:,:,2] = sInvert[:,:,0]
		# sInvert[sInvert < 0] = 0

		R[r:-r, r:-r] = computeR(R, weights, height, width, Range, r)
		sInvert = R[r:-r, r:-r]/(imgNormalize[r:-r, r:-r]+0.0001)
		sInvert[sInvert < 1] = 1
		sInvert[:,:,0] = sInvert.mean(axis=2)
		sInvert[:,:,1] = sInvert[:,:,0]
		sInvert[:,:,2] = sInvert[:,:,0]
		R[r:-r, r:-r] = imgNormalize[r:-r, r:-r]*sInvert
		# R[R < 0] = 0
		R[R > 1] = 1

		preE = E
		# E = Energy(img, sInvert, R, weights)
		E = Energy(imgNormalize, sInvert, R, weights, height, width, Range, r)
		print('E = {:.3f} dE = {:.3f}'.format(E, preE - E))

		if np.isinf(E):
			print('E is inf')
			break

		if preE - E < 0.1:
		# if abs(preE - E) < 0.1:
			break
		# R[R < 0] = 0
		# R[R > 1] = 1

		# if dataCount == 10:
		# 	dataCount = 0
		# 	data.push(E)

		# if 'q' == cv2.waitKey(1):
		# 	break

		# cv2.namedWindow('window')
		# cv2.imshow('window', (R*255).astype('uint8'))
		# cv2.waitKey(0)
		# cv2.destroyAllWindows()

	print('R < 0 : ', sum(R < 0).sum())
	print('R > 1 : ', sum(R > 1).sum())
	# print(R[R > 1])
	print('sInv < 0 : ', sum(sInvert < 1).sum())
	print('sInv > 1 : ', sum(sInvert >= 1).sum())
	# print(sInvert[sInvert > 1])

	return R[r:-r, r:-r], 1/sInvert



argv = sys.argv

if len(argv) == 1:
	sys.exit()

filePath = argv[1]

if os.path.exists(filePath):
	print('exists path : ' + filePath)

	if os.path.isdir(filePath):
		print('this path is directory path')

	elif os.path.isfile(filePath):
		print('this path is file path')

		print('extend : ' + os.path.splitext(filePath)[1])

		image = cv2.imread(filePath)
		R, s = intrinsicImage(image)

		# _img = (R*s*255).astype('uint8')

		# plt.imshow(_img)
		# plt.show()

		cv2.namedWindow('window')
		cv2.imshow('window', (R*255).astype('uint8'))
		cv2.waitKey(0)
		cv2.destroyAllWindows()

else:
	sys.exit()

