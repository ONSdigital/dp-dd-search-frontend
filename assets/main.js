'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var utilities = function () {
    function utilities() {
        classCallCheck(this, utilities);
    }

    createClass(utilities, null, [{
        key: 'getEnvironmentType',
        value: function getEnvironmentType(hostname) {
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
    }, {
        key: 'getUrlParams',
        value: function getUrlParams() {
            var queryString = location.search;
            if (!queryString) {
                return {};
            }

            var queries = queryString.split(/[\&?]+/);
            queries.splice(0, 1);

            var returnValue = {};
            queries.forEach(function (query) {
                var splitQuery = query.split('=');
                try {
                    splitQuery[1] = decodeURIComponent(splitQuery[1]);
                } catch (e) {
                    console.error(e);
                }

                returnValue[splitQuery[0]] = splitQuery[1];
            });

            return returnValue;
        }
    }]);
    return utilities;
}();

var currentState = {
    count: 0,
    areaCount: 0,
    query: utilities.getUrlParams().q || '',
    filter: {
        id: utilities.getUrlParams().filter || '',
        name: utilities.getUrlParams().filter || ''
    },
    apiUrl: "https://search.discovery.onsdigital.co.uk"
};

var state = function () {
    function state() {
        classCallCheck(this, state);
    }

    createClass(state, null, [{
        key: 'getState',
        value: function getState() {
            return JSON.parse(JSON.stringify(currentState));
        }
    }, {
        key: 'updateState',
        value: function updateState(action) {
            var newState = this.getState();
            console.log('State update: \n', action);
            switch (action.type) {
                case 'UPDATE_COUNT':
                    {
                        newState.count = action.value;
                        break;
                    }
                case 'UPDATE_AREA_COUNT':
                    {
                        newState.areaCount = action.value;
                        break;
                    }
                case 'UPDATE_QUERY':
                    {
                        newState.query = action.value;
                        break;
                    }
                case 'UPDATE_FILTER':
                    {
                        newState.filter = action.value;
                        break;
                    }
            }

            currentState = newState;
        }
    }]);
    return state;
}();

var templates = function () {
    function templates() {
        classCallCheck(this, templates);
    }

    createClass(templates, null, [{
        key: 'searchText',
        value: function searchText(children) {
            var currentState = state.getState();
            var query = currentState.query;
            var count = currentState.count;
            var filter = currentState.filter.id;
            var filterName = currentState.filter.name;

            function wrapInContainer(children) {
                return '<div class="border-bottom--iron-md border-bottom--iron-lg">\n                <h2 class="search-text margin-top--2 margin-bottom--2">\n                    ' + children + '\n                </h2>\n            </div>';
            }

            if (children) {
                return wrapInContainer(children);
            }

            if (query && count === 0) {
                return wrapInContainer('No results for <strong>\'' + currentState.query + '\'</strong>');
            }

            if (!query) {
                return wrapInContainer('No search query, showing all <strong>\'' + count + '\'</strong> results');
            }

            if (query && filter) {
                return wrapInContainer('<strong>' + count + '</strong> results found for <strong>\'' + query + '\'</strong>, filter by area type <strong>\'' + filterName + '\'</strong>');
            }

            return wrapInContainer('<strong>' + count + '</strong> results found for <strong>\'' + query + '\'</strong>');
        }
    }, {
        key: 'areaSearchText',
        value: function areaSearchText() {
            var currentState = state.getState();
            var query = currentState.query;
            var count = currentState.areaCount;

            function wrapInContainer(children) {
                return '<div class="col">\n                <h2 class="search-text margin-top--2 margin-bottom--2">\n                    ' + children + '\n                </h2>\n            </div>';
            }

            return wrapInContainer('\n        Showing the top <strong>' + (count > 4 ? '4' : count) + '</strong> suggested location' + (count > 1 ? 's' : '') + (query ? ' for <strong>\'' + query + '\'</strong>' : '') + '.\n        <a href="">View all</a>\n    ');
        }
    }, {
        key: 'datasetResultItem',
        value: function datasetResultItem(data) {
            return '<div class="result border-bottom--iron-md border-bottom--iron-lg">\n            <h3 class="result__title"><a href="">' + data.title + '</a></h3>\n            <div class="result__description">' + data.description + '</div>\n            <span class="result__metadata">' + data.type + '</span>\n            <span class="result__metadata">Released on ' + data.releaseDate + '</span>\n        </div>';
        }
    }, {
        key: 'areaResultItem',
        value: function areaResultItem(data) {
            return '<div class="col col--lg-half background--iron-light margin-bottom--2 padding-top--2 padding-right--1 padding-bottom--2 padding-left--1">\n            <span class="baseline">' + data.type + '</span>\n            <span class="icon icon-arrow-right--dark float-right margin-top--1"></span>\n            <h3 class="flush">\n                <a class="area-link" href="/?q=' + state.query + '&filter=' + data.type_id + '" data-filter="' + data.type_id + '" data-filter-name="' + data.type + '">\n                    ' + data.title + '\n                </a>\n            </h3>\n        </div>\n        ';
        }
    }]);
    return templates;
}();

var appElem = document.getElementById('app');
var _title = document.getElementById('title');

var render = function () {
    function render() {
        classCallCheck(this, render);
    }

    createClass(render, null, [{
        key: 'emptyResults',
        value: function emptyResults() {
            while (appElem.firstChild) {
                appElem.removeChild(appElem.firstChild);
            }
        }
    }, {
        key: 'allResults',
        value: function allResults(areaResults, datasetResults) {
            appElem.innerHTML += this.areaResults(areaResults) + this.datasetResults(datasetResults);
        }
    }, {
        key: 'allResultsForAreaType',
        value: function allResultsForAreaType(resultsData) {
            var HTMLParts = [];
            var currentState = state.getState();
            var searchText = 'All <strong>\'' + currentState.count + '\'</strong> results, filtered by area type <strong>\'' + currentState.filter.name + '\'</strong>';

            function wrapInContainer(children) {
                return '<div class="col margin-bottom--3">\n                ' + templates.searchText(searchText) + '\n                ' + children + '\n            </div>';
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

                HTMLParts.push(templates.datasetResultItem(data));
            });

            appElem.innerHTML += wrapInContainer(HTMLParts.join(''));
        }
    }, {
        key: 'datasetResults',
        value: function datasetResults(resultsData) {
            var HTMLParts = [];
            var count = state.getState().count;

            if (count === 0) {
                return wrapInContainer('');
            }

            function wrapInContainer(children) {
                return '<div class="col margin-bottom--3">\n                ' + templates.searchText() + '\n                ' + children + '\n            </div>';
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

                HTMLParts.push(templates.datasetResultItem(data));
            });

            return wrapInContainer(HTMLParts.join(''));
        }
    }, {
        key: 'areaResults',
        value: function areaResults(resultsData) {
            var HTMLParts = [];
            var currentState = state.getState();
            var count = currentState.areaCount;
            var query = currentState.query;

            if (count === 0 || !query) {
                return '';
            }

            function wrapInContainer(children) {
                return '<div style="width: 100%;" class="float-left border-bottom--iron-md border-bottom--iron-lg padding-bottom--2">\n                ' + templates.areaSearchText() + '\n                ' + children + '\n            </div>';
            }

            resultsData.some(function (result, index) {
                var data = {
                    title: result.body.title,
                    type: result.body.type,
                    type_id: result.body.type_id
                };

                HTMLParts.push(templates.areaResultItem(data));

                return index === 3;
            });

            return wrapInContainer(HTMLParts.join(''));
        }
    }, {
        key: 'error',
        value: function error() {
            appElem.innerHTML += '\n            <div class="col">\n                <h2>Oops, there\'s been an error</h2>\n                <p class="margin-top--2 margin-bottom--0">There was an issue getting your results.</p>\n                <p class="flush">Please try again in a few moments.</p>\n            </div>\n        ';
        }
    }, {
        key: 'title',
        value: function title(query) {
            if (query) {
                _title.innerHTML = query + ' - Search - Office for National Statistics';
            } else {
                _title.innerHTML = 'Search - Office for National Statistics';
            }
        }
    }]);
    return render;
}();

var inputElem$1 = document.getElementById('search__input');

function updateResults() {

    var currentState = state.getState();

    // Fetch polyfill
    if (!window.fetch) {
        console.log('Using Fetch API polyfill');
        var js = document.createElement('script');
        js.src = 'https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.2/fetch.min.js';
        js.onload = function () {
            updateResults();
        };
        js.onerror = function () {
            console.log('Error getting fetch API polyfill');
        };
        document.head.appendChild(js);
        return;
    }

    if (currentState.query !== inputElem$1.value) {
        console.log('Fetching results for "%s"', currentState.query);
        inputElem$1.value = currentState.query;
    }

    render.title(currentState.query);

    fetch(currentState.apiUrl + '/search?q=' + currentState.query + '&filter=' + currentState.filter.id).then(function (response) {
        return response.json();
    }).then(function (response) {
        state.updateState({
            type: 'UPDATE_COUNT',
            value: response.total_results
        });
        state.updateState({
            type: 'UPDATE_AREA_COUNT',
            value: response.area_results ? response.area_results.length : 0
        });

        render.emptyResults();

        if (state.getState().filter.id && state.getState().count === 0) {
            console.log('Display all results for ' + state.getState().filter.name);
            fetch(state.getState().apiUrl + '/search?filter=' + state.getState().filter.id).then(function (response) {
                return response.json();
            }).then(function (response) {
                state.updateState({
                    type: 'UPDATE_COUNT',
                    value: response.total_results
                });
                state.updateState({
                    type: 'UPDATE_AREA_COUNT',
                    value: response.area_results ? response.area_results.length : 0
                });
                render.allResultsForAreaType(response.results);
                bind.areaClick();
            });
            return false;
        }

        render.allResults(response.area_results, response.results);
        bind.areaClick();
    }).catch(function (error) {
        console.log('Error getting results data \n', error);
        render.emptyResults();
        render.error();
    });
}

var inputElem = document.getElementById('search__input');
var searchElem = document.getElementById('search');

var bind = function () {
    function bind() {
        classCallCheck(this, bind);
    }

    createClass(bind, null, [{
        key: 'areaClick',
        value: function areaClick() {

            var areaLinks = document.querySelectorAll('.area-link');

            areaLinks.forEach(function (link) {
                link.addEventListener('click', function (event) {
                    handleClick(event);
                });
            });

            function handleClick(event) {
                event.preventDefault();
                state.updateState({
                    type: 'UPDATE_FILTER',
                    value: {
                        id: event.target.getAttribute('data-filter'),
                        name: event.target.getAttribute('data-filter-name')
                    }
                });
                var currentState = state.getState();
                window.history.pushState({ query: currentState.query, filter: currentState.filter.id }, '', '?q=' + currentState.query + '&filter=' + currentState.filter.id);
                updateResults();
            }
        }
    }, {
        key: 'searchSubmit',
        value: function searchSubmit() {

            searchElem.addEventListener('submit', function (event) {
                var query = inputElem.value;
                event.preventDefault();
                state.updateState({
                    type: 'UPDATE_QUERY',
                    value: query
                });
                state.updateState({
                    type: 'UPDATE_FILTER',
                    value: { id: "", name: "" }
                });

                if (!query) {
                    window.history.pushState({ query: query }, '', location.pathname);
                    updateResults();
                    return;
                }

                window.history.pushState({ query: query }, '', '?q=' + query);
                updateResults();
            });
        }
    }, {
        key: 'searchChange',
        value: function searchChange() {

            inputElem.addEventListener('input', function (event) {
                var inputValue = inputElem.value;
                fetch('https://search.discovery.onsdigital.co.uk/suggest?q=' + inputValue).then(function (response) {
                    return response.json();
                }).then(function (response) {
                    console.log({ inputValue: inputValue, response: response });
                });
            });
        }
    }, {
        key: 'historyState',
        value: function historyState() {
            window.onpopstate = function (event) {
                state.updateState({
                    type: 'UPDATE_QUERY',
                    value: event.state ? event.state.query : ''
                });
                updateResults();
            };
        }
    }]);
    return bind;
}();

/* Imports */
function init() {
    updateResults();
    bind.searchChange();
    bind.searchSubmit();
    bind.historyState();
}

init();
//# sourceMappingURL=main.js.map
