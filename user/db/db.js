const mongoose = require('mongoose');


function connect() {
    mongoose.connect(process.env.MONGO_URL || process.env.DB_CONNECT).then(() => {
        console.log('User service connected to MongoDB');
    }).catch(err => {
        console.log(err);
    });
}


module.exports = connect;