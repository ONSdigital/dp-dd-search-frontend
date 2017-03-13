
export default class utilities {

    static getEnvironmentType(hostname) {
        switch (hostname) {
            case 'localhost':
            {
                return `development`;
            }
            case '127.0.0.1':
            {
                return `development`;
            }
            default:
            {
                return `production`;
            }
        }
    }

    static getUrlParams() {
        const queryString = location.search;
        if (!queryString) {
            return {};
        }

        let queries = queryString.split(/[\&?]+/);
        queries.splice(0, 1);

        let returnValue = {};
        queries.forEach(query => {
            const splitQuery = query.split('=');
            try {
                splitQuery[1] = decodeURIComponent(splitQuery[1]);
            } catch(e) {
                console.error(e);
            }

            returnValue[splitQuery[0]] = splitQuery[1];
        });

        return returnValue;
    }
}
