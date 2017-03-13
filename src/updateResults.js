import render from './render';
import state from './state';
import bind from './bind';

const inputElem = document.getElementById('search__input');

export default function updateResults() {

    const currentState = state.getState();

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

    if (currentState.query !== inputElem.value) {
        console.log('Fetching results for "%s"', currentState.query);
        inputElem.value = currentState.query;
    }

    render.title(currentState.query);

    fetch(currentState.apiUrl + `/search?q=` + currentState.query + '&filter=' + currentState.filter.id).then(response => response.json()).then(response => {
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
            console.log(`Display all results for ${state.getState().filter.name}`);
            fetch(`${state.getState().apiUrl}/search?filter=${state.getState().filter.id}`).then(response => response.json()).then(response => {
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
    }).catch(error => {
        console.log(`Error getting results data \n`, error);
        render.emptyResults();
        render.error();
    });
}
