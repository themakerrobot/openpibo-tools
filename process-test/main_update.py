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
from vision.visionlib import cCamera

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
  motor_list = ['Right-foot', 'Right-leg', 'Right-arm', 'Right-hand', 'Head-shake', 'Head-nod', 'Left-foot', 'Left-leg', 'Left-arm', 'Left-hand']
  is_success = True
  for i in range(10):
    print(f"({i+1}/10) '{motor_list[i]}' motor test ...")
    motion_obj.set_speed(i, 30)
    motion_obj.set_acceleration(i, 0)
    motion_obj.set_motor(i, 10)
    time.sleep(0.5)
    motion_obj.set_motor(i,-10)
    time.sleep(0.5)
    motion_obj.set_motor(i, 0)
    time.sleep(1)
    while True:
      result = input('Works well? (y/n/c) : ')
      print()
      if result.upper() in ['Y', 'YES']:
        break
      elif result.upper() in ['N', 'NO']:
        is_success = False
        break
      elif result.upper() in ['C', 'CANCEL']:
        return False
      else:
        print("Please type 'y' or 'n'")
  return is_success

def mic():
  cmd = "arecord -D dmic_sv -c2 -r 16000 -f S32_LE -d 5 -t wav -q -vv -V streo stream.raw;sox stream.raw -c 1 -b 16 stream.wav;rm stream.raw"
  os.system(cmd)
  audio_obj.play(filename="stream.wav", out='local', volume=-2000)
  time.sleep(5)
  audio_obj.stop()

def camera():
  img = camera_obj.read()
  img = camera_obj.convert_img(img)
  camera_obj.imwrite("test.jpg", img)
  oled_obj.draw_image("test.jpg")
  oled_obj.show()
  time.sleep(5)
  oled_obj.clear()
  oled_obj.show()

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
  from rich import print
  from rich.console import Console
  from rich.table import Table

  items = {
    'oled':{"_func":oled, "state":"ready"},
    'audio':{"_func":audio, "state":"ready"},
    'motor':{"_func":motor, "state":"ready"},
    'mic':{"_func":mic, "state":"ready"},
    'camera':{"_func":camera, "state":"ready"},
    'neopixel':{"_func":neopixel, "state":"ready"},
    'mcu':{"_func":mcu, "state":"ready"},
  }

  oled_obj = cOled(conf=cfg)
  audio_obj = cAudio()
  motion_obj = cMotion(conf=cfg)
  device_obj = cDevice()
  camera_obj = cCamera()

  invalid_cmd = False

  while True:
    os.system('clear')
    console = Console()
    table = Table(show_header=True, header_style="bold cyan")
    table.add_column("HARDWARE_TEST                 ")
    table.add_column("STATE          ", justify="center")
    for item, value in items.items():
      table.add_row(
          f"{item}", value['state']
      )

    console.print(table)
    console.print('[yellow]# "quit" to exit[/yellow]')
    if invalid_cmd:
      print(f"[red]No such command: {cmd}[/red]")
    console.print('Input: ', end='')
    for item in items:
      console.print(f'[bold cyan]{item}[/bold cyan]', end=' >>> 'if item == 'mcu' else ' | ')
    cmd = input()

    if cmd == "quit":
      success_cnt = fail_cnt = no_test_cnt = 0
      for item, value in items.items():
        if 'success' in value['state']:
          success_cnt += 1
        elif 'fail' in value['state']:
          fail_cnt += 1
        else:
          no_test_cnt += 1

      print("[green]success[/green]:   ", success_cnt)
      print("[red]fail[/red]   :   ", fail_cnt)
      print("no test:   ", no_test_cnt)
      break

    if cmd in items:
      invalid_cmd = False
      if cmd in ['mic', 'motor']:
          is_success = items[cmd]['_func']()
      else:
        with console.status("[bold cyan]{} Testing ...".format(cmd.upper())) as status:
          items[cmd]['_func']()
      if cmd == 'motor':
        if is_success:
          items[cmd]['state'] = '[green]success[/green]'
        else:
          items[cmd]['state'] = '[red]fail[/red]'
      while cmd != 'motor':
        result = input('Test success? (y/n): ')
        if result.upper() in ['Y', 'YES']:
          items[cmd]['state'] = '[green]success[/green]'
          break
        elif result.upper() in ['N', 'NO']:
          items[cmd]['state'] = '[red]fail[/red]'
          break
        else:
          print("Please type 'y' or 'n'")
    else:
      invalid_cmd = True