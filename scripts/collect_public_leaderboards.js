// Read-only collection in a fresh, signed-out browser. No client keys leave this function.
async (page) => {
  const captures = [];
  try {
    await page.goto('https://www.kaggle.com/benchmarks/kaggle/game-arena', {waitUntil: 'domcontentloaded', timeout: 60000});
    for (const slug of ['game-arena', 'chess-text', 'go', 'poker-heads-up', 'werewolf']) {
      try {
        const result = await page.evaluate(async (slug) => {
          const get = async (url, body) => {
            const response = await fetch(url, {method: body ? 'POST' : 'GET',
              headers: body ? {'Content-Type': 'application/json'} : {},
              body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(45000)});
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return {url, request: body || null, capturedAt: new Date().toISOString(), data: await response.json()};
          };
          const identifier = {slugIdentifier: {ownerSlug: 'kaggle', benchmarkSlug: slug}};
          const meta = await get('/api/i/benchmarks.BenchmarkService/GetBenchmark', {
            benchmarkIdentifier: identifier, versionIdentifier: {latestVisibleSelector: {parentBenchmarkIdentifier: identifier}}});
          const version = {versionIdSelector: {id: meta.data.version.id}};
          const scores = await get('/api/i/benchmarks.BenchmarkService/GetUnifiedBenchmarkLeaderboard', {versionIdentifier: version});
          const protocol = await get('/api/i/competitions.PageService/ListPages', {benchmarkVersionIdentifier: version});
          const download = await get(`/api/v1/benchmarks/kaggle/${slug}/leaderboard`);
          for (const cap of [meta, scores, protocol, download]) cap.url = new URL(cap.url, location.origin).href;
          return {meta, scores, protocol, download};
        }, slug);
        captures.push({id: slug, ...result});
      } catch (_) { captures.push({id: slug, error: 'Public Kaggle response unavailable or not valid JSON'}); }
    }
  } catch (_) {
    for (const id of ['game-arena', 'chess-text', 'go', 'poker-heads-up', 'werewolf'])
      captures.push({id, error: 'Public Kaggle page unavailable'});
  }
  try {
    // Observe the public page's own request. Do not extract or replay client keys.
    const responsePromise = page.waitForResponse(response => {
      if (!response.url().endsWith('/rest/v1/rpc/get_leaderboard_from_mv_trueskill_humans_models')) return false;
      try { return response.request().postDataJSON()?.skill_subset === 'Balanced Subset'; }
      catch (_) { return false; }
    }, {timeout: 60000});
    responsePromise.catch(() => {});
    await page.goto('https://www.textarena.ai/leaderboard', {waitUntil: 'domcontentloaded', timeout: 60000});
    const response = await responsePromise;
    if (!response.ok()) throw new Error('Public response unavailable');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('RPC schema changed');
    captures.push({id: 'textarena', results: {
      url: response.url(), request: {skill_subset: 'Balanced Subset'},
      capturedAt: new Date().toISOString(), data,
      clientEvidence: {page: page.url(), method: 'Read-only observation of the signed-out official page response; no client key copied'}
    }});
  } catch (_) { captures.push({id: 'textarena', error: 'Official TextArena page did not return valid Balanced Subset results'}); }
  return JSON.stringify(captures);
}
