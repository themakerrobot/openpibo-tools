## note
 #1
  - Delete total, speed/acceleration all command
  - update


## Installation
sudo ./install.sh

## Check
 - baudrate : 9600, 19200, 38400, 57600, 115200(default)

## Command List
 - servo help
 - servo version
 - servo init
 - servo profile init
 - servo profile offset set 1 2 3 4 5 6 7 8 9 10
 - servo profile offset get
 - servo profile pos get
 - servo profile record get
 - servo multiwrite pos0<-900~900> pos1<-900~900> ...
 - servo totalwrite pos0<-900~900> pos1<-900~900> ... pos9<-900~900> time(ms)<0~>
 - servo write channel<0~9> value<-900~900>
 - servo speed channel<0~9> value<0-255>
 - servo speed all value1<0-255> ...
 - servo acceleration channel<0~9> value<0-255>
 - servo acceleration all value1<0-255> ...

 - For Example:
  * servo write 0 0

