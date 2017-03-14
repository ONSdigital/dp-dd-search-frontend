import state from './state';
import updateResults from './updateResults';
import render from './render';
import utilities from './utilities';

const inputElem = document.getElementById('search__input');
const searchElem = document.getElementById('search');
const typeahead = document.getElementById('typeahead');

export default class bind {

    static areaClick() {

        const areaLinks = document.querySelectorAll('.area-link');

        areaLinks.forEach(link => {
            link.addEventListener('click', event => {
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
            const currentState = state.getState();
            window.history.pushState(state.getState(), ``, `?q=${currentState.query}&filter=${currentState.filter.id}`);
            updateResults();
        }
    }

    static typeaheadKeys() {
        searchElem.addEventListener('keydown', (event) => {
            const keyCode = event.keyCode;
            const upKey = 38;
            const downKey = 40;
            const escKey = 27;

            if (keyCode !== upKey && keyCode !== downKey && keyCode !== escKey) {
                return;
            }

            event.preventDefault();

            if (keyCode === escKey && typeahead.childNodes.length !== 0) {
                typeahead.style.display = 'none';
                render.emptyQuerySuggestions();
                return;
            }

            const suggestions = document.querySelectorAll('.typeahead__item');
            let focusIndex = (getFocusIndex(suggestions) !== undefined) ? getFocusIndex(suggestions) : -1;

            if (keyCode === downKey && focusIndex === -1 && typeahead.childNodes.length === 0 && inputElem.value) {
                utilities.getSuggestions(inputElem.value).then(suggestions => {
                    render.querySuggestions(suggestions);
                });
            }

            // Don't do anything for upkey if we're focused on the input
            if (focusIndex === -1 && keyCode === upKey) {
                return;
            }

            // Stop focus from attempting to go more than size of suggestions
            if (focusIndex >= suggestions.length-1 && keyCode === downKey) {
                return false;
            }

            // Stop focus trying to go to negative numbers
            if (focusIndex === 0 && keyCode === upKey) {
                console.log('First entry');
                return false;
            }

            // Remove class from focused suggestion
            if (focusIndex !== -1) {
                suggestions[focusIndex].classList.remove('focused');
            }

            // Edit focus index according to direction of arrow keys
            if (keyCode === downKey) {
                focusIndex++;
            }
            if (keyCode === upKey) {
                focusIndex--;
            }

            // Make sure next suggestion is in view, if not scroll into view
            const suggestionRect = suggestions[focusIndex].getBoundingClientRect();
            const containerRect = typeahead.getBoundingClientRect();
            const bottomDiff = suggestionRect.bottom - containerRect.bottom;
            const topDiff = suggestionRect.top - containerRect.top;
            if (bottomDiff > 0) {
                typeahead.scrollTop = typeahead.scrollTop + bottomDiff;
            }
            if (topDiff < 0) {
                typeahead.scrollTop = typeahead.scrollTop + topDiff;
            }

            // Add focus class to next suggestion and update input value
            suggestions[focusIndex].classList.add('focused');
            inputElem.value = suggestions[focusIndex].textContent;
        });

        function getFocusIndex(suggestions) {
            let response;
            suggestions.forEach((suggestion, index) => {
                if (suggestion.classList.contains('focused')) {
                    response = index;
                }
            });
            return response;
        }
    }

    static searchFocus() {
        searchElem.addEventListener('focusout', () => {
            typeahead.style.display = 'none';
            render.emptyQuerySuggestions();
        });
    }

    static searchSubmit() {

        searchElem.addEventListener('submit', event => {
            const query = inputElem.value;
            event.preventDefault();

            if (typeahead.childNodes.length !== 0) {
                typeahead.style.display = 'none';
                render.emptyQuerySuggestions();
            }

            state.updateState({
                type: 'UPDATE_QUERY',
                value: query
            });
            state.updateState({
                type: 'UPDATE_FILTER',
                value: {id: "", name: ""}
            });

            if (!query) {
                window.history.pushState(state.getState(), ``, location.pathname);
                updateResults();
                return;
            }

            window.history.pushState(state.getState(), ``, `?q=${query}`);
            updateResults();
        });
    }

    static searchChange() {
        let inputTimer;

        inputElem.addEventListener('input', event => {
            if (!inputElem.value) {
                return;
            }

            clearTimeout(inputTimer);
            inputTimer = setTimeout(() => {
                utilities.getSuggestions(inputElem.value).then(suggestions => {
                    render.querySuggestions(suggestions);
                });
            }, 100)
        })
    }

    static historyState() {
        window.onpopstate = event => {
            state.updateState({
                type: 'UPDATE_QUERY',
                value: event.state.query
            });
            state.updateState({
                type: 'UPDATE_FILTER',
                value: event.state.filter
            });
            state.updateState({
                type: 'UPDATE_COUNT',
                value: event.state.count
            });
            state.updateState({
                type: 'UPDATE_AREA_COUNT',
                value: event.state.areaCount
            });
            updateResults();
        }
    }
}
