export default getContent;

export function getContent(page, key) {
    var pageContent = page ? page.content : null;
    if (!pageContent) {
        return {};
    };

    var content = {};
    for (var j in pageContent) {
        if (j !== 'ref') {
            content[j] = pageContent[j];
        };
    };

    content.ref = 'content';
    if (key) {
        content.key = 'content_' + page.NUMBER_PAGE;
    };

    return content;
};