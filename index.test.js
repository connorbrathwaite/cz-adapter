const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const czJiraSmartCommit = require('./index.js')

describe('prompt for inputs', () => {
  it('should be a function', () => {
    expect(czJiraSmartCommit.prompter).to.be.a('function')
  })
})

describe('format commits', () => {
  const type = 'feat'
  const scope = 'chore'
  const isBreaking = false
  const transition = 'closed'
  const issues = 'CZ-234 CZ-235'
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
    expect(czJiraSmartCommit.formatCommit).to.be.a('function')
  })

  it('should perform a full commit', () => {
    const result = czJiraSmartCommit.formatCommit(mockCommit)
    expect(result).to.equal(
      'feat(chore): bumped react dependency to 16.0.2rc CZ-234 CZ-235 #transition closed #time 3y 2w 7d 8h 30m'
    )
  })

  it('should commit without a workflow', () => {
    const result = czJiraSmartCommit.formatCommit(mockCommit)
    expect(result).to.equal(
      'feat(chore): bumped react dependency to 16.0.2rc CZ-234 CZ-235 #transition closed #time 3y 2w 7d 8h 30m'
    )
  })

  it('should commit without a time', () => {
    const result = czJiraSmartCommit.formatCommit(mockCommit)
    expect(result).to.equal(
      'feat(chore): bumped react dependency to 16.0.2rc CZ-234 CZ-235 #transition closed #time 3y 2w 7d 8h 30m'
    )
  })

  it('should commit without a comment', () => {
    const result = czJiraSmartCommit.formatCommit(mockCommit)
    expect(result).to.equal(
      'feat(chore): bumped react dependency to 16.0.2rc CZ-234 CZ-235 #transition closed #time 3y 2w 7d 8h 30m'
    )
  })
})
