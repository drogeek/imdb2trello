console.log("Content script loaded");

async function getImage(full_poster_url) {
    const img_url = await browser.runtime.sendMessage({
            action: "fetchPage",
            url: full_poster_url
    });
    console.log("Retrieved img_url:", img_url)
    return img_url;
};

//This script waits to be notified by the background script
//and parse the data and send it when it happens
browser.runtime.onMessage.addListener( async (note_value) => {

    console.log("Asking for data");

    var movie_title = document.evaluate(
        '//span[@data-testid="hero__primary-text"]/text()',
        document, 
        null, 
        XPathResult.STRING_TYPE)
    .stringValue
    console.log(movie_title)

    var rating_value = document.evaluate(
        '//div[@data-testid="hero-rating-bar__aggregate-rating__score"]/span/text()',
        document, 
        null, 
        XPathResult.STRING_TYPE)
    .stringValue;
    console.log(rating_value)


    var poster_url = document.evaluate(
        '//div[@data-testid="hero-media__poster"]/a/@href',
        document, 
        null, 
        XPathResult.STRING_TYPE)
    .stringValue 
    console.log(poster_url)
    var full_poster_url = new URL(poster_url, window.location.origin).href
    console.log(full_poster_url)

    var img_url = await getImage(full_poster_url)
    // we got everything we need, bundle them inside an object
    var data = { 
        'action': 'send_to_trello',
        'rating_value': rating_value,
        'title' : movie_title,
        'poster_url': img_url,
        'note_value': note_value,
        'imdb_url': window.location.href,
    }

    // and send it to the background script sendRequest.js
    browser.runtime.sendMessage(data); 
});

