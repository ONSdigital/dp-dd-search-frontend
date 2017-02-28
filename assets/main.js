'use strict';

/**
 * Application variables
 */
var hostname = location.hostname;
var env = getEnvironmentType(hostname);
var apiUrl = "https://search.discovery.onsdigital.co.uk"; // If this needs to point at local version on server in the future use the 'env' variable to detect whether it's the development or production build
var appElem = document.getElementById('app');
var searchElem = document.getElementById('search');
var inputElem = document.getElementById('search__input');

function getEnvironmentType(hostname) {
    switch (hostname) {
        case 'localhost':
            {
                return 'development';
            }
        case '127.0.0.1':
            {
                return 'development';
            }
        default:
            {
                return 'production';
            }
    }
}

var state = {
    count: 0,
    areaCount: 0,
    query: getUrlParams().q || ''
};

function getUrlParams() {
    var queryString = location.search;
    if (!queryString) {
        return {};
    }

    var queries = queryString.split(/[\&?]+/);
    queries.splice(0, 1);

    var returnValue = {};
    queries.forEach(function (query) {
        var splitQuery = query.split('=');
        returnValue[splitQuery[0]] = splitQuery[1];
    });

    return returnValue;
}

/**
 * HTML components
 */

function searchTextComponent() {
    var query = state.query;
    var count = state.count;

    function wrapInContainer(children) {
        return '<div class="border-bottom--iron-md border-bottom--iron-lg">\n                <h2 class="search-text margin-top--2 margin-bottom--2">\n                    ' + children + '\n                </h2>\n            </div>';
    }

    if (query && count === 0) {
        return wrapInContainer('No results for <strong>\'' + state.query + '\'</strong>');
    }

    if (!query) {
        return wrapInContainer('No search query, showing all <strong>\'' + count + '\'</strong> results');
    }

    return wrapInContainer('<strong>' + count + '</strong> results found for <strong>\'' + query + '\'</strong>');
}

function areaSearchTextComponent() {
    var query = state.query;
    var count = state.areaCount;

    function wrapInContainer(children) {
        return '<div class="col">\n                <h2 class="search-text margin-top--2 margin-bottom--2">\n                    ' + children + '\n                </h2>\n            </div>';
    }

    return wrapInContainer('\n        Showing the top <strong>' + (count > 4 ? '4' : count) + '</strong> suggested location' + (count > 1 ? 's' : '') + (query ? ' for <strong>\'' + query + '\'</strong>' : '') + '.\n        <a href="">View all</a>\n    ');
}

function resultItemComponent(data) {
    return '<div class="result border-bottom--iron-md border-bottom--iron-lg">\n            <h3 class="result__title"><a href="">' + data.title + '</a></h3>\n            <div class="result__description">' + data.description + '</div>\n            <span class="result__metadata">' + data.type + '</span>\n            <span class="result__metadata">Released on ' + data.releaseDate + '</span>\n        </div>';
}

function areaResultItemComponent(data) {
    return '<div class="col col--lg-half background--iron-light margin-bottom--2 padding-top--2 padding-right--1 padding-bottom--2 padding-left--1">\n            <span class="baseline">' + data.type + '</span>\n            <span class="icon icon-arrow-right--dark float-right margin-top--1"></span>\n            <h3 class="flush"><a href="">' + data.title + '</a></h3>\n        </div>\n        ';
}

/**
 * Initialise application
 */

function updateResults() {

    if (state.query !== inputElem.value) {
        console.log('Fetching results for "%s"', state.query);
        inputElem.value = state.query;
    }

    if (state.query) {
        document.getElementById('title').innerHTML = state.query + ' - Search - Office for National Statistics';
    } else {
        document.getElementById('title').innerHTML = 'Search - Office for National Statistics';
    }

    fetch(apiUrl + '/search?q=' + state.query).then(function (response) {
        return response.json();
    }).then(function (response) {
        state.count = response.total_results;
        state.areaCount = response.area_results ? response.area_results.length : 0;

        // Remove current results
        while (appElem.firstChild) {
            appElem.removeChild(appElem.firstChild);
        }appElem.innerHTML += buildAreaResults(response.area_results) + buildResults(response.results);
    }).catch(function (error) {
        console.log('Error getting results data \n' + error);
        while (appElem.firstChild) {
            appElem.removeChild(appElem.firstChild);
        }appElem.innerHTML += '\n            <div class="col">\n                <h2>Oops, there\'s been an error</h2>\n                <p class="margin-top--2 margin-bottom--0">There was an issue getting your results.</p>\n                <p class="flush">Please try again in a few moments.</p>\n            </div>\n        ';
    });
}

function buildResults(resultsData) {
    var HTMLParts = [];
    var count = state.count;

    if (count === 0) {
        return wrapInContainer('');
    }

    function wrapInContainer(children) {
        return '<div class="col margin-bottom--3">\n                ' + searchTextComponent() + '\n                ' + children + '\n            </div>';
    }

    resultsData.map(function (result) {
        var date = result.body.metadata.release_date.split('+');

        // Check for invalid date
        if (date[1]) {
            date.pop();
            date.push('Z');
            date = date.join('');
        }

        var data = {
            title: result.body.title,
            description: result.body.metadata.description,
            type: result.type,
            releaseDate: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        HTMLParts.push(resultItemComponent(data));
    });

    return wrapInContainer(HTMLParts.join(''));
}

function buildAreaResults(resultsData) {
    var HTMLParts = [];
    var count = state.areaCount;
    var query = state.query;

    if (count === 0 | !query) {
        return '';
    }

    function wrapInContainer(children) {
        return '<div style="width: 100%;" class="float-left border-bottom--iron-md border-bottom--iron-lg padding-bottom--2">\n                ' + areaSearchTextComponent() + '\n                ' + children + '\n            </div>';
    }

    resultsData.some(function (result, index) {
        var data = {
            title: result.body.title,
            type: result.body.type
        };

        HTMLParts.push(areaResultItemComponent(data));

        return index === 3;
    });

    return wrapInContainer(HTMLParts.join(''));
}

function bindSearchSubmit() {

    searchElem.addEventListener('submit', function (event) {
        var query = inputElem.value;
        event.preventDefault();
        state.query = query;

        if (!query) {
            window.history.pushState({ query: query }, '', location.pathname);
            updateResults();
            return;
        }

        window.history.pushState({ query: query }, '', '?q=' + query);
        updateResults();
    });
}

function bindHistoryState() {
    window.onpopstate = function (event) {
        if (event.state) {
            state.query = event.state.query;
        } else {
            state.query = '';
        }
        updateResults();
    };
}

function init() {
    updateResults();
    bindSearchSubmit();
    bindHistoryState();
}

init();
