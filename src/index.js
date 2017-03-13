/* Imports */
import bind from './bind';
import updateResults from './updateResults';

/* Initialise application */
function init() {
    updateResults();
    bind.searchChange();
    bind.searchSubmit();
    bind.historyState();
}

init();
