import state from './state';

export default class templates {

    static searchText(children) {
        const currentState = state.getState();
        const query = currentState.query;
        const count = currentState.count;
        const filter = currentState.filter.id;
        const filterName = currentState.filter.name;

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
            return wrapInContainer(`No results for <strong>'${currentState.query}'</strong>`);
        }

        if (!query) {
            return wrapInContainer(`No search query, showing all <strong>'${count}'</strong> results`);
        }

        if (query && filter) {
            return wrapInContainer(`<strong>${count}</strong> results found for <strong>'${query}'</strong>, filtered by area type <strong>'${filterName}'</strong>`)
        }

        return wrapInContainer(`<strong>${count}</strong> results found for <strong>'${query}'</strong>`);
    }

    static areaSearchText() {
        const currentState = state.getState();
        const query = currentState.query;
        const count = currentState.areaCount;

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

    static datasetResultItem(data) {
        return (
            `<div class="result border-bottom--iron-md border-bottom--iron-lg">
            <h3 class="result__title"><a href="">${data.title}</a></h3>
            <div class="result__description">${data.description}</div>
            <span class="result__metadata">${data.type}</span>
            <span class="result__metadata">Released on ${data.releaseDate}</span>
        </div>`
        );
    }

    static areaResultItem(data) {
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
}
