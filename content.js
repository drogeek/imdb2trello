console.log("Content script loaded");

//This script waits to be notified by the background script
//and parse the data and send it when it happens
browser.runtime.onMessage.addListener( () => {

    console.log("Asking for data");

    var movie_title = document.evaluate(
        '//div[contains(@class, "title_wrapper")]/h1/text()', 
        document, 
        null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE)
        .singleNodeValue

    var rating_value = document.evaluate(
        '//span[contains(@itemprop, "ratingValue")]/text()', 
        document, 
        null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE)
        .singleNodeValue;

    var rating_count = document.evaluate(
        '//span[contains(@itemprop, "ratingCount")]/text()', 
        document, 
        null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE)
        .singleNodeValue;
    var poster = document.evaluate(
        '//div[contains(@class, "poster")]/a/img/@src', 
        document, 
        null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE)
        .singleNodeValue;

    // we got everything we need, bundle them inside an object
    var data = { 
        'rating_value': rating_value.data,
        'rating_count': rating_count.data,
        'title' : movie_title.data,
        'poster_url': poster.value,
    }

    // and send it to the background script sendRequest.js
    browser.runtime.sendMessage(data); 
});

