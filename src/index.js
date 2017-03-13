/* Imports */
import bind from './bind';
import updateResults from './updateResults'
import state from './state';

/* Initialise application */
function init() {
    // const currentState = state.getState();
    // window.history.pushState({query: currentState.query, filter: currentState.filter.id}, '', location);

    updateResults();
    bind.searchChange();
    bind.searchSubmit();
    bind.historyState();
}

init();
