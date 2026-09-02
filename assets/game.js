window.JGB_GAME = (function(){
  "use strict";
  var GOLD_PER_TRY = 63579;
  var BASE_P = 0.005;
  var P_STEP = 0.0005;
  var P_CAP = 0.01;
  var GAUGE_DIVISOR = 2.15;
  var CAP_FAILS = 218;
  var GUARANTEED_TRY = 219;
  var AVG_TRIES = 91.3209;
  var JANGIBAEK_RATE = 11.4952;

  function pAt(attemptNumber){
    return Math.min(P_CAP, BASE_P + (attemptNumber - 1) * P_STEP);
  }

  function getRun(){
    try{
      var raw = sessionStorage.getItem('jgb_run');
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }
  function setRun(run){
    try{ sessionStorage.setItem('jgb_run', JSON.stringify(run)); }catch(e){}
  }
  function startRun(mode){
    var run = { mode: mode, tries: 0, gauge: 0 };
    setRun(run);
    return run;
  }
  function getOrStartRun(mode){
    var run = getRun();
    if(run){
      run.mode = mode;
      setRun(run);
      return run;
    }
    return startRun(mode);
  }
  function attemptOnce(run){
    run.tries++;
    var p = pAt(run.tries);
    var success = (run.gauge >= 100) || (Math.random() < p);
    if(!success){
      var before = run.gauge;
      var gain = (p * 100) / GAUGE_DIVISOR;
      run.gauge = Math.min(100, run.gauge + gain);
      run.lastDelta = run.gauge - before;
    }else{
      run.lastDelta = 0;
    }
    setRun(run);
    return success;
  }
  function resolveAuto(run){
    var success = false;
    var guard = 0;
    while(!success && guard < 1000){
      success = attemptOnce(run);
      guard++;
    }
    return run;
  }
  var LEADERBOARD_KEY = 'jgb_leaderboard';
  function getLeaderboard(){
    try{
      var raw = localStorage.getItem(LEADERBOARD_KEY);
      var list = raw ? JSON.parse(raw) : [];
      list.sort(function(a,b){ return a.tries - b.tries; });
      return list;
    }catch(e){ return []; }
  }
  function submitResult(entry){
    var list = getLeaderboard();
    var idx = list.findIndex(function(e){
      return e.nickname === entry.nickname && e.server === entry.server;
    });
    if(idx === -1){
      list.push(entry);
    }else if(entry.tries < list[idx].tries){
      list[idx] = entry;
    }
    list.sort(function(a,b){ return a.tries - b.tries; });
    try{ localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list)); }catch(e){}
  }

  function percentile(tries){
    var survive = 1, cdf = 0;
    var n = Math.min(tries, CAP_FAILS);
    for(var k=1; k<=n; k++){
      var p = pAt(k);
      cdf += survive * p;
      survive *= (1 - p);
    }
    if(tries >= GUARANTEED_TRY) cdf = 1;
    return cdf * 100;
  }

  return {
    GOLD_PER_TRY: GOLD_PER_TRY,
    BASE_P: BASE_P, P_STEP: P_STEP, P_CAP: P_CAP, GAUGE_DIVISOR: GAUGE_DIVISOR,
    CAP_FAILS: CAP_FAILS, GUARANTEED_TRY: GUARANTEED_TRY,
    AVG_TRIES: AVG_TRIES, JANGIBAEK_RATE: JANGIBAEK_RATE,
    pAt: pAt,
    getRun: getRun, setRun: setRun, startRun: startRun, getOrStartRun: getOrStartRun,
    attemptOnce: attemptOnce, resolveAuto: resolveAuto, percentile: percentile,
    getLeaderboard: getLeaderboard, submitResult: submitResult
  };
})();
