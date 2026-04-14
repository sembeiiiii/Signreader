import cv2
import numpy as np
from matplotlib import pyplot as plt
import mediapipe as mp
import sys
import os
from utils import load
import random
sys.stdout.reconfigure(encoding='utf-8')


#用餐
def pre():
    actions = np.array(["Noodles", 'Pig', 'Rice'])
    actionsChinese = np.array(["麵", '豬', '飯'])
    model_name = ('./static/model/latest/Noodles,Pig,Rice.h5')
    random_integer = random.randint(0, len(actions) - 1)
    load(actions, actionsChinese, model_name, random_integer)
