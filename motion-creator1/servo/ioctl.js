const _s = require('bindings')('servo.node')

function $(){
  _s.start();
}

$.init = () =>{
  _s.init();
}

$.speed = (c,v) =>{
  _s.speed(c,v);
}

$.acceleration = (c,v) =>{
  _s.acceleration(c,v);
}

$.twrite = (c,v,s,a) =>{
  _s.twrite(c,v,s,a);
}

$.mwrite = (v) =>{
  _s.mwrite(v[0],v[1],v[2],v[3],v[4],v[5],v[6],v[7],v[8],v[9]);
}

$.move = (v,t) =>{
  _s.move(v[0],v[1],v[2],v[3],v[4],v[5],v[6],v[7],v[8],v[9],t);
}

$.move_1011 = (l,r) =>{
  _s.move_1011(l,r);
}

module.exports = $;

