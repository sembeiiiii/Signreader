from flask import Flask, render_template, request, redirect, url_for
import rec0, rec1, rec2, rec3, rec4, rec5,rec6,rec7
from utils import load
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('page.html')

@app.route('/book_upNav.html')
def book_upNav():
    return render_template('book_upNav.html')  

@app.route('/card.html')
def card():
    return render_template('card.html')  

@app.route('/cardTest.html')
def cardTest():
    return render_template('cardTest.html') 

@app.route('/home.html')
def home():
    return render_template('home.html')  

@app.route('/page.html')
def page():
    return render_template('page.html')  

# @app.route('/rec0', methods=['POST'])
# def process_form():
#     # 在这里调用rec.py中的函数
#     rec0.pre()  # rec.py中有一个名为pre的函数
#     return redirect(url_for('cardTest'))

rec_functions = {
    0: rec0,
    1: rec1,
    2: rec2,
    3: rec3,
    4: rec4,
    5: rec5,
    6: rec6,
    7: rec7
}
@app.route('/rec<int:index>', methods=['POST'])
def process_form(index):
    # 确保 index 在合法范围内
    if index not in rec_functions:
        return "Invalid index", 400

    # 根据索引调用相应的函数
    rec_functions[index].pre()  # 假设 rec.py 中的函数名为 pre

    # 重定向到 cardTest 路由
    return redirect(url_for('cardTest'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5500)
