
/**
 * GENERATED FILE FROM THE TYPESCRIPT-WORKSHEET EXTENSION
*/
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import packageJson from "../package.json";
import { combineDocumentation } from "./utils";
import * as __fs from 'node:fs';
import os from 'node:os';
const dataFile: any[] = [];

async function __tsrun() {
try {

const source =  tsWorksheetWatch({stringed: 'empty', type: 'variable', variable: 'source',  called: () => ("Collections"), line: 9});
const destination =  tsWorksheetWatch({stringed: 'empty', type: 'variable', variable: 'destination',  called: () => ("documentation/api.md"), line: 10});

// Log header information
// console.clear();
mylog(console.log, {type: 'log', called: [`${packageJson.name}@${packageJson.version}\n`], line: 14});

const argv =  tsWorksheetWatch({stringed: 'empty', type: 'variable', variable: 'argv',  called: () => (yargs(hideBin(process.argv))
	.scriptName(packageJson.name)
	.command({
		command: "build",
		describe: "Builds the API documentation.",
		handler: () => {
			mylog(console.log, {type: 'log', called: ["Building documentation..."], line: 22});
			 tsWorksheetWatch({stringed: 'empty', type: 'expression', variable: undefined,  called: () => (combineDocumentation(source, destination)), line: 23});
			mylog(console.log, {type: 'log', called: [
            				`File processing complete Documentation written to '${destination}'`,
            			], line: 24});
		},
	})
	.command({
		command: "test",
		describe: "Tests document build process",
		handler: () => {
			mylog(console.log, {type: 'log', called: ["Testing documentation build process..."], line: 33});
			 tsWorksheetWatch({stringed: 'empty', type: 'expression', variable: undefined,  called: () => (combineDocumentation(source, destination, { test: true })), line: 34});
			mylog(console.log, {type: 'log', called: [
            				`File processing complete\nDocumentation written to '${destination}'`,
            			], line: 35});
		},
	}).argv), line: 16});

mylog(console.log, {type: 'log', called: [`Arguments: ${JSON.stringify(argv, null, 2)}`], line: 41});

// Combine the documentation from the source folder into the destination file
// combineDocumentation(source, destination);

// Log completion message

} catch(error) {

  
}
}

__tsrun().then()

let ___done_ts_worksheet = "";
___done_ts_worksheet = "asdf";


function stringify(obj: any) {
  let cache: any = [];
  let str = JSON.stringify(obj, function(key, value) {
    if(typeof value === 'function') {
      const fn = __tsGetFn(value.toString()) ?? __tsGetArrowFn(value.toString());
      return fn;
    }
    if(value === undefined) {
      return '__TS_WORKSHEET_UNDEFINED__'
    }
    if (typeof value === "object" && value !== null) {
      if(value?.then) {
        return 'Promise';
      }
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
      return value === undefined ? '__TS_WORKSHEET_UNDEFINED__' : value;
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}



function __tsGetFn(str: string) {
  const noSpaces = str.replaceAll(' ', '');
  const __tsFnWithArgs = /(function.*\(.*\))/
  const result = __tsFnWithArgs.exec(noSpaces);
  if(result?.length) {
    
    const fn = result.at(-1);
    const afterKey = fn.substring('function'.length);
    return 'function ' + afterKey;
  }
  return undefined;
}

function __tsGetArrowFn(str: string) {
  const noSpaces = str.replaceAll(' ', '');
  const __tsArrowWithArgs= /(\({0,1}[A-Za-z]{1}[A-Za-z0-9_,]*\){0,1})=>/;
const __tsArrorWithoutArgs = /\(\){1}=>/;
  const arrowWithArgsResult = __tsArrowWithArgs.exec(noSpaces);
  if(arrowWithArgsResult?.length) {
    const args =  arrowWithArgsResult.at(-1);
    return 'arrow fn(' + args + ')';
  }
  const arrowWithoutArgsResult = __tsArrorWithoutArgs.exec(noSpaces);
  if(arrowWithoutArgsResult?.length) {
    return 'arrow fn()';
  }
  return undefined;
}

function tryToStringify(value: any) {
    let res = '';
    try {
        switch(typeof value) {
            case 'object':
                res = stringify(value);
                break;
            case 'function':
                res = __tsGetFn(value.toString()) ?? __tsGetArrowFn(value.toString());
                break;
            case 'bigint':
                res = value?.toString();
                break;    
            default: 
                // isNaN
                if(value !== value) {
                  res = value?.toString();
                } else {
                  res = value === undefined ? '__TS_WORKSHEET_UNDEFINED__' : value;
                }
        }
    } catch(err: any) {
        return err?.message.startsWith('Convert') ? 'Non displayable' : err?.message;
    }
    return res?.length > 2000 ? res?.substring(0, 2000) : res;
}

function __onError(error: any, dataValue: any) {
  const fixedError = error?.stack ?? error;
  const stringError = JSON.stringify(fixedError, Object.getOwnPropertyNames(fixedError));

  dataValue.type = 'error';
  dataValue.called = [error.message , stringError];
}
function save(hide: boolean, dataValue?: any) {
  if(hide) {
    return;
  }
  const isIpcCompatible = !false && typeof Bun === 'undefined' && !globalThis?.Deno && !os.platform().startsWith('win');
  if(dataValue) {
    dataFile.push(dataValue);
  }

  if(isIpcCompatible) {
    process.send(dataValue);
  }

  if(!dataValue && !isIpcCompatible) {
    __fs.writeFileSync('d:\\Development\\build-api-docs-from-bruno\\src\\.ws.data.json', JSON.stringify(dataFile));  
  }
}

function tsWorksheetWatch(data: {stringed: string, hide?: boolean, type: string, variable?: string, called: () => any, line: number }) {
  const dataValue = {...data, called: 'Failed Promise. Please use a .catch to display it'};
  let called: any;
  try {
      called = data.called();
  } catch(error) {
      __onError(error, dataValue);
      save(data.hide, dataValue);
      throw error;
  }

  if(data.type === 'throw') {
      __onError(called, dataValue);
      save(data.hide, dataValue);
      throw called;
  }

  if(called?.then) {
     data.called = called.then((r: any) => {
      dataValue.prefix = 'Resolved Promise: ';
        dataValue.called = tryToStringify(r);
         save(data.hide, dataValue);
         return r;
     }).catch((err: any) => {
      dataValue.prefix = 'Rejected Promise: ';
      dataValue.called = tryToStringify(err);
      dataValue.type = 'error';
      save(data.hide, dataValue);
      throw err;
     });
  } else {
      dataValue.called = tryToStringify(called);
      save(data.hide, dataValue);
  }

  return called;
}

function mylog(logFn: any, data: {type: string, called: any[], line: number }) {
    logFn(...data.called);
    data.called = data.called.map(entry => tryToStringify(entry)); 
    save(false, data);
}

if (globalThis?.Deno) {

  addEventListener("error", (event) => {
    event.preventDefault();
  });
  
  addEventListener("unhandledrejection", (e) => {
    e.preventDefault();
  });
  
  addEventListener("unload", () => {
    save(false);
  });
  }
  process?.on('uncaughtException', (error: Error) => {   
  });
  
  process?.on('unhandledRejection', () => {})
  
  process?.on('beforeExit', e => {
    if(typeof Bun !== 'undefined' && dataFile.some(e => e.type === 'error')) {
      process.exit(0);
    }
  })
  
  process?.on('exit', function() {
    save(false);
  });
      
    