const { getMockReq, getMockRes } = require('@jest-mock/express')
const AuthorizationMiddleware = require('./authorization')

const db = {
  findIsAccess: jest.fn(() => {
    return true
  })
}

const authorizationMiddleware = AuthorizationMiddleware(db)

describe('Authorization middleware', () => {
  describe('given a request with no access authorization', () => {
    it('should return 403', async () => {
      db.findIsAccess.mockResolvedValueOnce(false)
      const req = getMockReq()
      const { res, next } = getMockRes()
      await authorizationMiddleware(req, res, next)
      expect(next).not.toBeCalled()
      expect(res.status).toBeCalledWith(403)
    })
  })

  describe('given a request with access authorization', () => {
    it('should call next', async () => {
      db.findIsAccess.mockResolvedValueOnce(true)
      const req = getMockReq()
      const { res, next } = getMockRes()
      await authorizationMiddleware(req, res, next)
      expect(next).toBeCalled()
    })
  })
})