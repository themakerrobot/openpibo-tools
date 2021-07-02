import os
import sys
import time
from threading import Thread

# 상위 디렉토리 추가 (for utils.config)
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from utils.config import Config as cfg

# openpibo 라이브러리 경로 추가
sys.path.append(cfg.OPENPIBO_PATH + '/lib')

'''
oled
audio
motor
mic
camera
neopixel
pir
touch
button
dc
battery
'''
from oled.oledlib import cOled
from audio.audiolib import cAudio
from motion.motionlib import cMotion
from device.devicelib import cDevice

def oled():
  oled_obj.set_font(size=30)
  oled_obj.clear()
  oled_obj.draw_text((0, 0), "Oled")
  oled_obj.draw_text((0, 30), "Testing...")
  oled_obj.show()
  time.sleep(5)
  oled_obj.clear()
  oled_obj.show()

def audio():
  audio_obj.play(filename=cfg.TESTDATA_PATH+"/test.mp3", out='local', volume=-2000)
  time.sleep(5)
  audio_obj.stop()

def motor():
  for i in range(10):
    motion_obj.set_speed(i, 30)
    motion_obj.set_acceleration(i, 0)
    motion_obj.set_motor(i, 10)
    time.sleep(0.5)
    motion_obj.set_motor(i,-10)
    time.sleep(0.5)
    motion_obj.set_motor(i, 0)
    time.sleep(1)

def mic():
  cmd = "arecord -D dmic_sv -c2 -r 16000 -f S32_LE -d 5 -t wav -q -vv -V streo stream.raw;sox stream.raw -c 1 -b 16 stream.wav;rm stream.raw"
  os.system(cmd)
  audio_obj.play(filename="stream.wav", out='local', volume=-2000)
  time.sleep(5)
  audio_obj.stop()

def camera():
  cmd = "raspistill -hf -vf -o test.jpg"
  os.system(cmd)

def neopixel():
  device_obj.send_raw("#20:255,0,0!")
  time.sleep(2)
  device_obj.send_raw("#20:0,255,0!")
  time.sleep(2)
  device_obj.send_raw("#20:0,0,255!")
  time.sleep(2)
  device_obj.send_raw("#20:0,0,0!")

def mcu():
  system_check_time = time.time()
  start_time = time.time()

  code = ['PIR', 'TOUCH', 'DC', 'BUTTON'] 

  device_obj.send_cmd(device_obj.code['PIR'], "on")
  data = device_obj.send_cmd(device_obj.code['BATTERY'])
  print(" [BATTERY]: {}".format(data.split(':')[1]))
  while True:
    if time.time() - system_check_time > 1:  # 시스템 메시지 1초 간격 전송
      data = device_obj.send_cmd(device_obj.code['SYSTEM']).split(':')[1].split('-')
      for i in range(4):
        if data[i] != '':
            print(" [{}]: {}".format(code[i], data[i]))

      system_check_time = time.time()

    if time.time() - start_time > 30:
      break

    time.sleep(0.01)

if __name__ == "__main__":

  items = {
    'oled':{"f":oled, "state":"ready"},
    'audio':{"f":audio, "state":"ready"},
    'motor':{"f":motor, "state":"ready"},
    'mic':{"f":mic, "state":"ready"},
    'camera':{"f":camera, "state":"ready"},
    'neopixel':{"f":neopixel, "state":"ready"},
    'mcu':{"function":mcu, "state":"ready"},
  }

  oled_obj = cOled(conf=cfg)
  audio_obj = cAudio()
  motion_obj = cMotion(conf=cfg)
  device_obj = cDevice()

  while True:
    os.system('clear')
    print("====================HARDWARD_TEST====================")
    print(" - oled                             ...", items['oled']['state'])
    print(" - audio                            ...", items['audio']['state'])
    print(" - motor                            ...", items['motor']['state'])
    print(" - mic                              ...", items['mic']['state'])
    print(" - camera                           ...", items['camera']['state'])
    print(" - neopixel                         ...", items['neopixel']['state'])
    print(" - mcu(pir|touch|button|dc|battery) ...", items['mcu']['state'])
    print("=====================================================")
    cmd = input("Input > ")
  
    if cmd in items:
      print("{} Testing ...".format(cmd.upper()))
      items[cmd]['f']()
      items[cmd]['state'] = "done"
      print("{} ... PASS".format(cmd.upper()))
    else:
      print("No such command:", cmd)
    time.sleep(2)
