/**
 * Application variables
 */
const hostname = location.hostname;
const env = getEnvironmentType(hostname);
const apiUrl = "https://search.discovery.onsdigital.co.uk"; // If this needs to point at local version on server in the future use the 'env' variable to detect whether it's the development or production build
const appElem = document.getElementById('app');
const searchElem = document.getElementById('search');
const inputElem = document.getElementById('search__input');

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
    areaCount: 0,
    query: getUrlParams().q || ``,
    filter: {
        id: getUrlParams().filter || ``,
        name: getUrlParams().filter || ``
    }
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
        try {
            splitQuery[1] = decodeURIComponent(splitQuery[1]);
        } catch(e) {
            console.error(e);
        }

        returnValue[splitQuery[0]] = splitQuery[1];
    });

    return returnValue;
}

/**
 * HTML components
 */

function searchTextComponent(children) {
    const query = state.query;
    const count = state.count;
    const filter = state.filter.id;
    const filterName = state.filter.name;

    function wrapInContainer(children) {
        return (
            `<div class="border-bottom--iron-md border-bottom--iron-lg">
                <h2 class="search-text margin-top--2 margin-bottom--2">
                    ${children}
                </h2>
            </div>`
        )
    }

    if (children) {
        return wrapInContainer(children)
    }

    if (query && count === 0) {
        return wrapInContainer(`No results for <strong>'${state.query}'</strong>`);
    }

    if (!query) {
        return wrapInContainer(`No search query, showing all <strong>'${count}'</strong> results`);
    }

    if (query && filter) {
        return wrapInContainer(`<strong>${count}</strong> results found for <strong>'${query}'</strong>, filter by area type <strong>'${filterName}'</strong>`)
    }

    return wrapInContainer(`<strong>${count}</strong> results found for <strong>'${query}'</strong>`);
}

function areaSearchTextComponent() {
    const query = state.query;
    const count = state.areaCount;

    function wrapInContainer(children) {
        return (
            `<div class="col">
                <h2 class="search-text margin-top--2 margin-bottom--2">
                    ${children}
                </h2>
            </div>`
        )
    }

    return wrapInContainer(`
        Showing the top <strong>${(count > 4) ? `4` : count}</strong> suggested location${count > 1 ? `s` : ``}${query ? ` for <strong>'${query}'</strong>` : ''}.
        <a href="">View all</a>
    `)
}

function resultItemComponent(data) {
    return (
        `<div class="result border-bottom--iron-md border-bottom--iron-lg">
            <h3 class="result__title"><a href="">${data.title}</a></h3>
            <div class="result__description">${data.description}</div>
            <span class="result__metadata">${data.type}</span>
            <span class="result__metadata">Released on ${data.releaseDate}</span>
        </div>`
    );
}

function areaResultItemComponent(data) {
    return (
        `<div class="col col--lg-half background--iron-light margin-bottom--2 padding-top--2 padding-right--1 padding-bottom--2 padding-left--1">
            <span class="baseline">${data.type}</span>
            <span class="icon icon-arrow-right--dark float-right margin-top--1"></span>
            <h3 class="flush">
                <a class="area-link" href="/?q=${state.query}&filter=${data.type_id}" data-filter="${data.type_id}" data-filter-name="${data.type}">
                    ${data.title}
                </a>
            </h3>
        </div>
        `
    );
}


/**
 * View and data logic
 */

function updateResults() {

    // Fetch polyfill
    if (!window.fetch) {
        console.log('Using Fetch API polyfill');
        const js = document.createElement('script');
        js.src = 'https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.2/fetch.min.js';
        js.onload = function() {
            updateResults();
        };
        js.onerror = function() {
            console.log('Error getting fetch API polyfill');
        };
        document.head.appendChild(js);
        return;
    }

    if (state.query !== inputElem.value) {
        console.log('Fetching results for "%s"', state.query);
        inputElem.value = state.query;
    }

    if (state.query) {
        document.getElementById('title').innerHTML = state.query + ` - Search - Office for National Statistics`;
    } else {
        document.getElementById('title').innerHTML = `Search - Office for National Statistics`;
    }

    fetch(apiUrl + `/search?q=` + state.query + '&filter=' + state.filter.id).then(response => response.json()).then(response => {
        state.count = response.total_results;
        state.areaCount = response.area_results ? response.area_results.length : 0;

        // Remove current results
        while (appElem.firstChild) appElem.removeChild(appElem.firstChild);

        if (state.filter.id && state.count === 0) {
            console.log(`Display all results for ${state.filter.name}`);
            fetch(`${apiUrl}/search?filter=${state.filter.id}`).then(response => response.json()).then(response => {
                state.count = response.total_results;
                state.areaCount = response.area_results ? response.area_results.length : 0;
                appElem.innerHTML += buildAllResultForAreaType(response.results);
                bindAreaClick();
            });
            return false;
        }

        appElem.innerHTML += (buildAreaResults(response.area_results) + buildResults(response.results));
        bindAreaClick();
    }).catch(error => {
        console.log(`Error getting results data \n${error}`);
        while (appElem.firstChild) appElem.removeChild(appElem.firstChild);
        appElem.innerHTML += `
            <div class="col">
                <h2>Oops, there's been an error</h2>
                <p class="margin-top--2 margin-bottom--0">There was an issue getting your results.</p>
                <p class="flush">Please try again in a few moments.</p>
            </div>
        `
    });
}

function buildAllResultForAreaType(resultsData) {
    const HTMLParts = [];
    const searchText = `All <strong>'${state.count}'</strong> results, filtered by area type <strong>'${state.filter.name}'</strong>`;

    function wrapInContainer(children) {
        return (
            `<div class="col margin-bottom--3">
                ${searchTextComponent(searchText)}
                ${children}
            </div>`
        );
    }

    resultsData.map(result => {
        let date = result.body.metadata.release_date.split('+');

        // Check for invalid date
        if (date[1]) {
            date.pop();
            date.push('Z');
            date = date.join('');
        }

        const data = {
            title: result.body.title,
            description: result.body.metadata.description,
            type: result.type,
            releaseDate: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        HTMLParts.push(resultItemComponent(data));
    });

    return wrapInContainer(HTMLParts.join(''));
}

function buildResults(resultsData) {
    const HTMLParts = [];
    const count = state.count;

    if (count === 0) {
        return wrapInContainer(``);
    }

    function wrapInContainer(children) {
        return (
            `<div class="col margin-bottom--3">
                ${searchTextComponent()}
                ${children}
            </div>`
        );
    }

    resultsData.map(result => {
        let date = result.body.metadata.release_date.split('+');

        // Check for invalid date
        if (date[1]) {
            date.pop();
            date.push('Z');
            date = date.join('');
        }

        const data = {
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
    const HTMLParts = [];
    const count = state.areaCount;
    const query = state.query;

    if (count === 0 | !query) {
        return ``;
    }

    function wrapInContainer(children) {
        return (
            `<div style="width: 100%;" class="float-left border-bottom--iron-md border-bottom--iron-lg padding-bottom--2">
                ${areaSearchTextComponent()}
                ${children}
            </div>`
        )
    }

    resultsData.some((result, index) => {
        const data = {
            title: result.body.title,
            type: result.body.type,
            type_id: result.body.type_id
        };

        HTMLParts.push(areaResultItemComponent(data));

        return index === 3;
    });

    return wrapInContainer(HTMLParts.join(''));
}

function bindAreaClick() {

    const areaLinks = document.querySelectorAll('.area-link');

    areaLinks.forEach(link => {
       link.addEventListener('click', event => {
           handleClick(event);
       });
    });

    function handleClick(event) {
        event.preventDefault();
        state.filter.id = event.target.getAttribute('data-filter');
        state.filter.name = event.target.getAttribute('data-filter-name');
        window.history.pushState({query: state.query, filter: state.filter.id}, ``, `?q=${state.query}&filter=${state.filter.id}`);
        updateResults();
    }
}

function bindSearchSubmit() {

    searchElem.addEventListener('submit', event => {
        const query = inputElem.value;
        event.preventDefault();
        state.query = query;

        if (!query) {
            window.history.pushState({query: query, filter:state.filter.id}, ``, location.pathname);
            updateResults();
            return;
        }

        window.history.pushState({query: query, filter:state.filter.id}, ``, `?q=${query}&filter=${state.filter.id}`);
        updateResults();
    });
}

function bindHistoryState() {
    window.onpopstate = event => {
        if (event.state) {
            state.query = event.state.query;
        } else {
            state.query = ``;
        }
        updateResults();
    }
}

function init() {
    updateResults();
    bindSearchSubmit();
    bindHistoryState();
}

init();
