/* Imports */
import bind from './bind';
import updateResults from './updateResults';

/* Initialise application */
function init() {
    updateResults();
    bind.typeaheadArrowKeys();
    bind.searchFocus();
    bind.searchChange();
    bind.searchSubmit();
    bind.historyState();
}

init();
