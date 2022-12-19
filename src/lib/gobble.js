// public api interface
let msg = (content, options) => {};
let clear = (onCompleted = {});

/**
 * 
 * Get all things (by string identifier) in a location.
 * 
 * @param {string} location 
 * @returns 
 */
const getAllInLocation = (location) => {
  return Object.keys(g$).filter((o) => g$[o].location === location);
};

/**
 * Show room description. This also shows all things in the location.
 */
const showRoomDesc = () => {
  const presentItems = Object.keys(g$)
    .filter((c) => g$[c].location === g$.location)
    .map((i) => g$[i]);
  msg(`
    
    ${g$[g$.location].desc()}
    
    `);
  presentItems.map((c) => {
    if (c.specialDesc) {
      msg(c.specialDesc());
    }
  });
};

/**
 * 
 * Move thing to another location. This incurs no text output.
 * 
 * @param {string} thing 
 * @param {string} location 
 */
const move = (thing, location) => {
  g$[thing].location = location;
};

/**
 * List inventory on screen.
 */
const inventoryList = () => {
  const items = getAllInLocation("player");
  if (items.length > 0) {
    msg(`You have: `);
    items.map((i) => {
      msg(`&ensp;${g$[i].desc()}`);
    });
  } else {
    msg(`Presently, you carry nothing.`);
  }
};


/**
 * 
 * Add thing to player inventory.
 * 
 * @param {string} thing 
 */
const take = (thing) => {
  if (g$[thing].location === g$.location) {
    move(thing, "player");
    msg(`Taken.`);
    if (!g$.firstItem) {
      msg(
        `[You can always check your inventory by pressing the <b>I</b> key.]`
      );
    }
  }
};


/**
 * Go to room.
 * @param {GameLocationID} room
 */
let go = (room) => {};


/**
 * Primary turkey system. This should not be called beyond program load.
 */
function makeMeADancingTurkey() {
  // primary turkeyness goes here
  g$.suggestions = [];
  g$.keyBuf = [];
  let cmds = [];

  // ensure labels are well stuffed
  const getLabel = (c) => {
    const name = c?.obj?.name;
    if (name) {
      return c?.$.replace("n$", name) ?? "";
    } else {
      return c?.$ ?? "";
    }
  };

  // search for common butterballs
  function getCommon(arr) {
    for (let i = 1; i < getLabel(arr[0]).length + 1; i += 1) {
      for (let n = 1; n < arr.length; n += 1) {
        if (getLabel(arr[n])[i] !== getLabel(arr[n - 1])[i]) {
          if (i > 0) {
            return getLabel(arr[n - 1]).slice(0, i);
          } else {
            return getLabel(arr[n - 1]).split(" ")[0];
          }
        }
      }
    }
    return "";
  }

  const reheatLeftovers = () => {
    const presentThings = getAllInLocation(g$.location);

    const commonCommands = g$.common.commands
      .map((c) => {
        const check = c.check;
        if (typeof check === "function" && check() === false) {
          return "";
        }
        return c;
      })
      .filter((c) => c !== "");

    const thingCommands = presentThings
      .filter((m) => g$[m].commands !== undefined)
      .map((c) => {
        let commands = g$[c].commands();
        commands.map((cm) => {
          cm.objId = c;
          cm.obj = g$[c];
        });
        return commands
          .filter((cm) => {
            const check = cm.check;
            gDobj = cm.obj;
            gDobjId = cm.objId;
            if (typeof check === "function" && check() === false) {
              return false;
            }
            return true;
          })
          .map((cm) => {
            gDobj = cm.obj;
            gDobjId = cm.objId;
            if (typeof cm === "function") {
              return cm();
            } else {
              return cm;
            }
          });
      });

    cmds = [
      ...g$[g$.location]
        .commands()
        .map((c) => {
          const check = c.check;
          if (typeof check === "function" && check() === false) {
            return "";
          }
          return c;
        })
        .filter((f) => f != ""),
      ...commonCommands,
    ];
    for (const a of thingCommands) {
      for (const b of a) {
        cmds.push(b);
      }
    }
  };

  // separate all elements in place
  const buildPageCranberries = () => {
    const main = document.createElement("div");

    // create elements we'll be turkeying
    const input = document.createElement("div");
    const inputCommand = document.createElement("div");
    const page = document.createElement("div");
    const cursor = document.createElement("div");
    const suggestBar = document.createElement("div");
    const upper = document.createElement("div");
    const lower = document.createElement("div");

    const getCursor = (arr) => {
      if (!arr) {
        return;
      }
      if (arr.length === 1) {
        //return " ✓";
        return "<div class='bigCursor'>🏴‍☠️️</div>";
      }
      //return "✍️";
      return "<div class='cursorBlink'>▌</div>";
    };

    // gobble gobble set their attributes
    main.className = "main";
    upper.className = "upperOutput";
    page.className = "page";
    upper.appendChild(page);
    inputCommand.className = "inputCommand";
    input.appendChild(inputCommand);
    suggestBar.className = "suggestBar";
    cursor.innerHTML = getCursor([]);
    lower.className = "lowerOutput";
    input.className = "input";
    lower.appendChild(suggestBar);
    input.appendChild(cursor);
    main.appendChild(upper);
    main.appendChild(lower);
    main.appendChild(input);
    document.body.appendChild(main);

    // set clear function. called each turkey move
    clear = (onCompleted) => {
      inputCommand.innerHTML = "";
      const oldSuggestions = `<div class='pageOut'>${suggestBar.innerHTML}</div>`;
      const oldPage = `<div class='pageOut'>${page.innerHTML}</div>`;
      suggestBar.innerHTML = oldSuggestions;
      page.innerHTML = oldPage;
      setTimeout(() => {
        suggestBar.innerHTML = "";
        upper.innerHTML = "";
        const newPage = document.createElement("div");
        newPage.className = "page";
        upper.appendChild(newPage);
        onCompleted();
      }, 270);
    };

    // set final code for go function
    go = (location) => {
      clear(() => {
        g$.location = location;
        showRoomDesc();
        if (!g$[location].hasVisited) {
          const m =
            typeof g$[location].firstTime === "function"
              ? g$[location].firstTime()
              : "";
          if (m) {
            msg(m, { append: true });
          }
          g$[location].hasVisited = true;
          processStuffing();
        }
      });
    };

    // set msg, or message function, primary output to gobble gobble
    msg = (str, options) => {
      // private function to handle array printing in msg
      const incrementPrint = (arr) => {
        const showFirst = arr[0];
        const stringToHash = () => {
          let hash = 0;
          if (showFirst.length == 0) {
            return hash;
          }
          for (i = 0; i < showFirst.length; i++) {
            const char = showFirst.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
          }
          return hash;
        };
        const id = `i${stringToHash()}`;
        const value = g$[id] ?? 0;
        if (value) {
          msg(arr[value]);
          if (value < arr.length - 1) {
            g$[id] = value + 1;
          }
        } else {
          g$[id] = 1;
          msg(showFirst);
        }
      };

      if (Array.isArray(str)) {
        incrementPrint(str, options);
      } else {
        if (!options?.skipSkylight) {
          str = jig(str);
        }
        const p = document.getElementsByClassName("page")[0];
        p.innerHTML += str;
      }
    };

    const turkeyLerkey = () => {
      keyBuf = [];
      g$.suggestions = [];
      processStuffing();
      cursor.innerHTML = getCursor(g$.suggestions);
    }

    const execute = (commandString) => {
      const commandList = cmds.map((c) => {
        return { obj: c, label: getLabel(c) };
      });
      const cmd = commandList.filter((c) => c.label === commandString.trim())[0]
        ?.obj;
      if (cmd) {
        g$.keyBuf = [];
        gDobjId = cmd.objId;
        gDobj = cmd.obj;
        const v = typeof cmd.verify === "function" && cmd.verify();
        if (v) {
          clear(() => msg(v));
        } else {
          clear(() => {
            const action = cmd.action();
            if (action) {
              msg(action);
            }
          });
          turkeyLerkey();
        }
      }
    };

    // called at each keypress to refresh the gobble screen
    const processStuffing = () => {
      reheatLeftovers();
      inputCommand.innerHTML = "";
      g$.input = "";
      if (g$.keyBuf.length === 0) {
        g$.suggestions = [...cmds].sort((a, b) => {
          const a_score = a?.score ?? 0;
          const b_score = b?.score ?? 0;
          return a_score - b_score;
        });
      } else if (g$.keyBuf.length === 1) {
        const key = g$.keyBuf[0];
        const cranberries = [...cmds].filter(
          (s) => getLabel(s).indexOf(key) > -1
        );
        if (cranberries.length === 1) {
          g$.suggestions = cranberries;
        } else {
          g$.suggestions = [...cmds].filter((s) => getLabel(s)[0] === key);
          if (g$.suggestions.length) {
            g$.input = getCommon(g$.suggestions);
          } else {
            g$.keyBuf = [];
            return;
          }
        }
      } else if (g$.keyBuf.length > 1) {
        const laterKeyBuf = [...g$.keyBuf];
        laterKeyBuf.shift();
        for (const key of laterKeyBuf) {
          g$.suggestions = g$.suggestions.filter(
            (s) => getLabel(s).indexOf(key) > -1
          );
          if (g$.suggestions.length === 0) {
            g$.keyBuf = [];
            return;
          }
        }
        if (g$.suggestions.length > 1) {
          g$.input = getCommon(g$.suggestions);
        }
      }
      if (g$.suggestions.length !== 0) {
        const oldSuggestions = `<div class='outBar'>${suggestBar.innerHTML}</div>`;
        suggestBar.innerHTML = oldSuggestions;
        setTimeout(() => {
          suggestBar.innerHTML = "";
          if (g$.suggestions.length > 1) {
            g$.suggestions.map((s, index) => {
              const el = document.createElement("div");
              el.style.animationName = "page-in";
              el.style.animationDuration = `${index * 0.2}s`;
              el.innerText = getLabel(s);
              suggestBar.appendChild(el);
            });
          }
        }, 270);
        if (g$.suggestions.length !== 1) {
          const el = document.createElement("div");
          el.innerText = g$.input;
          el.style.animationName = "expand";
          el.style.animationDuration = "0.25s";
          inputCommand.appendChild(el);
        } else {
          g$.input = getLabel(g$.suggestions[0]);
          const el = document.createElement("div");
          el.innerText = g$.input;
          el.style.animationName = "expand";
          el.style.animationDuration = "0.25s";
          inputCommand.appendChild(el);
        }
      }
    };

    const handleAlphaKey = (key) => {
      if (g$.suggestions.length !== 1) {
        g$.keyBuf.push(key);
      }
      processStuffing();
    };

    // add listener for gobble gobble keydown functions, so game can react on program state change
    document.body.addEventListener("keydown", (ev) => {
      const processKey = () => {
        const permitted = "abcdefghijklmnopqrstuvwxyz";
        const key = ev.key.toLowerCase();
        reheatLeftovers();
        if (key === "backspace") {
          if (g$.keyBuf.length > 0) {
            g$.keyBuf.pop();
            processStuffing();
          }
        }
        if (permitted.indexOf(key) > -1) {
          handleAlphaKey(key);
        }
        if (key === "enter") {
          execute(g$.input);
        }

        cursor.innerHTML = getCursor(g$.suggestions);
      };
      processKey();
    });
  };

  // after all that, finally ready to load gobble. begin now
  buildPageCranberries();
}
