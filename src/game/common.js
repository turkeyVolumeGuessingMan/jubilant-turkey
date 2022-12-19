/**
 *
 * Common command set
 * Used for global game commands
 * Can be overridden by items or characters.
 */
Game.common = {
  commands: [
    {
      $: `inventory`,

      action: () => inventoryList(),
      score: 15,
    },
    {
      $: "read journal",
      action: () => `
            You probably want to know how you got here. Well, settle in.
            `,
      score: 20,
    },
  ],
};
