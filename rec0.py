import cv2
import numpy as np
from matplotlib import pyplot as plt
import mediapipe as mp
import sys
import os
from utils import load
import random
sys.stdout.reconfigure(encoding='utf-8')

def pre():
    actions = np.array(["Fighting", 'Yes', 'No'])
    actionsChinese = np.array(["加油", '是', '不是'])
    model_name = ('./static/model/latest/Fighting, Yes, No.h5')
    random_integer = random.randint(1, len(actions) - 1)
    load(actions, actionsChinese, model_name, random_integer)

