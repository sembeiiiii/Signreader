import cv2
import numpy as np
from matplotlib import pyplot as plt
import mediapipe as mp
import sys
import os
from utils import load
import random
sys.stdout.reconfigure(encoding='utf-8')

# 醫療
def pre():
    actions = np.array(["Medicine", 'Also', 'Check'])
    actionsChinese = np.array(["藥", '還有', '檢查'])
    model_name = ('./static/model/latest/Medicine, Also, Check.h5')
    # random_integer = random.randint(0, len(actions) - 1)
    random_integer = 0
    load(actions, actionsChinese, model_name, random_integer)
