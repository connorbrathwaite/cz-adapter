const R = require('ramda')
const wrap = require('word-wrap')

module.exports = answers => {
  // parentheses are only needed when a scope is present
  const scope = answers.scope
    ? `(${R.trim(answers.scope)})`
    : ''

  const head = R.concat(
    `${answers.type}${scope}: `,
    R.trim(answers.subject)
  )

  // optional fields
  const comment = answers.comment
    ? 'comment: ' + answers.comment
    : false

  const transition = answers.transition
    ? 'transition: ' + answers.transition
    : false

  // apply breaking change prefix, removing it if already present
  let breaking = answers.breaking
    ? R.trim(answers.breaking)
    : ''

  breaking = breaking
    ? 'BREAKING CHANGE: ' +
      breaking.replace(/^BREAKING CHANGE: /, '')
    : ''

  breaking = wrap(breaking, {
    trim: true,
    newline: '\n',
    indent: '',
    width: 100
  })

  const rawCommit = [
    comment,
    `spent: ${answers.time}`,
    `issues: ${answers.issues}`,
    transition
  ]

  // prettier-ignore
  const body = R.pipe(
    R.reject(R.F), 
    R.join('\n\n')
  )(rawCommit)

  return `${head}\n\n${body}\n\n${breaking}`
}
