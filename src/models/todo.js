class Todo {
  constructor({ id, task, uid, access, softdelete }) {
    this.id = id
    this.task = task
    this.uid = uid
    this.access = access
    this.softdelete = softdelete
  }
}

module.exports = Todo
