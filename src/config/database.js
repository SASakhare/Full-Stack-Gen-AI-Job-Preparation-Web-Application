const mongoose = require('mongoose')


async function connectToDB(params) {

    try {

        await mongoose.connect(process.env.MONGO_URI)

        console.log('Connected to Database');
    } catch (err) {
        console.log("Error in connecting the database");
        console.log(err);


    }

}


module.exports = connectToDB