const R = require('ramda')
const cosmiconfig = require('cosmiconfig')
const inquirer = require('inquirer')
const rightPad = require('right-pad')
const branch = require('git-branch')
const fetch = require('node-fetch')
const types = require('./types')
const formatCommit = require('./format-commit')

const explorer = cosmiconfig('gitlabcz')
const maxLineWidth = 100
const currentBranch = branch.sync()
const paddingLength = Object.keys(types.length).length + 1

const transformTypesToList = R.map(type => ({
  name:
    rightPad(type.name + ': ', paddingLength) +
    type.description,
  value: type.name
}))

const transformIssueToPromptListItem = issue => ({
  name: `${issue.title} (${issue.web_url})`,
  value: `#${issue.iid}`
})

const transformIssuesPayloadToList = R.pipe(
  R.reject(R.propEq('state', 'closed')),
  R.map(transformIssueToPromptListItem)
)

const getIssueChoices = (apiUrl, accessToken) =>
  fetch(
    `${apiUrl}/issues?scope=assigned-to-me&private_token=${accessToken}`
  )
    .then(res => res.json())
    .then(transformIssuesPayloadToList)

const typeChoices = transformTypesToList(types)

const prompter = (cz, commit) => {
  explorer
    .load()
    .then(result => {
      const {
        gitLabApiUrl,
        gitLabAccessToken
      } = result.config

      getIssueChoices(gitLabApiUrl, gitLabAccessToken).then(
        issueChoices =>
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
                message: `gitlab issue id(s)? (branch: ${currentBranch})\n`,
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
                type: 'input',
                name: 'time',
                message: 'time spent? (i.e. 3h 15m)\n',
                validate: R.ifElse(
                  R.isEmpty,
                  R.always('missing time estimate'),
                  R.T
                )
              }
            ])
            .then(formatCommit)
            .then(commit)
      )
    })
    .catch(console.error)
}

module.exports = {
  prompter
}
