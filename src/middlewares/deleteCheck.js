module.exports = (db) => {
  return async (req, res, next) => {
    const tid = req.params.tid

    const isDeleted = await db.findIsDeleted(tid)

    if (!isDeleted) {
      next()
    } else {
      res.status(401).send(`Todo ${tid} was deleted`)
    }
  }
}