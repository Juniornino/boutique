const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/softkeypro').then(() => {
  return mongoose.connection.db.collection('products').find({}).toArray();
}).then(docs => {
  console.log(docs.map(d => ({ _id: d._id, count: d.availableKeysCount, name: d.name })));
}).catch(console.error).finally(() => mongoose.disconnect());
