module.exports = (db) => {
  return async (req, res, next) => {
    const uid = req.uid
    const tid = req.params.tid

    const isAccess = await db.findIsAccess(tid, uid)

    if (isAccess) {
      next()
    } else {
      res.status(403).send(`User ${uid} does not have access`)
    }
  }
}