import utilities from './utilities';

let currentState = {
    count: 0,
    areaCount: 0,
    query: utilities.getUrlParams().q || ``,
    filter: {
        id: utilities.getUrlParams().filter || ``,
        name: utilities.getUrlParams().filter || ``
    },
    apiUrl: "https://search.discovery.onsdigital.co.uk"
};

export default class state {

    static getState() {
        return JSON.parse(JSON.stringify(currentState));
    }

    static updateState(action) {
        const newState = this.getState();
        console.log(`State update: \n`, action);
        switch (action.type) {
            case ('UPDATE_COUNT'): {
                newState.count = action.value;
                break;
            }
            case ('UPDATE_AREA_COUNT'): {
                newState.areaCount = action.value;
                break;
            }
            case ('UPDATE_QUERY'): {
                newState.query = action.value;
                break;
            }
            case ('UPDATE_FILTER'): {
                newState.filter = action.value;
                break;
            }
        }

        currentState = newState;
    }

}
