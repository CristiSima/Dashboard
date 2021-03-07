#!/bin/python
# WS server that sends messages at random intervals

import asyncio
import datetime
import random
import websockets
import http
import http.server
import os
import API
# path to .py
os.chdir("/Servers/Dashboard")
extentionToMIME = {
	"html" : "text/html",
	"css" : "text/css",

	"js" : "text/javascript",
	"json" : "application/json",


	"png" : "image/png",
	"mp3" : "audio/mpeg",

	"ico" : "image/vnd.microsoft.icon"
}

async def http_check(path, request_headers):
	# print(request_headers)
	isWS="Upgrade" in request_headers and request_headers["Upgrade"]=="websocket"
	if(isWS):
		return
	print("HTTP:",path)
	header=[]
	if os.path.abspath("") in os.path.abspath("Server_files"+path):
		path=os.path.abspath("Server_files"+path)
	else:
		return  http.HTTPStatus.MOVED_PERMANENTLY,[("Location", "/NAME"),],b""

	if "." not in path:
		path+=".html"
	if not os.path.exists(path):
		print(path)
		return  http.HTTPStatus.MOVED_PERMANENTLY,[("Location", "/NAME"),],b""

	file = open(path, "rb")
	data=file.read()
	file.close()
	header.append(("Content-type",extentionToMIME[path.split(".")[-1]]))
	return http.HTTPStatus.OK, header, data

async def Request(websocket, path):
	request=await websocket.recv()
	print("Request:",request)
	met,request=API.parse(request)
	await met(websocket,request)
	await websocket.close()

start_server = websockets.serve(Request, "0.0.0.0", 5678,process_request=http_check)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
