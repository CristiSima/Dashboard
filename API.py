import os
import time
import subprocess
import utils
import API_modules
# exit()

def split_element(req):
	return req[:req.find("|")],req[req.find("|")+1:]

def parse(req):
	pass
	Oreq=req
	target=main
	while type(target)==type({}):
		if("|" in req):
			key,req=split_element(req)
		else:
			key,req=req,""
		# print(key,req)
		if(key in target):
			target=target[key]
		else:
			target=none
			# print(websocket.remote_address,"tried:",Oreq)
			print("tried:",Oreq)
	return target,req

async def gettime(websocket,req,header=""):
	await websocket.send(header+str(time.time()))

async def none(websocket,req,header=""):
	pass

async def continuous(websocket,req):
	while True:
		request=await websocket.recv()
		if(request=="close"):
			break
		header,request=split_element(request)
		met,request=parse(request)
		await met(websocket,request,header+"|")

async def echo(websocket,req,header=""):
	await websocket.send(header+req)

async def sysexec(websocket,req,header=""):
	if("|192.168" in ("|"+websocket.remote_address[0])):
		await websocket.send(header+subprocess.run(req.split("|"), capture_output=True).stdout.decode("utf-8"))
	else:
		print(websocket.remote_address,"tried sysexec:",req)
		# await websocket.close()

main={
	"gettime":gettime,
	"continuous":continuous,
	"echo":echo,
	"sysexec":sysexec,
	"module":API_modules.modules,
	"none":none
}
