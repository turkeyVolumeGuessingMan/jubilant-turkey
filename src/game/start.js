/**
 * @typedef Command
 * @type {
 *
 * $ {string} Command string. This is what the player types to accomplish action.
 *
 * check {function(): boolean} Check that action is even to be suggested at this point.
 *
 * verify {function(): string} Verify that action can be done. If string is returned, action will not be done.
 *
 * action {function(): void} Action to perform.
 *
 * score {number} Order at which the choice gets rated. Higher is more likely to be shown first.
 *
 * }
 */

/**
 * @typedef Room
 * @type {
 *
 * desc {function(): string} Room description.
 *
 * firstTime: {function(): string} First time room gets displayed.
 *  commands {Command[]}
 *
 * }
 */

const bl = `

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dolor sit amet consectetur adipiscing. Risus quis varius quam quisque id diam vel. Libero volutpat sed cras ornare arcu dui vivamus arcu felis. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Vitae ultricies leo integer malesuada nunc vel risus. Orci a scelerisque purus semper eget duis at tellus. A iaculis at erat pellentesque adipiscing commodo elit. Rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Ac turpis egestas sed tempus urna et pharetra. Varius sit amet mattis vulputate enim. Etiam non quam lacus suspendisse faucibus interdum posuere lorem ipsum. Tellus rutrum tellus pellentesque eu tincidunt. Diam quam nulla porttitor massa id neque. Sit amet aliquam id diam maecenas. Morbi tempus iaculis urna id volutpat lacus laoreet non. Vitae et leo duis ut. Quam viverra orci sagittis eu volutpat odio facilisis mauris. Pellentesque diam volutpat commodo sed egestas egestas. A diam sollicitudin tempor id eu nisl nunc mi ipsum.

`;

/**
 * @type {Room}
 *
 */
Game.start = {
  desc: () => `
    
    The cold little dungeon offers little but a few rats, a shut timber door, and the previous resident.
    He clearly hasn't seen a meal in a while.
    
    `,

  firstTime: () => `
    
    [If this is your first time playing this game, you may want to read the journal.]

    `,

  commands: () => [
    {
      $: "open door",
      action: () => `The door won't budge despite your best efforts.`,
    },
    {
      $: "look",
      action: () => showRoomDesc(),
    },
    {
      $: "look closer at skeleton",
      action: () => {
        if (g$.coin.location === "skull") {
          move("coin", "start");
          return `
                    
                    A shiny bit of gold coin sparkles in the skull.
                    
                `;
        } else {
          return `
                    
                    Nothing of interest remains in the skull.
                    
                `;
        }
      },
      score: 15,
    },
  ],
};
