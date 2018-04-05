import view, {onLocation} from 'src/models/view/view.js';
import {cmps} from 'src/blocks/cmps.js';

import 'src/blocks/LayoutTest/LayoutTest.js';
import 'src/blocks/PageTests/PageTests.js';


// -----------------------------------
// /tests/...

onLocation(function(q) {
    var req = q.match('/tests/{groupName}') || q.match('/tests');
    if (!req) {
        return;
    };

    //q.viewType = 'ui';
    q.zIndex = 0;
    q.ok();

    q.end(true, {
        layoutType: cmps.LayoutTest,
        groupName: req.groupName,
        class: cmps.PageTests,
        key: q.NUMBER_PAGE,
    });
});


