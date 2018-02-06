const adapter = require('./index.js')
const {format} = require('./utils')

it('should be a function', () => {
  expect(adapter.prompter).toBeInstanceOf(Function)
})

describe('format', () => {
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
    expect(format).toBeInstanceOf(Function)
  })

  it('should format a full commit', () => {
    const result = format(mockCommit)
    expect(result).toMatchSnapshot()
  })
})
