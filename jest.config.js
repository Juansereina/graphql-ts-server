 module.exports = {
     "globalSetup": "./src/test/call.setup.js",
     "transform": {
         "^.+\\.tsx?$": "ts-jest"
     },
     "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
     "moduleFileExtensions": [
         "ts",
         "tsx",
         "js",
         "jsx",
         "json",
         "node"
     ],
     "setupTestFrameworkScriptFile": './jest.setup.js'
 }