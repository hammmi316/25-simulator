window.JGB_GAME = (function(){
  "use strict";
  var BASE_P = 0.005;
  var PITY_STEP = 0.47;
  var CAP_FAILS = Math.ceil(100 / PITY_STEP);
  var GUARANTEED_TRY = CAP_FAILS + 1;
  var AVG_TRIES = 131.5822;
  var JANGIBAEK_RATE = 34.3808;

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
    var success = (run.gauge >= 100) || (Math.random() < BASE_P);
    if(!success){
      var before = run.gauge;
      run.gauge = Math.min(100, run.gauge + PITY_STEP);
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
    while(!success && guard < 100000){
      success = attemptOnce(run);
      guard++;
    }
    return run;
  }
  function percentile(tries){
    var survive = 1, cdf = 0;
    var n = Math.min(tries, CAP_FAILS);
    for(var k=1; k<=n; k++){
      cdf += survive * BASE_P;
      survive *= (1 - BASE_P);
    }
    if(tries >= GUARANTEED_TRY) cdf = 1;
    return cdf * 100;
  }

  return {
    BASE_P: BASE_P, PITY_STEP: PITY_STEP, CAP_FAILS: CAP_FAILS, GUARANTEED_TRY: GUARANTEED_TRY,
    AVG_TRIES: AVG_TRIES, JANGIBAEK_RATE: JANGIBAEK_RATE,
    getRun: getRun, setRun: setRun, startRun: startRun, getOrStartRun: getOrStartRun,
    attemptOnce: attemptOnce, resolveAuto: resolveAuto, percentile: percentile
  };
})();
