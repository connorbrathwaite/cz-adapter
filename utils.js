const R = require('ramda')
const wrap = require('word-wrap')
const rightPad = require('right-pad')
const fetch = require('node-fetch')
const {
  gitLabAccessToken,
  gitLabApiUrl,
  projectId
} = require('rc')('gitlabcz')

const types = require('./types')

/* https://docs.gitlab.com/ee/api/README.html#personal-access-tokens */
const headers = {
  'Private-Token': gitLabAccessToken
}

/* 
  getIssueChoices :: () -> Promise -> [Object]
  https://docs.gitlab.com/ee/api/issues.html#list-issues
*/
const getIssueChoices = () =>
  fetch(
    `${gitLabApiUrl}/issues?scope=assigned-to-me&private_token=${gitLabAccessToken}`,
    {
      method: 'GET',
      headers
    }
  )
    .then(res => res.json())
    .then(transformIssuesPayloadToList)

/* 
  postSpentTime :: {String, String} -> Promise -> [Object]
  https://docs.gitlab.com/ee/api/issues.html#add-spent-time-for-an-issue
*/
const postSpentTime = ({issueId, duration}) =>
  fetch(
    `${gitLabApiUrl}/projects/${projectId}/issues/${issueId}/add_spent_time?${duration}`,
    {
      method: 'POST',
      headers
    }
  )
    .then(res => res.json())
    .then(R.prop('total_time_spent'))

/* 
  paddingLength :: [Object] -> Number 
*/
const paddingLength = Object.keys(types.length).length + 1

/* 
  format :: Object -> String 
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
  format :: Object -> String 
*/
const format = answers => {
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

  const commit = `${head}\n\n${body}\n\n${breaking}`

  console.log(answers.time)

  return (
    postSpentTime({
      issueId: answers.issue,
      duration: answers.time
    })
      .then(console.log)
      // .then(R.concat('total time contribution so far: '))
      // .then(console.log)
      .then(R.always(commit))
  )
}

module.exports = {
  format,
  typeChoices,
  getIssueChoices
}
