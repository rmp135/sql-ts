import { buildDatabase } from './DatabaseFactory'
import * as fs from 'fs'
import * as yargs from 'yargs'
import * as path from 'path'
import sqlts, { Config } from './index'

function insertContentIntoFile(filePath:string, markerOpen:string, markerClose:string, contentToInsert:string):void {
  const fs = require('fs');
  if (!fs.existsSync(filePath)) throw new Error('File not found: ' + filePath);
	let content:string = fs.readFileSync(filePath, 'utf-8');
	// [^]* matches any character including new lines
  const regex:RegExp = new RegExp(markerOpen + '[^]*?' + markerClose);
  if (!content.match(regex)) throw new Error('Could not find markers: ' + markerOpen);
	content = content.replace(regex, markerOpen + "\n" + contentToInsert + "\n" + markerClose);
	fs.writeFileSync(filePath, content);
};

const args = yargs(process.argv)
.alias('c', 'config')
.describe('c', 'Config file.')
.demandOption(['c'])
.argv

const configPath = path.join(process.cwd(), args.config) 

const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Config

;(async () => {
  const output = await sqlts.toTypeScript(config)
  const fileName = `${config.filename || 'Database'}.ts`
  const outFile = path.join(process.cwd(), fileName)

  if (config.fileReplaceWithinMarker) {
    insertContentIntoFile(outFile, config.fileReplaceWithinMarker, config.fileReplaceWithinMarker, output);
    console.log(`Definitions inserted into ${outFile}`)
  } else {
    fs.writeFileSync(outFile, output)
    console.log(`Definition file written as ${outFile}`)
  }  

})()
