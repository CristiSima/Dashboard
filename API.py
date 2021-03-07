import os
import time
import subprocess

def parse(req):
	pass
	Oreq=req
	target=main
	while type(target)==type({}):
		if("|" in req):
			key,req=req[:req.find("|")],req[req.find("|")+1:]
		else:
			key,req=req,""
		# print(key,req)
		if(key in target):
			target=target[key]
		else:
			target=none
			print(websocket.remote_address,"tried:",Oreq)
	return target,req
async def gettime(websocket,req):
	await websocket.send(str(time.time()))
async def none(websocket,req):
	pass
async def continuous(websocket,req):
	while True:
		request=await websocket.recv()
		if(request=="close"):
			break
		met,request=parse(request)
		await met(websocket,request)
async def echo(websocket,req):
	await websocket.send(req)

async def sysexec(websocket,req):
	if("|192.168" in ("|"+websocket.remote_address[0])):
		await websocket.send(subprocess.run(req.split("|"), capture_output=True).stdout.decode("utf-8"))
	else:
		print(websocket.remote_address,"tried sysexec:",req)
		# await websocket.close()

async def get_space(websocket,req):
	data=subprocess.run(["df","/dev/sda1","-h","--output=used,avail,pcent"], capture_output=True).stdout.decode("utf-8").split("\n")[1].strip()
	while "  "in data:
		data=data.replace("  "," ")
	data=data.replace(" ","|")
	await websocket.send(req+"|"+data)
async def get_docker(websocket,req):
	data=subprocess.run(["docker","ps","--format","{{.Names}}|{{.State}}"], capture_output=True).stdout.decode("utf-8").strip()#.split("\n")
	await websocket.send(data)
async def get_top(websocket,req):
	data=subprocess.run(["top","-n","1","-bs"], capture_output=True).stdout.decode("utf-8").strip()#.split("\n")
	temp,data=data[:data.find("\n%Cpu")+1],data[data.find("\n%Cpu")+1:]
	data=data.replace(","," ")
	data=data[:data.find("PID")].replace(":"," ")+data[data.find("PID"):]
	while "  "in data:
		data=data.replace("  "," ")
	data="\n".join([line.strip() for line in data.split("\n")])
	data=data.replace(" ","|")
	data=data.replace("%Cpu","")
	data=data.replace("|0.0m|","||").replace("|0.0m|","||")#remove no mem usage
	data=data.replace("|S|0.0|","|S||").replace("|I|0.0|","|I||")#remove no CPU% usage
	data=data.replace("|0.0|0:","||0:")#remove no mem% usage
	data=data.replace("|0:00.00|","||")#remove no CPU time
	await websocket.send(temp+data)
	pass
main={
	"gettime":gettime,
	"continuous":continuous,
	"echo":echo,
	"sysexec":sysexec,
	"get":{
		"space":get_space,
		"docker":get_docker,
		"top":get_top
	},
	"none":none
}
