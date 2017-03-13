import state from './state';
import templates from './templates';

const appElem = document.getElementById('app');
const title = document.getElementById('title');

export default class render {

    static emptyResults() {
        while (appElem.firstChild) appElem.removeChild(appElem.firstChild);
    }

    static allResults(areaResults, datasetResults) {
        this.areaResults(areaResults);
        this.datasetResults(datasetResults)
    }

    static allResultsForAreaType(resultsData) {
        const HTMLParts = [];
        const currentState = state.getState();
        const searchText = `All <strong>'${currentState.count}'</strong> results, filtered by <strong>'${currentState.query}'</strong> as a <strong>'${currentState.filter.name}'</strong>`;

        function wrapInContainer(children) {
            return (
                `<div class="col margin-bottom--3">
                ${templates.searchText(searchText)}
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

            HTMLParts.push(templates.datasetResultItem(data));
        });

        appElem.innerHTML += wrapInContainer(HTMLParts.join(''));
    }

    static datasetResults(resultsData) {
        const HTMLParts = [];
        const count = state.getState().count;

        if (count === 0) {
            return wrapInContainer(``);
        }

        function wrapInContainer(children) {
            return (
                `<div class="col margin-bottom--3">
                ${templates.searchText()}
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

            HTMLParts.push(templates.datasetResultItem(data));
        });

        appElem.innerHTML += wrapInContainer(HTMLParts.join(''));
    }

    static areaResults(resultsData) {
        const HTMLParts = [];
        const currentState = state.getState();
        const count = currentState.areaCount;
        const query = currentState.query;

        if (count === 0 || !query) {
            return ``;
        }

        function wrapInContainer(children) {
            return (
                `<div style="width: 100%;" class="float-left border-bottom--iron-md border-bottom--iron-lg padding-bottom--2">
                ${templates.areaSearchText()}
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

            HTMLParts.push(templates.areaResultItem(data));

            return index === 3;
        });

        appElem.innerHTML += wrapInContainer(HTMLParts.join(''));
    }

    static error() {
        appElem.innerHTML += `
            <div class="col">
                <h2>Oops, there's been an error</h2>
                <p class="margin-top--2 margin-bottom--0">There was an issue getting your results.</p>
                <p class="flush">Please try again in a few moments.</p>
            </div>
        `
    }

    static title(query) {
        if (query) {
            title.innerHTML = query + ` - Search - Office for National Statistics`;
        } else {
            title.innerHTML = `Search - Office for National Statistics`;
        }
    }
}
