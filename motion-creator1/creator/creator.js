const fs = require('fs');
const app = require('express')();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = 8888;
const motion = require('../index.js');
const motor_str2num = {
'rf':0,
'rl':1,
'ra':2,
'rh':3,
'hp':4,
'ht':5,
'lf':6,
'll':7,
'la':8,
'lh':9,
}
const seq_unit = 50;
let record = {};

server.listen(port, function(){
  console.log('Server start:',  port, new Date().toString());
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(socket){
  let idx = 0;
  let arr = [];
  for(k in record){arr[idx++]=record[k];}
  io.emit ('disp_record', {data:arr});

  socket.on('set_pos', function(d){
    motion.set_pos(motor_str2num[d.type], d.pos);
  });

  socket.on('add_frame', function(d){
    record[d.time] = {d:d.pos_arr, seq:Number(d.time)};
    
    let idx = 0;
    let arr = [];
    for(k in record){arr[idx++]=record[k];}
    io.emit ('disp_record', {data:arr});
  });

  socket.on('delete_frame', function(d){
    delete record[d];
    let idx = 0;
    let arr = [];
    for(k in record){arr[idx++]=record[k];}
    io.emit ('disp_record', {data:arr});
  });

  socket.on('init_frame', function(d){
    record = {};
    let idx = 0;
    let arr = [];
    for(k in record){arr[idx++]=record[k];}
    io.emit ('disp_record', {data:arr});
  });

  socket.on('disp_frame', function(d){
    let idx = 0;
    let arr = [];
    for(k in record){arr[idx++]=record[k];}
    io.emit ('disp_record', {data:arr});
  });

  socket.on('play_frame', function(cycle){
    let arr = [];
    let exe = {}
    let ret = {};
    let idx = 0;

    for(k in record){
      if(k == '0'){
        exe['init'] = record['0']['d'];
        exe['init_def'] = 1;
      }
      else{
        arr[idx++] = record[k];
      }
    }
    if(arr.length>0)exe['pos'] = arr;

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

    io.emit('disp_code', JSON.stringify(exe));
    motion.motion_for_creator(ret, {cycle:Number(cycle)});
  });

  socket.on('export', function(name){
    let exe = {};
    let arr = [];
    let idx = 0;

    if(name == '')
      name = "TEST"

    for(k in record){
      if(k == '0'){
        exe['init'] = record['0']['d'];
        exe['init_def'] = 1;
      }
      else{
        arr[idx++] = record[k];
      }
    }

    if(arr.length>0) exe['pos'] = arr;

    data = 'module.exports={"' + name + '":'+ JSON.stringify(exe) +'}';
    io.emit('disp_code', data);
    fs.writeFile(name+'.js', data, 'utf8', function(err){
      if(err) console.log(err)
    });
  });
});


let execute = function(type, data){
  switch(type){
    case -1:
      console.log('err', data);
      break;
      /*
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
  */
  }
}

motion.init(execute);
