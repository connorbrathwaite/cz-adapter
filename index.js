const R = require('ramda')
const cosmiconfig = require('cosmiconfig')
const inquirer = require('inquirer')

const {
  formatCommit,
  typeChoices,
  getIssueChoices
} = require('./utils')

const explorer = cosmiconfig('gitlabcz')

const prompter = (cz, commit) => {
  explorer
    .load()
    .then(
      R.pipe(
        R.prop('config'),
        R.pick(['gitLabApiUrl', 'gitLabAccessToken'])
      )
    )
    .then(getIssueChoices)
    .then(issueChoices => {
      console.log(issueChoices)
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
            type: 'checkbox',
            name: 'issues',
            message: `gitlab issue id(s)?\n`,
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
            choices: [
              '15m',
              '30m',
              '1h',
              '1h 30m',
              '2h',
              '2h 30m',
              '3h'
            ],
            validate: R.ifElse(
              R.isEmpty,
              R.always('missing time estimate'),
              R.T
            )
          }
        ])
        .then(formatCommit)
        .then(commit)
    })
    .catch(console.error)
}

module.exports = {
  prompter
}
