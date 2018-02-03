const inquirer = require('inquirer')
const rightPad = require('right-pad')
const branch = require('git-branch')
const longest = require('longest')
const wrap = require('word-wrap')
const types = require('./commit-types')

const maxLineWidth = 100
const currentBranch = branch.sync()
const paddingLength = Object.keys(types.length).length + 1

const wrapOptions = {
  trim: true,
  newline: '\n',
  indent: '',
  width: maxLineWidth
}

const choices = types.map(type => ({
  name: rightPad(type.name + ': ', paddingLength) + type.description,
  value: type.name
}))

const filter = array => array.filter(item => !!item)

const prompter = (cz, commit) => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: `select the type of change that you're committing:`,
        choices: choices
      },
      {
        type: 'input',
        name: 'scope',
        message: `what is the scope of this change? (e.g. package.json) (press enter to skip)\n`
      },
      {
        type: 'input',
        name: 'issues',
        message: `gitlab issue id(s)? (should include at least branch: ${currentBranch})\n`,
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
        message: `write a short, imperative tense description of the change (e.g: bumped react dependency to 16.0.2rc) (required)\n`,
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
        default: false
      },
      {
        type: 'input',
        name: 'breaking',
        message: 'describe the breaking changes\n',
        when: answers => answers.isBreaking
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
}

const formatCommit = answers => {
  // parentheses are only needed when a scope is present
  scope = answers.scope.trim() ? '(' + answers.scope.trim() + ')' : ''

  // hard limit this line
  const head = (answers.type + scope + ': ' + answers.subject.trim()).slice(
    0,
    maxLineWidth
  )

  const comment = answers.comment ? 'comment: ' + answers.comment : undefined

  const transition = answers.transition
    ? 'transition: ' + answers.transition
    : undefined

  const body = filter([
    comment,
    `spent: ${answers.time}`,
    `issues: ${answers.issues}`,
    transition
  ]).join('\n\n')

  // apply breaking change prefix, removing it if already present
  let breaking = answers.breaking ? answers.breaking.trim() : ''
  breaking = breaking
    ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
    : ''

  breaking = wrap(breaking, wrapOptions)

  return `${head}\n\n${body}\n\n${breaking}`
}

module.exports = {
  prompter,
  formatCommit
}
