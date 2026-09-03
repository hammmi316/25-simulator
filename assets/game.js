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
  var LEADERBOARD_COLLECTION = 'leaderboard';
  var MAX_LEADERBOARD_RANK = 1000;
  function leaderboardDocId(nickname, server){
    return encodeURIComponent(nickname) + '__' + encodeURIComponent(server);
  }
  function leaderboardCol(){
    return window.JGB_DB.collection(window.JGB_DB.db, LEADERBOARD_COLLECTION);
  }
  function leaderboardDocRef(nickname, server){
    return window.JGB_DB.doc(window.JGB_DB.db, LEADERBOARD_COLLECTION, leaderboardDocId(nickname, server));
  }
  function submitResult(entry){
    var ref = leaderboardDocRef(entry.nickname, entry.server);
    return window.JGB_DB.getDoc(ref).then(function(snap){
      if(!snap.exists() || entry.tries < snap.data().tries){
        return window.JGB_DB.setDoc(ref, entry);
      }
    }).catch(function(e){ console.error('submitResult failed', e); });
  }
  function getLeaderboardCount(){
    var q = window.JGB_DB.query(leaderboardCol());
    return window.JGB_DB.getCountFromServer(q)
      .then(function(snap){ return Math.min(snap.data().count, MAX_LEADERBOARD_RANK); })
      .catch(function(e){ console.error('getLeaderboardCount failed', e); return 0; });
  }
  function getLeaderboardPage(page, pageSize){
    var limitCount = Math.min(page * pageSize, MAX_LEADERBOARD_RANK);
    var q = window.JGB_DB.query(
      leaderboardCol(),
      window.JGB_DB.orderBy('tries', 'asc'),
      window.JGB_DB.limit(limitCount)
    );
    return window.JGB_DB.getDocs(q)
      .then(function(snap){
        var all = [];
        snap.forEach(function(doc){ all.push(doc.data()); });
        var start = (page - 1) * pageSize;
        return all.slice(start, start + pageSize);
      })
      .catch(function(e){ console.error('getLeaderboardPage failed', e); return []; });
  }
  function getMyRank(nickname, server){
    var ref = leaderboardDocRef(nickname, server);
    return window.JGB_DB.getDoc(ref).then(function(snap){
      if(!snap.exists()) return null;
      var entry = snap.data();
      // endBefore(snap) reproduces Firestore's own tiebreak (document id)
      // for entries with an identical tries value, so the count here
      // matches this entry's exact position in the orderBy('tries') list
      // that getLeaderboardPage renders — not just "how many have fewer tries".
      var q = window.JGB_DB.query(
        leaderboardCol(),
        window.JGB_DB.orderBy('tries', 'asc'),
        window.JGB_DB.orderBy(window.JGB_DB.documentId()),
        window.JGB_DB.endBefore(snap)
      );
      return window.JGB_DB.getCountFromServer(q).then(function(countSnap){
        return { rank: countSnap.data().count + 1, entry: entry };
      });
    }).catch(function(e){ console.error('getMyRank failed', e); return null; });
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
    MAX_LEADERBOARD_RANK: MAX_LEADERBOARD_RANK,
    submitResult: submitResult, getLeaderboardCount: getLeaderboardCount,
    getLeaderboardPage: getLeaderboardPage, getMyRank: getMyRank
  };
})();
