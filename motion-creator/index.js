const VERSION = 'motion#1';
//const DATA_PATH = './data/'
const exec = require('child_process').exec;
const profile = require('./motion_p');
const ioctl = require('./servo/ioctl.js');
const _BEFORE = [0,0,0,0,0,0,0,0,0,0];
const default_spd = [20,50,40,20, 20,10, 20,50,40,20];
const default_acc = [10,10,10,10, 10,10, 10,10,10,10];
const NS = 999;
let MOTION_FUNC = 0;
let interval = 0;
let timeout = 0;
/*
  -1 err
  0 next
  1 result
  2 state
  3 play request
  4 time 
  5 bd  //bus.storage.esServoCnt(cnts); //bus.storage.esServoRange(arcs);
*/
function $(name, opt, initEn){
  let init_delay = 0;
  let exe = 0; 
  
  clearInterval(interval);
  clearTimeout(timeout);

  if(!profile[name]){
    if(opt && opt.cb)
      MOTION_FUNC(0, 'MOTION 1');

    MOTION_FUNC(-1, 'Not define profile, '+ name);
    return;
  }

  if(profile[name] instanceof Array){
    exe = profile[name][(Math.random() * profile[name].length) | 0];
    //if(exe && exe.music)
      //MOTION_FUNC(3, DATA_PATH + exe.music);
  } else {
    exe = profile[name];
  }

  if(exe.manual){
    set_speed(exe.speed);
  }

  if((initEn || (initEn == undefined && exe.init_def)) && exe.init){
    init_delay = 1000;
    if(exe.manual){
      set_move(exe.init);
    }
    else{
      set_move(exe.init, init_delay);
    }
  }

  if(exe.pos){
    index = 0;
    let cycle_index = 0;
    timeout = setTimeout(function(){
      interval = setInterval(function(){
        let isCycle = interpret(exe, name);

        if(isCycle && opt && opt.cycle){
          cycle_index++;

          if(opt.cycle > 0 && cycle_index == opt.cycle){
            clearInterval(interval);

            if(opt && opt.cb){
              setTimeout(()=>{
                //MOTION_FUNC(2, false);
                MOTION_FUNC(0, 'MOTION 3');
              }, exe.interval * 2); // cooling time
            } else {
              setTimeout(()=>{
                MOTION_FUNC(2, false);
              }, exe.interval * 2); // cooling time
            }
          }
        }
      }, exe.interval, true);
    }, init_delay);
  }
  else {
    if(opt && opt.cb)
      MOTION_FUNC(0, 'MOTION 2');
    else
      MOTION_FUNC(2, false);
  }
}

$.motion_for_creator = function(obj, opt){
  let init_delay = 0;
  let exe = obj;
  let name = "";
  
  clearInterval(interval);

  if(exe.init){
    init_delay = 1000;
    set_move(exe.init, init_delay);
  }

  if(exe.pos){
    index = 0;
    let cycle_index = 0;
    setTimeout(function(){
      interval = setInterval(function(){
        let isCycle = interpret(exe, name);

        if(isCycle && opt && opt.cycle){
          cycle_index++;

          if(opt.cycle > 0 && cycle_index == opt.cycle){
            clearInterval(interval);

            if(opt && opt.cb){
              setTimeout(()=>{
                MOTION_FUNC(2, false);
                MOTION_FUNC(0, 'MOTION 3');
              }, exe.interval);
            } else {
              MOTION_FUNC(2, false);
            }
          }
        }
      }, exe.interval, true);
    }, init_delay);
  }
  else {
    if(opt && opt.cb)
      MOTION_FUNC(0, 'MOTION 2');
    else
      MOTION_FUNC(2, false);
  }
}

$.simulator = (type, value)=>{
  clearInterval(interval);
  clearTimeout(timeout);
  switch(type){
    case 'head_tilt':
        set_pos(5, value);
        break;
    case 'head_pan':
        set_pos(4, value);
        break;
    case 'hand_right':
        set_pos(3, value);
        break;
    case 'hand_left':
        set_pos(9, value);
        break;
    case 'shoulder_right':
        set_pos(2, value);
        break;
    case 'shoulder_left':
        set_pos(8, value);
        break;
    case 'leg_right':
        set_pos(1, value);
        break;
    case 'leg_left':
        set_pos(7, value);
        break;
    case 'foot_right':
        set_pos(0, value);
        break;
    case 'foot_left':
        set_pos(6, value);
        break;
    default:
      MOTION_FUNC(-1, 'Not define simul, '+ type);
  }
}

$.extend = (type, act)=>{
  clearInterval(interval);
  clearTimeout(timeout);

  let d = dec_act(type, act);

  if(d != undefined)
    set_pos(d[0], d[1]);
  else
    MOTION_FUNC(-1, 'Not defined extend, '+ type + ', ' + act);
}

$.set_pos = (num, pos) => {
  set_pos(num, pos);
}

$.clearInterval = () =>{
  clearInterval(interval);
  clearTimeout(timeout);
}

$.init = (func)=> {
  if(func instanceof Function)
    MOTION_FUNC = func; 

  //exec(`servo init;`, ()=>{})
  ioctl();
  ioctl.init();
}

$.profile_list = () => {
  let ret = [];
  for(item in profile)
    ret.push(item);

  return ret;
}

$.version = () => {
  return VERSION;
}

$.profile_time = (name) => {
  if(!profile[name])
    return false;
  else
    return (profile[name][0].pos.length-1) * profile[name][0].interval;
}

$.move_1011 = (l, r) => {
  ioctl.move_1011(Number(l), Number(r));
}

module.exports = $;

// Internal Functions
function interpret(exe, name){
  let isCycle = false;
  let item = exe.pos[index++];
  if(item == undefined)
    return isCycle;

  if(['breath','step','sad','boring','excite','happy'].indexOf(name) < 0)
    MOTION_FUNC(4, Date.now());

  if(exe.pos.length === index){
    if(name == 'stop'){
      clearInterval(interval);
    } else {
      isCycle = true;
      index = 0;
    }
  }
  if(exe.manual)
    set_move(item.d);
  else
    set_move(item.d, item.seq);
  return isCycle;
}

// HAL
function set_speed(spd){
//  let val = ''
//  for(var i=0; i<10; i++) val += (spd[i] == NS?' 9990':' ' + spd[i]);
//  exec(`servo speed all ${val};`, ()=>{})
  for(var i=0; i<10; i++)
    if(spd[i] == NS) continue;
    else ioctl.speed(i, spd[i]);
}

function set_accelerate(acc){
  //let val = ''
  //for(var i=0; i<10; i++) val += (acc[i] == NS?' 9990':' ' + acc[i]);
  //exec(`servo accelerate all ${val};`, ()=>{})
  for(var i=0; i<10; i++)
    if(acc[i] == NS) continue;
    else ioctl.acceleration(i, acc[i]);
}

function set_pos(num, pos, spd=-1, acc=-1){
  if(spd == -1) spd = default_spd[num];
  if(acc == -1) acc = default_acc[num];
  //exec(`servo twrite ${num} ${spd} ${acc} ${10*pos};`,()=>{})
  ioctl.twrite(num, pos*10, spd, acc);
}

function set_move(pos, intv){
  let cmd = ''
  if(pos instanceof Array){
    const cnts = [];
    const arcs = [];
    for(let i = 0 ; i < pos.length; i++){
      if(pos[i] !== NS){
        cnts.push(1);
        arcs.push(Math.abs(_BEFORE[i] -  pos[i]));
        _BEFORE[i] = pos[i];
      } else {
        cnts.push(0);
        arcs.push(0);
      }
    }

    MOTION_FUNC(5, [cnts, arcs]);

    //let val = ''
    //for(var i=0; i<10; i++){val += (' ' + pos[i]*10)}
    //if(intv != undefined)
      //cmd += `servo move ${val} ${intv};`
    //else
      //cmd += `servo mwrite ${val};`
    //exec(cmd, ()=>{})
    let pos_tmp = [];
    for(var i=0; i<10; i++){pos_tmp[i] = pos[i]*10}
    if(intv != undefined) ioctl.move(pos_tmp, intv);
    else ioctl.mwrite(pos_tmp);
  }
}

let dec_act = (type, act) => {
  let ret = undefined;
  switch(type){
    case 'head_tilt':
      switch(act){
        case 'vup':ret=[5,-20];break;
        case 'up':ret=[5,-10];break;
        case 'down':ret=[5,10];break;
        case 'vdown':ret=[5,20];break;
        case 'center':ret=[5,0];break;
      }
      break;
    case 'head_pan':
      switch(act){
        case 'vvleft':ret=[4,30];break;
        case 'vleft':ret=[4,20];break;
        case 'left':ret=[4,10];break;
        case 'right':ret=[4,-10];break;
        case 'vright':ret=[4,-20];break;
        case 'vvright':ret=[4,-30];break;
        case 'center':ret=[4,0];break;
      }
      break;
    case 'hand_right':
      switch(act){
        case 'vvleft':ret=[3,-25];break;
        case 'vleft':ret=[3,-20];break;
        case 'left':ret=[3,-10];break;
        case 'right':ret=[3,10];break;
        case 'vright':ret=[3,20];break;
        case 'vvright':ret=[3,25];break;
        case 'center':ret=[3,0];break;
      }
      break;
    case 'hand_left':
      switch(act){
        case 'vvleft':ret=[9,-25];break;
        case 'vleft':ret=[9,-20];break;
        case 'left':ret=[9,-10];break;
        case 'right':ret=[9,10];break;
        case 'vright':ret=[9,20];break;
        case 'vvright':ret=[9,25];break;
        case 'center':ret=[9,0];break;
      }
      break;
    case 'shoulder_right':
      switch(act){
        case 'vvup':ret=[2,80];break;
        case 'vup':ret=[2,30];break;
        case 'up':ret=[2,15];break;
        case 'down':ret=[2,-15];break;
        case 'vdown':ret=[2,-30];break;
        case 'vvdown':ret=[2,-80];break;
        case 'center':ret=[2,0];break;
      }
      break;
    case 'shoulder_left':
      switch(act){
        case 'vvup':ret=[8,-80];break;
        case 'vup':ret=[8,-30];break;
        case 'up':ret=[8,-15];break;
        case 'down':ret=[8,15];break;
        case 'vdown':ret=[8,30];break;
        case 'vvdown':ret=[8,80];break;
        case 'center':ret=[8,0];break;
      }
      break;
    case 'leg_right':
      switch(act){
        case 'vleft':ret=[1,-20];break;
        case 'left':ret=[1,-10];break;
        case 'right':ret=[1,10];break;
        case 'vright':ret=[1,20];break;
        case 'center':ret=[1,0];break;
      }
      break;
    case 'leg_left':
      switch(act){
        case 'vleft':ret=[7,-20];break;
        case 'left':ret=[7,-10];break;
        case 'right':ret=[7,10];break;
        case 'vright':ret=[7,20];break;
        case 'center':ret=[7,0];break;
      }
      break;
    case 'foot_right':
      switch(act){
        case 'vleft':ret=[0,-20];break;
        case 'left':ret=[0,-10];break;
        case 'right':ret=[0,10];break;
        case 'vright':ret=[0,20];break;
        case 'center':ret=[0,0];break;
      }
      break;
    case 'foot_left':
      switch(act){
        case 'vleft':ret=[6,-20];break;
        case 'left':ret=[6,-10];break;
        case 'right':ret=[6,10];break;
        case 'vright':ret=[6,20];break;
        case 'center':ret=[6,0];break;
      }
      break;
    default:
      MOTION_FUNC(-1, 'Not defined extend, '+ type + ', ' + act);
      break;
  }

  return ret;
}

