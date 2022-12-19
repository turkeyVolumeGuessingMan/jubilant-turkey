const UglifyJS = require("uglify-js")
const liveServer = require("live-server")
const fs = require("fs")
const chokidar = require("chokidar")

const srcPath = "src"
const code = {}

const isDirectory = async (path) => {
  try {
    const stats = await fs.promises.lstat(path)
    return stats.isDirectory()
  } catch (error) {
    throw new Error("No such file or Directory")
  }
}

const createTree = async (path) => {
  const data = await fs.promises.readdir(path)
  for (const item of data) {
    const currentLocation = `${path}/${item}`
    const isDir = await isDirectory(currentLocation)
    if (!isDir) {
      code[currentLocation] = fs.readFileSync(currentLocation, "utf8")
      continue
    }
    await createTree(currentLocation)
  }
}


const getLocationNames = (allTheCode) => {
  const loc = [];
  allTheCode = allTheCode.split('\n')
  allTheCode.map((line, lineNumber) => {
    if (line.indexOf('/** @type {LocationType} */') > -1) {
      const nextLine = allTheCode[lineNumber + 1]
      if (nextLine) {
        if (nextLine.trim().indexOf('Game.') === 0) {
          const tokens = nextLine.trim().split('=')
          const id = tokens[0].slice(5).trim()
          loc.push(`'${id}'`)
        }
      }
    }
  })
  return `
/**
 * @typedef GameLocationID
 * @type {${loc.join('|')}}
 */
  `
}


const getValNames = (allTheCode) => {
  const g = /getVal\((["'])[^]*?\1/
  const s = /setVal\((["'])[^]*?\1/
  let matches = []
  allTheCode = allTheCode.split('\n')
  for (const line of allTheCode) {
    const l = line.match(s)
    const r = line.match(g)
    if (l) {
      matches.push(l[0])
    }
    if (r) {
      matches.push(r[0])
    }
  }
  matches = matches.map(x => x.slice(8, x.length - 1)).map(x => `"${x}"`)
  matches = [...new Set(matches)]
  return `

  /**
 * @typedef Values
 * @type {${matches.join('|')}}
 */    
  
`
}


const getCharacterNames = (allTheCode) => {
  const chars = [];
  allTheCode = allTheCode.split('\n')
  allTheCode.map((line, lineNumber) => {
    if (line.indexOf('/** @type {CharacterType} */') > -1) {
      const nextLine = allTheCode[lineNumber + 1]
      if (nextLine) {
        if (nextLine.trim().indexOf('Game.') === 0) {
          const tokens = nextLine.trim().split('=')
          const id = tokens[0].slice(5).trim()
          chars.push(`'${id}'`)
        }
      }
    }
  })
  return `
/**
 * @typedef Character
 * @type {${chars.join('|')}}
 */
  `
}


const buildCodeTree = async () => {
  try {
    await createTree(srcPath)
    //const wholeEnchilada = Object.keys(code).map(k => code[k]).join('\n')
    //const locations = getLocationNames(wholeEnchilada)
    //const characters = getCharacterNames(wholeEnchilada)
    //const values = getValNames(wholeEnchilada)
    const result = UglifyJS.minify(code, {
      toplevel: false,
      sourceMap: {
        root: './src',
        filename: './turkey.dance.min.js.map', 
        url: './turkey.dance.min.js.map',
      }
    })
    const minifiedBuffer = Buffer.from(result.code)
    const minifiedMap = Buffer.from(result.map)
    //const locationBuffer = Buffer.from(locations)
    //const characterBuffer = Buffer.from(characters)
    //const valBuffer = Buffer.from(values)
    fs.writeFile("./public/turkey.dance.min.js", minifiedBuffer, (err) => {
      if (err) {
        throw err
      } 
    })
    fs.writeFile("./public/turkey.dance.min.js.map", minifiedMap, (err) => {
      if (err) {
        throw err
      } 
    })
    /*
    fs.writeFile("./jsdoc/locations.js", locationBuffer, (err) => {
      if (err) {
        throw err
      } 
    })
    fs.writeFile("./jsdoc/characters.js", characterBuffer, (err) => {
      if (err) {
        throw err
      } 
    })
    fs.writeFile("./jsdoc/vals.js", valBuffer, (err) => {
      if (err) {
        throw err
      } 
    })
    */
  } catch (error) {
    console.log(error.message)
  }
}

chokidar.watch("./src").on("all", (event, path) => {
  buildCodeTree()
})
buildCodeTree()

const liveServerParams = {
  port: 8181, // Set the server port. Defaults to 8080.
  host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: "./public", // Set root directory that's being served. Defaults to cwd.
  open: false, // When false, it won't load your browser by default.
  ignore: "scss,my/templates", // comma-separated string for paths to ignore
  file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  mount: [["/components", "./node_modules"]], // Mount a directory to a route.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  middleware: [
    function (req, res, next) {
      next()
    },
  ], // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
}
liveServer.start(liveServerParams)
