#!/bin/python
# WS server that sends messages at random intervals

import datetime
import random
import os
import pathlib
from flask import Flask, render_template, request, redirect, make_response, send_from_directory
from flask_socketio import SocketIO, emit
from threading import Lock

# sets path to .py
os.chdir(pathlib.Path(__file__).parent.absolute())

async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = '9f962e1ffa116b1becfdf2581129012f71792a53a9493bb2ce466a4d32ef720f68974042066266ba4a948bed48d4d275bd21e49cbc39044000840d1da571368a'
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()

@app.route('/')
def index():
	return send_from_directory("static","NAME.html")

@app.route('/favicon.ico')
def favicon():
	return send_from_directory("static","favicon.ico")

import API

if( __name__ == '__main__'):
	socketio.run(app,debug=True,host="0.0.0.0",port=5678)
