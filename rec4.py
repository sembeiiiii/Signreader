import cv2
import numpy as np
from matplotlib import pyplot as plt
import mediapipe as mp
import sys
import os
from utils import load
import random
sys.stdout.reconfigure(encoding='utf-8')

# 交通
def pre():
    actions = np.array(["right", 'Drive', 'Night'])
    actionsChinese = np.array(["右轉", '開車', '晚上'])
    model_name = ('./static/model/latest/right, Drive, Night.h5')
    random_integer = random.randint(0, len(actions) - 1)
    load(actions, actionsChinese, model_name, random_integer)