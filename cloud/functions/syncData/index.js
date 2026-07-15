const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, collection, data, id } = event

  try {
    switch (action) {
      case 'get':
        return await getList(OPENID, collection)
      case 'add':
        return await addItem(OPENID, collection, data)
      case 'update':
        return await updateItem(OPENID, collection, id, data)
      case 'delete':
        return await deleteItem(OPENID, collection, id)
      default:
        return { code: -1, msg: 'Unknown action' }
    }
  } catch (err) {
    return { code: -1, msg: err.message }
  }
}

async function getList(openid, collection) {
  const res = await db
    .collection(collection)
    .where({ _openid: openid })
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()
  return { code: 0, data: res.data }
}

async function addItem(openid, collection, data) {
  const res = await db.collection(collection).add({
    data: { ...data, _openid: openid, createdAt: new Date() },
  })
  return { code: 0, id: res._id }
}

async function updateItem(openid, collection, id, data) {
  await db
    .collection(collection)
    .where({ _id: id, _openid: openid })
    .update({ data: { ...data, updatedAt: new Date() } })
  return { code: 0 }
}

async function deleteItem(openid, collection, id) {
  await db
    .collection(collection)
    .where({ _id: id, _openid: openid })
    .remove()
  return { code: 0 }
}
