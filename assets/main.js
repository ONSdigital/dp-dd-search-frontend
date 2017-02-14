"use strict";

/**
 * Application variables
 */
var hostname = location.hostname;
var env = getEnvironmentType(hostname);
var apiUrl = env === "development" ? "http://localhost:20051" : "https://search.discovery.onsdigital.co.uk";
var appElem = document.getElementById('app');
var searchElem = document.getElementById('search');
var inputElem = document.getElementById('search__input');

function getEnvironmentType(hostname) {
    switch (hostname) {
        case 'localhost':
            {
                return "development";
            }
        case '127.0.0.1':
            {
                return "development";
            }
        default:
            {
                return "production";
            }
    }
}

var state = {
    count: 0,
    query: getUrlParams().q || ""
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

    if (query && count === 0) {
        return "<h2 class=\"search-text margin-top--1 margin-bottom--4\">No results for <strong>" + state.query + "</strong></h2>";
    }

    if (!query) {
        return "<h2 class=\"search-text margin-top--1 margin-bottom--4\">No search query, showing all <strong>" + count + "</strong> results</h2>";
    }

    return "<h2 class=\"search-text margin-top--1 margin-bottom--4\"><strong>" + count + "</strong> results found for <strong>" + query + "</strong>.</h2>";
}

function resultItemComponent(data) {
    return "<div class=\"result border-top--iron-lg\">" + "<h3 class=\"result__title\"><a href=\"\">" + data.title + "</a></h3>" + "<div class=\"result__description\">" + data.description + "</div>" + "<span class=\"result__metadata\">" + data.type + "</span>" + "<span class=\"result__metadata\">Released on " + data.releaseDate + "</span>" + "</div>";
}

/**
 * Initialise application
 */

function updateResults() {
    console.log('Fetching results for "%s"', state.query);

    if (state.query !== inputElem.value) {
        inputElem.value = state.query;
    }

    if (state.query) {
        document.getElementById('title').innerHTML = state.query + " - Search - Office for National Statistics";
    } else {
        document.getElementById('title').innerHTML = "Search - Office for National Statistics";
    }

    fetch(apiUrl + "/search?q=" + state.query).then(function (response) {
        return response.json();
    }).then(function (response) {
        state.count = response.total_results;
        appElem.innerHTML = searchTextComponent();

        if (response.total_results === 0) {
            return;
        }

        var results = response.results.map(function (result) {
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

            return resultItemComponent(data);
        });

        appElem.innerHTML += results.join('');
    });
}

function bindSearchSubmit() {

    searchElem.addEventListener('submit', function (event) {
        var query = inputElem.value;
        event.preventDefault();
        state.query = query;

        if (!query) {
            window.history.pushState({ query: query }, "", location.pathname);
            updateResults();
            return;
        }

        window.history.pushState({ query: query }, "", "?q=" + query);
        updateResults();
    });
}

function bindHistoryState() {
    window.onpopstate = function (event) {
        if (event.state) {
            state.query = event.state.query;
        } else {
            state.query = "";
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
