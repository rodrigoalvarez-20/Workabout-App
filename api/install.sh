if which python3 > /dev/null 2>&1;
then
    #Python is installed
    echo "Python instalado"
else
    #Python is not installed
    echo "Python no instalado"
    sudo add-apt-repository ppa:deadsnakes/ppa
    sudo apt update
    sudo apt install python3.8 -y
fi

python3 --version

sudo apt install -y python3-pip python3-virtualenv python3-venv

cd ~/workabout-api
#pip3 install setuptools-rust
pip3 install fastapi pydantic pyjwt pymongo python_dotenv bcrypt random_object_id uvicorn pymongo[srv]

cd