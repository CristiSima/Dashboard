import pathlib
import os
import sys

cd=str(pathlib.Path(__file__).parent.absolute())
os.chdir(cd)
sys.path[0]=cd

from main import export
