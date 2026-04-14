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
    actions = np.array(["Light", 'Dish', 'Phone'])
    actionsChinese = np.array(["燈", '盤子', '手機'])
    model_name = ('./static/model/latest/Light, Dish, Phone.h5')
    random_integer = random.randint(0, len(actions) - 1)
    load(actions, actionsChinese, model_name, random_integer)
