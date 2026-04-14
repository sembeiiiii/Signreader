# 使用官方的 Python 映像作為基礎映像
FROM python:3.9-alpine

# 設置工作目錄
WORKDIR /app
# ADD . /app

# 複製 requirements.txt 到工作目錄
COPY requirements.txt .

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 安裝 requirements.txt 中列出的套件
RUN pip install -r requirements.txt


# 複製必要的文件和資料夾
COPY . .

EXPOSE 5500

# 指定容器啟動時執行的命令
CMD ["python", "app.py"]
