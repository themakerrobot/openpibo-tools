#include "servo.hpp"
#include <napi.h>

Napi::Value Start(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int ret = 0;
  ret = devOpen();
  Napi::Number num = Napi::Number::New(env, ret);
  return num;
}

Napi::Value Stop(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int ret = 0;
  ret = devClose();
  Napi::Number num = Napi::Number::New(env, ret);
  return num;
}

Napi::Value Write(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  get_motor_profile(1,1,1);
  int ch = info[0].As<Napi::Number>().Int32Value();
  int val = info[1].As<Napi::Number>().Int32Value();
  int ret = SetTarget(ch, val);
  set_motor_profile(0,1,1);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value MWrite(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  int val[10];
  get_motor_profile(1,1,1);
  for(int i=0;i<10;i++)
    val[i] = info[i].As<Napi::Number>().Int32Value();

  int ret = SetMultiTarget(val);
  set_motor_profile(0,1,1);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value Move(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  int val[10];
  for(int i=0;i<10;i++)
    val[i] = info[i].As<Napi::Number>().Int32Value();
  int t = info[10].As<Napi::Number>().Int32Value();
 
  // v` = (0.25us / 10ms) * v = 10degree / time(ms)
  // v = (10 / 0.25) * 10degree / (time(ms)+alpha) = 40 * 10degree / (time + alpha)
  // alpha = 10ms
  // v = 40 * 10degree/(time+10)

  float op = (float)40/(float)(t+10)*1.1;
  //float op = (float)50/(float)t;
  get_motor_profile(1,1,1);
  for(int i = 0; i < 10;i++){
    if(val[i] == NS || val[i] == motor_pos[i])continue;
    int speed = abs(val[i]-motor_pos[i])*op;
    if(speed<4) speed=4;
    if(speed>50) speed=50;
    SetSpeed(i, speed);
    SetAcceleration(i, speed*0.8);
  }
  int ret = SetMultiTarget(val);
  set_motor_profile(0,1,1);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value TWrite(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  get_motor_profile(1,1,1);
  int ch = info[0].As<Napi::Number>().Int32Value();
  int val = info[1].As<Napi::Number>().Int32Value();
  int spd = info[2].As<Napi::Number>().Int32Value();
  int acc = info[3].As<Napi::Number>().Int32Value();
  
  int ret;
  ret = SetSpeed(ch, spd);
  ret = SetAcceleration(ch, acc);
  ret = SetTarget(ch, val);
  set_motor_profile(0,1,1);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value Move_1011(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  int l = info[0].As<Napi::Number>().Int32Value();
  int r = info[1].As<Napi::Number>().Int32Value();
  int ret = SetMove_1011(l, r);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value Speed(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  int ch = info[0].As<Napi::Number>().Int32Value();
  int val = info[1].As<Napi::Number>().Int32Value();
  int ret = SetSpeed(ch, val);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value Acceleration(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  int ch = info[0].As<Napi::Number>().Int32Value();
  int val = info[1].As<Napi::Number>().Int32Value();
  int ret = SetAcceleration(ch, val);
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Value Init(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  //devOpen();
  for(int i = 0; i < 10;i++)
  {
    SetSpeed(i, 30);
    SetAcceleration(i, 30);
  }
  //ServoInit();
  int pPos[10] = {0,0,-800,0,0,0,0,0,800,0};
  get_motor_profile(0, 1, 1);
  SetMultiTarget(pPos);
  set_motor_profile(0, 1, 1);
  int ret = ServoInit();
  Napi::Number num = Napi::Number::New(env, ret);
  //devClose();
  return num;
}

Napi::Object Func(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "start"), Napi::Function::New(env, Start));
  exports.Set(Napi::String::New(env, "stop"), Napi::Function::New(env, Stop));
  exports.Set(Napi::String::New(env, "write"), Napi::Function::New(env, Write));
  exports.Set(Napi::String::New(env, "mwrite"), Napi::Function::New(env, MWrite));
  exports.Set(Napi::String::New(env, "move"), Napi::Function::New(env, Move));
  exports.Set(Napi::String::New(env, "move_1011"), Napi::Function::New(env, Move_1011));
  exports.Set(Napi::String::New(env, "twrite"), Napi::Function::New(env, TWrite));
  exports.Set(Napi::String::New(env, "speed"), Napi::Function::New(env, Speed));
  exports.Set(Napi::String::New(env, "acceleration"), Napi::Function::New(env, Acceleration));
  exports.Set(Napi::String::New(env, "init"), Napi::Function::New(env, Init));
  return exports;
}

NODE_API_MODULE(servo, Func)
