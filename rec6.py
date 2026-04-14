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
    actions = np.array(["Contact", 'Now', 'Data'])
    actionsChinese = np.array(["聯絡", '現在', '資料'])
    model_name = ('./static/model/latest/Contact, Now, Data.h5')
    random_integer = random.randint(0, len(actions) - 1)
    load(actions, actionsChinese, model_name, random_integer)
