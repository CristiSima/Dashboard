import os
import time
import subprocess
import utils

from __main__ import app, socketio
from flask_socketio import emit

import API_modules

@socketio.event
def gettime(id,header=""):
	print("time")
	emit(id,header+str(time.time()))

@socketio.event
def echo(id,req,header=""):
	print(req)
	emit(id,header+req)

# async def sysexec(websocket,req,header=""):
# 	if("|192.168" in ("|"+websocket.remote_address[0])):
# 		await websocket.send(header+subprocess.run(req.split("|"), capture_output=True).stdout.decode("utf-8"))
# 	else:
# 		print(websocket.remote_address,"tried sysexec:",req)
# 		# await websocket.close()
