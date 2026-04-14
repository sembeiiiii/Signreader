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
    actions = np.array(["Money", 'Where', 'CreditCard'])
    actionsChinese = np.array(["錢", '哪裡', '信用卡'])
    model_name = ('./static/model/latest/Money, Where, CreditCard.h5')
    random_integer = random.randint(0, len(actions) - 1)
    load(actions, actionsChinese, model_name, random_integer)

