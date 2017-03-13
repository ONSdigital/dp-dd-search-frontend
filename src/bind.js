import state from './state';
import updateResults from './updateResults';

const inputElem = document.getElementById('search__input');
const searchElem = document.getElementById('search');

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

        inputElem.addEventListener('input', event => {
            const inputValue = inputElem.value;
            fetch(`https://search.discovery.onsdigital.co.uk/suggest?q=${inputValue}`).then(response => response.json()).then(response => {
                console.log({inputValue, response});
            });
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
