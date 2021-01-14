console.log("Motion Name:", process.argv[2], "Cycle:", process.argv[3])

const name = process.argv[2]
const cycle = Number(process.argv[3])
const exe = require('./'+name + '.js')[name];
const seq_unit = 50;
const motion = require('../index.js');
let execute = function(type, data){
  switch(type){
    case -1:
      console.log('err', data);
      break;
    case 0:
      console.log('next', data);
      
    case 1:
      console.log('res', data);
      break;
    case 2:
      console.log('state', data);
      //if(data == false)
        //exec('pkill play');
      break;
    case 3:
      console.log('play request', data);
      //exec('play ' + data);
      break;
    case 4:
      console.log('time', data);
      break;
    case 5:
      console.log('bd', data);
      break;
    default:
      console.log('no such type', type, data);
      break;
  }
}
motion.init(execute);

let ret = {}

if(exe.init){
  ret['init'] = exe.init;
  ret['init_def'] = 1;
}

if(exe.pos){
  let prev = 0;
  let pos = [];
  for(let i = 0; i < exe.pos.length; i++) {
    pos[prev] = {d:exe.pos[i]['d'], seq:(exe.pos[i]['seq']-seq_unit*prev)}
    prev = exe.pos[i]['seq']/seq_unit;
  }
  pos[prev] = {};
  ret['pos'] = pos;
  ret['interval'] = seq_unit;
}

motion.motion_for_creator(ret, {cycle:Number(cycle)});
