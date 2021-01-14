#!/bin/bash

sudo apt purge -y nodejs
curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

npm install express socket.io
cd servo

#make
#sudo make install
#make clean
npm install --unsafe-perm
