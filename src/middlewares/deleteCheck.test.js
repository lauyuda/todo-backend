const { getMockReq, getMockRes } = require('@jest-mock/express')
const DeleteCheckMiddleware = require('./deleteCheck')

const db = {
  findIsDeleted: jest.fn()
}

const deleteCheckMiddleware = DeleteCheckMiddleware(db)

describe('Checking if todo is deleted middleware', () => {
  describe('given a todo is deleted', () => {
    it('should return 401', async () => {
      db.findIsDeleted.mockResolvedValueOnce(true)
      const req = getMockReq()
      const { res, next } = getMockRes()
      await deleteCheckMiddleware(req, res, next)
      expect(next).not.toBeCalled()
      expect(res.status).toBeCalledWith(401)
    })
  })

  describe('given a valid todo', () => {
    it('should call next', async () => {
      db.findIsDeleted.mockResolvedValueOnce(false)
      const req = getMockReq()
      const { res, next } = getMockRes()
      await deleteCheckMiddleware(req, res, next)
      expect(next).toBeCalled()
    })
  })
})