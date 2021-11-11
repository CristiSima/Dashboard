import pathlib
import importlib
import sys
import os

for module in pathlib.Path(__file__).parent.iterdir():
	if( not module.is_dir()  or module.name=="__pycache__"):
		continue
	print("Importing:",module.name)
	temp=importlib.import_module("API_modules."+module.name)
