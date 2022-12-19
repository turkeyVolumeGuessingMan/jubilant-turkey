
const takeAction = {

        $: `get n$`,

        check: () => {
            if (gDobj.location === g$.location) {
                return true;
            } else {
                return false;
            }
        },

        action: () => {
            take(gDobjId);
        },
        
        score: 21,
    }
