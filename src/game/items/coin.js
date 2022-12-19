/**
 * 
 * @typedef Item
 *
 * @type {
 *  
 * location {GameLocationID}
 *  
 * commands {Command[]}
 * 
 * }
 *  
 */

/**
 * @typeof {Item}
 */
Game.coin = {

    location: 'skull',

    name: 'coin',
    desc: () => `a shiny gold coin`,

    specialDesc: () => `
    
    A bit of gold glints at you from inside the skull.
    
    `,

    commands: () => [
        {
            $: `examine coin`,
            action: () => `
            
            <img src="key.png" />


            ---Gold guinea, minted in 1687.---

            
            `,
        },
        takeAction,

    ]

}