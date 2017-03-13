import state from './state';
import updateResults from './updateResults';
import render from './render';

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
            window.history.pushState({query: currentState.query, filter: currentState.filter.id}, ``, `?q=${currentState.query}&filter=${currentState.filter.id}`);
            updateResults();
        }
    }

    static typeaheadArrowKeys() {
        searchElem.addEventListener('keypress', (event) => {
            const keyCode = event.keyCode;
            const upKey = '38';
            const downKey = '40';

            if (keyCode !== upKey || keyCode !== downKey) {
                return;
            }

            const suggestions = document.getElementsByClass('typeahead__item');
            let focusIndex = -1; // Default position of no suggestions being focused on

        });
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
            state.updateState({
                type: 'UPDATE_QUERY',
                value: query
            });
            state.updateState({
                type: 'UPDATE_FILTER',
                value: {id: "", name: ""}
            });

            if (!query) {
                window.history.pushState({query: query}, ``, location.pathname);
                updateResults();
                return;
            }

            window.history.pushState({query: query}, ``, `?q=${query}`);
            updateResults();
        });
    }

    static searchChange() {
        let inputTimer;

        inputElem.addEventListener('input', event => {
            const inputValue = event.target.value;

            clearTimeout(inputTimer);
            inputTimer = setTimeout(() => {
                fetch(`${state.getState().apiUrl}/suggest?q=${inputValue}`).then(response => response.json()).then(response => {
                    if (response.total_results === 0) {
                        return;
                    }
                    const suggestions = response.results.map(result => {
                        return result.body.title;
                    });
                    render.querySuggestions(suggestions);
                });
            }, 100)
        })
    }

    static historyState() {
        window.onpopstate = event => {
            state.updateState({
                type: 'UPDATE_QUERY',
                value: event.state ? event.state.query : ``
            });
            updateResults();
        }
    }
}
