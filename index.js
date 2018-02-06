const R = require('ramda')
const inquirer = require('inquirer')
const {
  format,
  typeChoices,
  getIssueChoices
} = require('./utils')

const prompter = (cz, commit) =>
  getIssueChoices()
    .then(issueChoices =>
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'type',
            message: `select the type of change that you're committing\n`,
            choices: typeChoices
          },
          {
            type: 'input',
            name: 'scope',
            message: `what is the scope of this change? (e.g. package.json)\n`,
            validate: R.ifElse(
              R.isEmpty,
              R.always('no scope specified'),
              R.T
            )
          },
          {
            type: 'list',
            name: 'issues',
            message: `gitlab issue id?\n`,
            choices: issueChoices,
            validate: R.ifElse(
              R.isEmpty,
              R.always('no issue specified'),
              R.T
            )
          },
          {
            type: 'input',
            name: 'transition',
            message: `transition command (e.g: resolve, in-progress, testing, review, closed, etc.) (optional)\n`
          },
          {
            type: 'input',
            name: 'subject',
            message: `write a short, imperative tense description of the change (i.e: bumped react dependency to 16.0.2rc) (required)\n`,
            validate: R.ifElse(
              R.isEmpty,
              R.always('empty commit msg'),
              R.T
            )
          },
          {
            type: 'input',
            name: 'comment',
            message: `provide a longer description of the change (optional)\n`
          },
          {
            type: 'confirm',
            name: 'isBreaking',
            message: 'any breaking changes?\n',
            default: R.F()
          },
          {
            type: 'input',
            name: 'breaking',
            message: 'describe the breaking changes\n',
            when: R.propEq('isBreaking', R.T())
          },
          {
            type: 'list',
            name: 'time',
            message: 'time spent?\n',
            pageSize: 4,
            choices: [
              '15m',
              '30m',
              '1h',
              '1h 30m',
              '2h',
              '2h 30m',
              '3h',
              '3h 30m'
            ],
            validate: R.ifElse(
              R.isEmpty,
              R.always('missing time estimate'),
              R.T
            )
          }
        ])
        .then(format)
        .then(commit)
    )
    .catch(console.error)

module.exports = {
  prompter
}
