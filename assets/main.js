/**
 * Application variables
 */
const hostname = location.hostname;
const env = getEnvironmentType(hostname);
const apiUrl = env === "development" ? "http://localhost:20051" : "TODO";

function getEnvironmentType(hostname) {
    switch (hostname) {
        case 'localhost':
            {
                return `development`;
            }
        case '127.0.0.1':
            {
                return `development`;
            }
        default:
            {
                return `production`;
            }
    }
}

let state = {
    count: 0,
    query: getUrlParams().q || ``
};

function getUrlParams() {
    const queryString = location.search;
    if (!queryString) {
        return {};
    }

    let queries = queryString.split(/[\&?]+/);
    queries.splice(0, 1);

    let returnValue = {};
    queries.forEach(query => {
        const splitQuery = query.split('=');
        returnValue[splitQuery[0]] = splitQuery[1];
    });

    return returnValue;
}

/**
 * HTML components
 */

function searchTextComponent() {
    const query = state.query;
    const count = state.count;

    if (query && count === 0) {
        return `<h2 class="search-text margin-top--1 margin-bottom--4">No results for <strong>` + state.query + `</strong></h2>`;
    }

    if (!query) {
        return `<h2 class="search-text margin-top--1 margin-bottom--4">No search query, showing all <strong>` + count + `</strong> results</h2>`;
    }

    return `<h2 class="search-text margin-top--1 margin-bottom--4"><strong>` + count + `</strong> results found for <strong>` + query + `</strong>.</h2>`;
}

function resultItemComponent(data) {
    return `<div class="result border-top--iron-lg">` + `<h3 class="result__title"><a href="">` + data.title + `</a></h3>` + `<p class="result__description">` + data.description + `</p>` + `<span class="result__metadata">` + data.type + `</span>` + `<span class="result__metadata">Released on ` + data.releaseDate + `</span>` + `</div>`;
}

/**
 * Initialise application
 */

function updateResults() {
    fetch(apiUrl + `/search?q=` + state.query).then(response => response.json()).then(response => {
        if (response.total_results === 0) {
            document.getElementById('app').innerHTML = searchTextComponent();
            return;
        }

        const results = response.results.map(result => {
            const data = {
                title: result.body.title,
                description: result.body.metadata.description,
                type: result.type,
                releaseDate: new Date(result.body.metadata.release_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            };
            return resultItemComponent(data);
        });

        state.count = response.total_results;

        document.getElementById('app').innerHTML = searchTextComponent() + results.join('');
    });
}

function bindSearchSubmit() {
    const searchElem = document.getElementById('search');

    searchElem.addEventListener('submit', event => {
        const query = document.getElementById('search__input').value;
        event.preventDefault();
        state.query = query;
        updateResults();
    });
}

updateResults();
bindSearchSubmit();
