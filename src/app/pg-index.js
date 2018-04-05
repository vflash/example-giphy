import view, {onLocation} from 'src/models/view/view.js';
import {cmps} from 'src/blocks/cmps.js';
import rest from 'src/models/rest/rest.js';

import GiphySearchFeed from 'src/models/GiphySearchFeed.js';

import 'src/blocks/PageGiphyFeed/PageGiphyFeed.js'

// -----------------------------------
// /

onLocation(async function(q) {
    var rq = q.match('/');
    if (!rq) {
        return;
    };

    q.ok();

    var urlGiphySearchFeed = rest.url(rq.q ? '/api/giphy/gifs/search' : '/api/giphy/gifs/trending', {
        api_key: 'oIcDr3rYF9AATYVI3MUZGQYzbg5Pg9p0',
        q: rq.q,
    });

    var modelGiphySearchFeed = new GiphySearchFeed(urlGiphySearchFeed);
    var [status, result] = await modelGiphySearchFeed.load(50);

    q.end(true, {
        class: cmps.PageGiphyFeed,
        search: rq.q,
        feed: modelGiphySearchFeed,
        key: q.NUMBER_PAGE,
    });
});

