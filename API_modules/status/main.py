import os
import time
import subprocess
import utils

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

export={
	"space":get_space,
	"docker":get_docker,
	"top":get_top
}
