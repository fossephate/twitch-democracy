# Copyright (C) Matthew Fosse




# win32
import msvcrt
import win32api
import win32con
import win32com
import win32com.client
import win32gui
import win32ui

# socket.io
from socketIO_client import SocketIO, LoggingNamespace

# pillow
import PIL
from PIL import Image, ImageDraw, ImageFont
from PIL import ImageGrab

# image utils
import base64
from io import StringIO
from io import BytesIO

# misc
import time
import random

# mouse and keyboard
import pyautogui


screenWidth, screenHeight = pyautogui.size()

#import keyboard
#from keyboard import keyPoller



socketIO = SocketIO('fosse.co/8100/', 80, LoggingNamespace)
moveList = {}

gridWidth = 20
gridHeight = 10
letters = "ABCDEFGHIJKLMNO"


horizontalSpacing = screenWidth / gridWidth
verticalSpacing = screenHeight / gridHeight
xoffset = 50
yoffset = 50

for i in range(gridHeight):
	for j in range(gridWidth):
		x = xoffset + (j*horizontalSpacing)
		y = yoffset + (i*verticalSpacing)
		num = j
		letter = letters[i]
		move = str(letter + str(num))
		moveList[move] = (x, y)



def click(x, y):
	pyautogui.moveTo(x, y, duration=0.5)
	pyautogui.click()


def on_msg(*args):
    #print('response', args)
    print(args)


def getCoords(move):
	return moveList[move]


def executeMoves(*args):
	#for i in range(len(args)):
	#	print(args[i])
	#	print("test")
	moves = args[0]["moves"]
	for i in range(len(moves)):
		move = moves[i]

		x, y = getCoords(move)
		click(x, y)

		time.sleep(1)

#socketIO.on('chat message', on_msg)
#socketIO.wait(seconds=10)

socketIO.on("executeMoves", executeMoves)



def updateImage():

	# capture screenshot
	#screenshot = PIL.ImageGrab.grab([0, 0, 3000, 2000])
	screenshot = PIL.ImageGrab.grab([0, 0, 1920, 1080]).convert('RGBA')

	# make a blank image for the text, initialized to transparent text color
	txt = Image.new('RGBA', screenshot.size, (255,255,255,0))

	# get a font
	fnt = ImageFont.truetype('fonts/FreeMono.ttf', 70)
	# get a drawing context
	d = ImageDraw.Draw(txt)

	# draw text, half opacity
	for move in moveList:

		x, y = getCoords(move)
		w, h = d.textsize(move, fnt)

		#d.text((x,y), move, font=fnt, fill=(0,0,0,255))

		# reduce font size for large move names
		if(len(move) > 3):
			fnt = ImageFont.truetype('fonts/FreeMonoBold.ttf', 20)
		else:
			fnt = ImageFont.truetype('fonts/FreeMonoBold.ttf', 25)

		# dotSize:
		dS = 4#10
		# vertical offset:
		vO = 20#40


		transparency = 150

		# draw dots for accuracy
		d.pieslice([x-dS, y-dS, x+dS, y+dS], 0, 360, fill=(255, 255, 255, transparency), outline=None)

		# write text
		d.text((x-(w/2), y-(h/2)+vO), move, font=fnt, fill=(255, 255, 255, transparency))

		#d.text(((W-w)/2,(H-h)/2), move, fill="black")

	# combine images
	im = Image.alpha_composite(screenshot, txt)
	#out.show()

	# convert image to base64 string
	buffer = BytesIO()
	im.save(buffer, format="JPEG", quality=30)#30

	img_str = str(base64.b64encode(buffer.getvalue()).decode())
	socketIO.emit("image", img_str);
	socketIO.wait(0.05)


while True:

	# press U to execute moves determined by votes
	if win32api.GetAsyncKeyState(ord("U")):
		socketIO.emit("getMoves");
		socketIO.wait(2)

	# press I to update the image
	# if win32api.GetAsyncKeyState(ord("I")):
	# 	updateImage()
	# 	time.sleep(0.1)

	updateImage()
	time.sleep(0.2)

	# press escape to exit program
	if win32api.GetAsyncKeyState(win32con.VK_ESCAPE):
		break


	time.sleep(0.1)



#socketIO.wait(3)

# wait forever
#socketIO.wait()
