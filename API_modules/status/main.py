import os
import time
import subprocess
import utils

from __main__ import app, socketio
from flask_socketio import emit

@socketio.event
def get_space(id,header=""):
	data=subprocess.run(["df","/dev/sda1","-h","--output=source,used,avail,pcent"], capture_output=True).stdout.decode("utf-8").split("\n")[1].strip()
	data=utils.collapse_spaces(data)
	data=data.replace(" ","|")
	emit(id,header+data)

@socketio.event
def get_docker(id,header=""):
	data=subprocess.run(["docker","ps","--format","{{.Names}}|{{.State}}"], capture_output=True).stdout.decode("utf-8").strip()#.split("\n")
	emit(id,header+data)

@socketio.event
def get_top(id,header=""):
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

	emit(id,header+temp+data+"\n"+ps_data)
