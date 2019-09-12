import numpy as np
import cv2
import math

import sys, os

def weightFunction(Ii, Ij, sigma_T, Yi, Yj, sigma_Y):
	a = math.acos(np.dot(Ii, Ij))
	return math.exp(-(a**2/sigma_T + (Yi-Yj)**2/sigma_Y))

def Energy(imgNormalize, sInvert, R, weights):
	ER = R[1:-1, 1:-1] - weights[0]*R[:-2, :-2]
	ER -= weights[1]*R[:-2, 1:-1]
	ER -= weights[2]*R[:-2, 2:]
	ER -= weights[3]*R[1:-1, 2:]
	ER -= weights[4]*R[2:, 2:]
	ER -= weights[5]*R[2:, 1:-1]
	ER -= weights[6]*R[2:, :-2]
	ER -= weights[7]*R[1:-1, :-2]

	ER = (ER**2).sum()

	Es = imgNormalize[1:-1, 1:-1]*sInvert - R[1:-1,1:-1]
	Es = (Es**2).sum()

	return ER + Es

def EnergyDR(imgNormalize, sInvert, R, weights):
	ER = R[1:-1, 1:-1] - weights[0]*R[:-2, :-2]
	ER -= weights[1]*R[:-2, 1:-1]
	ER -= weights[2]*R[:-2, 2:]
	ER -= weights[3]*R[1:-1, 2:]
	ER -= weights[4]*R[2:, 2:]
	ER -= weights[5]*R[2:, 1:-1]
	ER -= weights[6]*R[2:, :-2]
	ER -= weights[7]*R[1:-1, :-2]

	ER = np.pad(ER, (1,1), 'edge')

	ERDR = ER[1:-1, 1:-1] - weigths[0]*ER[2:, 2:]
	ERDR -= weigths[1]*ER[2:, 1:-1]
	ERDR -= weigths[2]*ER[2:, :-2]
	ERDR -= weigths[3]*ER[1:-1, :-2]
	ERDR -= weigths[4]*ER[:-2, :-2]
	ERDR -= weigths[5]*ER[:-2, 1:-1]
	ERDR -= weigths[6]*ER[:-2, 2:]
	ERDR -= weigths[7]*ER[1:-1, 2:]

	ERDR -= imgNormalize[1:-1, 1:-1]*sInvert - R[1:-1, 1:-1]

	return ERDR

def EnergyDs(imgNormalize, sInvert, R):
	EDs = imgNormalize[1:-1, 1:-1]*(imgNormalize[1:-1, 1:-1]*sInvert - R[1:-1, 1:-1])

	return EDs


def intrinsicImage(image):
	img = np.array(image)
	height = img.shape[0]
	width = img.shape[1]
	weights = np.zeros((8, height, width, 3))

	img = np.pad(img, [(1,1),(1,1),(0,0)], 'edge')
	imgGray = np.array(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))
	imgGray = np.pad(imgGray, [(1,1),(1,1)], 'edge')
	imgNormalize = img / 255.0 / math.sqrt(3)
	sInvert = np.ones((height, width, 3)) / 2.0
	R = imgNormalize.copy()

	sigma_T = 3.23518
	sigma_Y = (imgGray[1:-1, 1:-1]**2).sum()/height/width-(imgGray[1:-1, 1:-1].sum()/height/width)**2

	for h in range(0, height):
		for w in range(0, width):
			weights[0, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h,w],     sigma_T, imgGray[h+1,w+1], imgGray[h,w], sigma_Y)
			weights[1, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h,w+1],   sigma_T, imgGray[h+1,w+1], imgGray[h,w+1], sigma_Y)
			weights[2, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h,w+2],   sigma_T, imgGray[h+1,w+1], imgGray[h,w+2], sigma_Y)
			weights[3, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h+1,w+2], sigma_T, imgGray[h+1,w+1], imgGray[h+1,w+2], sigma_Y)
			weights[4, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h+2,w+2], sigma_T, imgGray[h+1,w+1], imgGray[h+2,w+2], sigma_Y)
			weights[5, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h+2,w+1], sigma_T, imgGray[h+1,w+1], imgGray[h+2,w+1], sigma_Y)
			weights[6, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h+2,w],   sigma_T, imgGray[h+1,w+1], imgGray[h+2,w], sigma_Y)
			weights[7, h, w, 0] = weightFunction(imgNormalize[h+1, w+1], imgNormalize[h+1,w],   sigma_T, imgGray[h+1,w+1], imgGray[h+1,w], sigma_Y)

	for i in range(8):
		weights[i, :, :, 1] = weights[i, :, :, 0]
		weights[i, :, :, 2] = weights[i, :, :, 0]

	print(Energy(imgNormalize, sInvert, R, weights).shape)
	print(EnergyDR(imgNormalize, sInvert, R, weights).shape)
	print(EnergyDs(imgNormalize, sInvert, R).shape)


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
		intrinsicImage(image)

else:
	sys.exit()

