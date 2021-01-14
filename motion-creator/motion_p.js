const profile = require('./motion_db.js');
const unit = 50; // ms
let db = 0;
let parse_json = function(obj){
  let ret = {};

  for(item in obj){
    ret[item] = {};

    if(obj[item].init)ret[item]['init'] = obj[item].init;
    if(obj[item].init_def)ret[item]['init_def'] = obj[item].init_def;
    if(obj[item].manual)ret[item]['manual'] = obj[item].manual;
    if(obj[item].speed)ret[item]['speed'] = obj[item].speed;
    if(obj[item].music)ret[item]['music'] = obj[item].music;
    if(obj[item].pos){
      let prev = 0;
      let pos = [];

      for(let i = 0; i < obj[item].pos.length; i++) {
        pos[prev] = {d:obj[item].pos[i]['d'], seq:(obj[item].pos[i]['seq']-unit*prev)}
        prev = obj[item].pos[i]['seq']/unit;
      }

      pos[prev] = {};
      ret[item]['pos'] = pos;
      ret[item]['interval'] = unit;
    }
  }
  return ret;
}

db = parse_json(profile);

module.exports = {
  stop: [db.stop],
  stop_body: [db.stop_body],
  sleep: [db.sleep],
  lookup : [db.lookup],
  left: [db.left],
  left_half: [db.left_half],
  right: [db.right], 
  right_half: [db.right_half],
  forward: [db.forward1, db.forward2],
  forward1: [db.forward1],
  forward2: [db.forward2],
  backward: [db.backward1, db.backward2],
  backward1: [db.backward1],
  backward2: [db.backward2],
  step: [db.step1,db.step2],
  step1: [db.step1],
  step2: [db.step2],
  hifive: [db.hifive],
  cheer: [db.cheer1, db.cheer2, db.cheer3],
  cheer1: [db.cheer1],
  cheer2: [db.cheer2],
  cheer3: [db.cheer3],
  wave: [db.wave1, db.wave2, db.wave3, db.wave4, db.wave5, db.wave6],
  wave1: [db.wave1],
  wave2: [db.wave2],
  wave3: [db.wave3],
  wave4: [db.wave4],
  wave5: [db.wave5],
  wave6: [db.wave6],
  think: [db.think1, db.think2, db.think3, db.think4],
  think1: [db.think1],
  think2: [db.think2],
  think3: [db.think3],
  think4: [db.think4],
  wake_up: [db.wake_up1, db.wake_up2, db.wake_up3],
  wake_up1: [db.wake_up1],
  wake_up2: [db.wake_up2],
  wake_up3: [db.wake_up3],
  hey: [db.hey1, db.hey2],
  hey1: [db.hey1],
  hey2: [db.hey2],
  sleep: [db.sleep], 
  yes_h: [db.yes_h],
  no_h: [db.no_h],
  breath: [db.breath1, db.breath2, db.breath3],
  breath1: [db.breath1],
  breath2: [db.breath2],
  breath3: [db.breath3],
  breath_long : [db.breath_long],
  head_h: [db.head_h],
  spin_h: [db.spin_h],
  clapping: [db.clapping1, db.clapping2],
  clapping1: [db.clapping1],
  clapping2: [db.clapping2],
  handshaking: [db.handshaking],
  bow: [db.bow],
  greeting: [db.greeting],
  hand:[db.hand1, db.hand2, db.hand3, db.hand4],
  hand1:[db.hand1],
  hand2:[db.hand2],
  hand3:[db.hand3],
  hand4:[db.hand4],
  foot:[db.foot1, db.foot2, db.foot3],
  foot1:[db.foot1],
  foot2:[db.foot2],
  foot3:[db.foot3],
  speak: [db.speak1, db.speak2, db.speak_r1, db.speak_r2, db.speak_l1, db.speak_l2],
  speak1: [db.speak1],
  speak2: [db.speak2],
  speak_n: [db.speak_n1, db.speakn_n2],
  speak_n1: [db.speak_n1],
  speak_n2: [db.speak_n2],
  speak_q : [db.speak_q],
  speak_r: [db.speak_r1, db.speak_r2],
  speak_r1: [db.speak_r1],
  speak_r2: [db.speak_r2],
  speak_l: [db.speak_l1, db.speak_l2],
  speak_l1: [db.speak_l1],
  speak_l2: [db.speak_l2],
  welcome : [db.welcome],
  happy : [db.happy1, db.happy2, db.happy3],
  happy1 : [db.happy1],
  happy2 : [db.happy2],
  happy3 : [db.happy3],
  excite : [db.excite1, db.excite2],
  excite1 : [db.excite1],
  excite2 : [db.excite2],
  boring : [db.boring1, db.boring2],
  boring1 : [db.boring1],
  boring2 : [db.boring2],
  sad : [db.sad1, db.sad2, db.sad3],
  sad1 : [db.sad1],
  sad2 : [db.sad2],
  sad3 : [db.sad3],
  handup_r: [db.handup_r],
  handup_l: [db.handup_l],
  look_r: [db.look_r],
  look_l: [db.look_l],
  music: [
    db.wave1, db.wave2, db.wave3, db.wave4,
    db.hand1, db.hand2, db.hand3, db.hand4,
    db.foot1, db.foot2, db.cheer1, db.cheer2, db.cheer3
  ],
  exercise : [db.exercise1, db.exercise2],
  exercise1 : [db.exercise1],
  exercise2 : [db.exercise2],
  exercise3 : [db.exercise3],
  dance : [db.dance1, db.dance2, db.dance3, db.dance4],
  dance1 : [db.dance1],
  dance2 : [db.dance2],
  dance3 : [db.dance3],
  dance4 : [db.dance4],
  motion_test: [db.motion_test],
  test1:[db.test1],
  test2:[db.test2],
  test3:[db.test3],
  test4:[db.test4],
}
