const R = require('ramda')
const inquirer = require('inquirer')
const rightPad = require('right-pad')
const branch = require('git-branch')
const wrap = require('word-wrap')
const fetch = require('node-fetch')
const types = require('./types')

const gitLabUrl = 'http://g2-uat.biospective.com/api/v4'
const gitLabAccessToken = 'Xt3GUsnuVybXsQ6bUxQk'
const assingedIssuesRequest = `${gitLabUrl}/issues?scope=assigned-to-me&private_token=${gitLabAccessToken}`

const maxLineWidth = 100
const currentBranch = branch.sync()
const paddingLength = Object.keys(types.length).length + 1

const wrapOptions = {
  trim: true,
  newline: '\n',
  indent: '',
  width: maxLineWidth
}

const transformTypesToList = R.map(type => ({
  name: rightPad(type.name + ': ', paddingLength) + type.description,
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

const getIssueChoices = fetch(assingedIssuesRequest)
  .then(res => res.json())
  .then(transformIssuesPayloadToList)

const typeChoices = transformTypesToList(types)

const prompter = (cz, commit) => {
  getIssueChoices.then(issueChoices =>
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
          message: `what is the scope of this change? (e.g. package.json) (press enter to skip)\n`
        },
        {
          type: 'checkbox',
          name: 'issues',
          message: `gitlab issue id(s)? (branch: ${currentBranch})\n`,
          choices: issueChoices,
          validate: input => {
            if (!input) return `no issues specified`
            return true
          }
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
          validate: input => {
            if (!input) return `empty commit message`
            return true
          }
        },
        {
          type: 'input',
          name: 'comment',
          message: `provide a longer description of the change (optional)\n`
        },
        {
          type: 'confirm',
          name: 'isBreaking',
          message: 'are there any breaking changes?\n',
          default: R.F()
        },
        {
          type: 'input',
          name: 'breaking',
          message: 'describe the breaking changes\n',
          when: R.propEq('isBreaking', R.T)
        },
        {
          type: 'input',
          name: 'time',
          message: 'time spent? (i.e. 3h 15m)\n',
          validate: input => {
            if (!input) return `please provide a time estimate`
            return true
          }
        }
      ])
      .then(formatCommit)
      .then(commit)
  )
}

const formatCommit = answers => {
  // parentheses are only needed when a scope is present
  scope = answers.scope.trim() ? '(' + answers.scope.trim() + ')' : ''

  // hard limit this line
  const head = (answers.type + scope + ': ' + answers.subject.trim()).slice(
    0,
    maxLineWidth
  )

  // optional fields
  const comment = answers.comment ? 'comment: ' + answers.comment : false

  const transition = answers.transition
    ? 'transition: ' + answers.transition
    : false

  // apply breaking change prefix, removing it if already present
  let breaking = answers.breaking ? answers.breaking.trim() : ''
  breaking = breaking
    ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
    : ''

  breaking = wrap(breaking, wrapOptions)

  const rawCommit = [
    comment,
    `spent: ${answers.time}`,
    `issues: ${answers.issues}`,
    transition
  ]

  const body = R.pipe(R.reject(R.F), R.join('\n\n'))(rawCommit)

  return `${head}\n\n${body}\n\n${breaking}`
}

module.exports = {
  prompter,
  formatCommit
}
