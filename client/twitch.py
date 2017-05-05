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

# mouse and keyboard
import pyautogui


screenWidth, screenHeight = pyautogui.size()

#import keyboard
#from keyboard import keyPoller



socketIO = SocketIO('fosse.co/8100/', 80, LoggingNamespace)

def click(x, y):
	pyautogui.moveTo(x, y, duration=0.5)
	pyautogui.click()


def on_msg(*args):
    #print('response', args)
    print(args)


def getCoords(move):
	x, y = (0, 0)
	if(move[0] == "C"):
		if(len(move) == 3):
			num = int(move[1] + move[2])
		else:
			num = int(move[1])

		spacing = 100
		xoffset = 600

		x = xoffset + (num*spacing)
		y = 750
		

	elif(move[0] == "B"):
		if(len(move) == 3):
			num = int(move[1] + move[2])
		else:
			num = int(move[1])

		spacing = 100
		xoffset = 600

		x = xoffset + (num*spacing)
		y = 1100

	elif(move[0] == "H" and move[1] != "H"):
		if(len(move) == 3):
			num = int(move[1] + move[2])
		else:
			num = int(move[1])

		spacing = 100
		xoffset = 600

		x = xoffset + (num*spacing)
		y = 1850

	elif(move == "HH"):
		x = 1500
		y = 1500

	elif(move == "PP"):
		x = 1750
		y = 1500

	elif(move == "FACE"):
		x = 1500
		y = 300
		
	elif(move == "END"):
		x = 2530
		y = 900

	return (x, y)


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


	# list of all moves
	allMoves = ["HH", "PP", "FACE", "END"]
	for i in range(16):
		i += 1
		allMoves.append("C"+str(i))
		allMoves.append("B"+str(i))
		allMoves.append("H"+str(i))


	# draw text, half opacity
	for i in range(len(allMoves)):
		move = allMoves[i]

		x, y = getCoords(move)
		w, h = d.textsize(move, fnt)

		#d.text((x,y), move, font=fnt, fill=(0,0,0,255))

		# reduce font size for large move names
		if(len(move) == 3):
			fnt = ImageFont.truetype('fonts/FreeMonoBold.ttf', 50)
		else:
			fnt = ImageFont.truetype('fonts/FreeMonoBold.ttf', 60)

		# draw dots for accuracy
		# also more transparent
		d.pieslice([x-10, y-10, x+10, y+10], 0, 360, fill=(255, 255, 255, 200), outline=None)

		# write text
		d.text((x-(w/2), y-(h/2)+40), move, font=fnt, fill=(255, 255, 255, 200))

		#d.text(((W-w)/2,(H-h)/2), move, fill="black")


	


	# combine images
	im = Image.alpha_composite(screenshot, txt)
	#out.show()

	




	# convert image to base64 string
	buffer = BytesIO()
	im.save(buffer, format="JPEG", quality=30)
	img_str = str(base64.b64encode(buffer.getvalue()).decode())
	socketIO.emit("image", img_str);
	socketIO.wait(0.5)


while True:

	# press U to execute moves determined by votes
	if win32api.GetAsyncKeyState(ord("U")):
		socketIO.emit("getMoves");
		socketIO.wait(2)

	# press I to update the image
	if win32api.GetAsyncKeyState(ord("I")):
		updateImage()
		time.sleep(0.1)

	# press escape to exit program
	if win32api.GetAsyncKeyState(win32con.VK_ESCAPE):
		break


	time.sleep(0.1)



#socketIO.wait(3)

# wait forever
#socketIO.wait()
