import _ from 'lodash'
import {Command} from 'commander'
import {version} from '../../package.json'
import path from 'path'

export default class ArgvParser {
  static collect(val, memo) {
    memo.push(val)
    return memo
  }

  static mergeJson(option) {
    return function(str, memo) {
      let val
      try {
        val = JSON.parse(str)
      } catch (error) {
        throw new Error(option + ' passed invalid JSON: ' + error.message + ': ' + str)
      }
      if (!_.isPlainObject(val)) {
        throw new Error(option + ' must be passed a JSON string of an object: ' + str)
      }
      return _.merge(memo, val)
    }
  }

  static parse (argv) {
    const program = new Command(path.basename(argv[1]))

    program
      .usage('[options] [<DIR|FILE[:LINE]>...]')
      .version(version, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
      .option('--compiler <EXTENSION:MODULE>', 'require files with the given EXTENSION after requiring MODULE (repeatable)', ArgvParser.collect, [])
      .option('-d, --dry-run', 'invoke formatters without executing steps')
      .option('--fail-fast', 'abort the run on first failure')
      .option('-f, --format <TYPE[:PATH]>', 'specify the output format, optionally supply PATH to redirect formatter output (repeatable)', ArgvParser.collect, ['pretty'])
      .option('--format-options <JSON>', 'provide options for formatters (repeatable)', ArgvParser.mergeJson('--format-options'), {})
      .option('--name <REGEXP>', 'only execute the scenarios with name matching the expression (repeatable)', ArgvParser.collect, [])
      .option('-p, --profile <NAME>', 'specify the profile to use (repeatable)', ArgvParser.collect, [])
      .option('-r, --require <FILE|DIR>', 'require files before executing features (repeatable)', ArgvParser.collect, [])
      .option('-S, --strict', 'fail if there are any undefined or pending steps')
      .option('-t, --tags <EXPRESSION>', 'only execute the features or scenarios with tags matching the expression', '')
      .option('--world-parameters <JSON>', 'provide parameters that will be passed to the world constructor (repeatable)', ArgvParser.mergeJson('--world-parameters'), {})

    program.on('--help', () => {
      /* eslint-disable no-console */
      console.log('  For more details please visit https://github.com/cucumber/cucumber-js#cli\n')
      /* eslint-enable no-console */
    })

    program.parse(argv)

    return {
      options: program.opts(),
      args: program.args
    }
  }
}
