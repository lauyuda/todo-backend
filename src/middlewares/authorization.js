module.exports = (db) => {
  return async (req, res, next) => {
    const uid = req.uid
    const id = req.params.id
    // console.log('req params: ', req.params)
    // console.log('uid', uid)

    const isOwner = await db.findItemOwner(id, uid)

    if (isOwner) {
      next()
    } else {
      res.status(400).send(`User ${uid} does not have access`)
    }
  }
}