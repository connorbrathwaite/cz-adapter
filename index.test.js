const adapter = require('./index.js')
const formatCommit = require('./format-commit')

it('should be a function', () => {
  expect(adapter.prompter).toBeInstanceOf(Function)
})

describe('formatCommit', () => {
  const type = 'feat'
  const scope = 'chore'
  const isBreaking = false
  const transition = 'done'
  const issues = '#1, #2'
  const time = '3y 2w 7d 8h 30m'
  const message = 'sample commit message'
  const subject = 'bumped react dependency to 16.0.2rc'

  const mockCommit = {
    type,
    scope,
    isBreaking,
    transition,
    issues,
    time,
    message,
    subject
  }

  it('should be a function', () => {
    expect(formatCommit).toBeInstanceOf(Function)
  })

  it('should format a full commit', () => {
    const result = formatCommit(mockCommit)
    expect(result).toMatchSnapshot()
  })
})
