
const mongoose = require('mongoose');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@membercatchds.hgsxwqb.mongodb.net/MemberCatch?retryWrites=true&w=majority&appName=MemberCatchDS`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Connect the client to the server	(optional starting in v4.7)
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur de connexion à la base de données :'));

db.once('open', () => {
    console.log('Connexion réussie à la base de données !');
});


module.exports = mongoose;

    // const { MongoClient, ServerApiVersion } = require('mongodb');
    // let result;
    //     switch (requestType) {
    //         case "insertOne":
    //             await client.db("MemberCatch").collection(collectionName).insertOne(data);
    //             result = data;
    //             break;
    //         case "insertMany":
    //             await client.db("MemberCatch").collection(collectionName).insertMany(data);
    //             result = data;
    //             break;
    //         case "findOne":
    //             result = await client.db("MemberCatch").collection(collectionName).findOne(data);
    //             break;
    //         case "findMany":
    //             result = await client.db("MemberCatch").collection(collectionName).find(data);
    //             break;
    //         case "updateOne":
    //             await client.db("MemberCatch").collection(collectionName).updateOne(filter, data);
    //             break;
    //         case "aggregate":
    //             result = await client.db("MemberCatch").collection(collectionName).aggregate(data).toArray();
    //             break;
    //         default:
    //             break;
    //     }
    //
    // } finally {
    //     // Ensures that the client will close when you finish/error
    //     await client.close();
    // }




