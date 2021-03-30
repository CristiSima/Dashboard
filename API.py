import os
import time
import subprocess
import utils

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

async def get_space(websocket,req,header=""):
	data=subprocess.run(["df","/dev/sda1","-h","--output=used,avail,pcent"], capture_output=True).stdout.decode("utf-8").split("\n")[1].strip()
	data=utils.collapse_spaces(data)
	data=data.replace(" ","|")
	await websocket.send(header+req+"|"+data)

async def get_docker(websocket,req,header=""):
	data=subprocess.run(["docker","ps","--format","{{.Names}}|{{.State}}"], capture_output=True).stdout.decode("utf-8").strip()#.split("\n")
	await websocket.send(header+data)

async def get_top(websocket,req,header=""):
	data=subprocess.run(["top","-n","1","-bs"], capture_output=True).stdout.decode("utf-8").strip()#.split("\n")
	temp,data=data[:data.find("\n%Cpu")+1],data[data.find("\n%Cpu")+1:]
	data=data.split("\n\n")[0]
	data=data.replace("%Cpu","")
	
	data=data.replace(","," ")
	data=data.replace(":"," ")
	data=utils.collapse_spaces(data)
	data="\n".join([line.strip() for line in data.split("\n")])
	data=data.replace(" ","|")

	ps_data=subprocess.run("ps -eo pid,user,pcpu,pmem,cputime,command --sort -pcpu,-pmem",shell=True, capture_output=True).stdout.decode("utf-8").strip()#.split("\n")
	ps_data=utils.collapse_spaces(ps_data)
	ps_data="\n".join([line.strip().replace(" ","|",5) for line in ps_data.split("\n")])

	await websocket.send(header+temp+data+"\n"+ps_data)
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
