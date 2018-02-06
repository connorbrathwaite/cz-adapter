const R = require('ramda')
const wrap = require('word-wrap')
const rightPad = require('right-pad')
const fetch = require('node-fetch')
const types = require('./types')
/* 
  paddingLength :: [Object] -> Number 
*/
const paddingLength = Object.keys(types.length).length + 1

/* 
  formatCommit :: Object -> String 
*/
const transformTypesToList = R.map(type => ({
  name: R.concat(
    rightPad(`${type.name}: `, paddingLength),
    type.description
  ),
  value: type.name
}))

const typeChoices = transformTypesToList(types)

/* 
  transformIssueToPromptListItem :: Object -> Object 
*/
const transformIssueToPromptListItem = issue => ({
  name: `${issue.title} (${issue.web_url})`,
  value: `#${issue.iid}`,
  project: issue.project_id
})

/* 
  transformIssuesPayloadToList :: [Object] -> [Object]
*/
const transformIssuesPayloadToList = R.pipe(
  R.reject(R.propEq('state', 'closed')),
  R.map(transformIssueToPromptListItem)
)

/* 
  getIssueChoices :: {(String, String)} -> Promise -> [Object]
*/
const getIssueChoices = ({
  gitLabApiUrl,
  gitLabAccessToken
}) =>
  fetch(
    `${gitLabApiUrl}/issues?scope=assigned-to-me&private_token=${gitLabAccessToken}`
  )
    .then(res => res.json())
    .then(transformIssuesPayloadToList)

/* 
  formatCommit :: Object -> String 
*/
const formatCommit = answers => {
  const scope = answers.scope
    ? `(${R.trim(answers.scope)})`
    : ''

  const head = R.concat(
    `${answers.type}${scope}: `,
    R.trim(answers.subject)
  )

  const comment = answers.comment
    ? 'comment: ' + answers.comment
    : undefined

  const transition = answers.transition
    ? 'transition: ' + answers.transition
    : undefined

  /* apply breaking change prefix, removing it if already present */
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

  /* prettier-ignore */
  const body = R.pipe(
    R.reject(R.isNil), 
    R.join('\n\n')
  )(rawCommit)

  return `${head}\n\n${body}\n\n${breaking}`
}

module.exports = {
  formatCommit,
  typeChoices,
  getIssueChoices
}
