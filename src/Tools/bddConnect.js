const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@membercatchds.hgsxwqb.mongodb.net/?retryWrites=true&w=majority&appName=MemberCatchDS`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run(collectionName, requestType, filter, data) {
    let result;
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("MemberCatch").command({ ping: 1 });

        switch (requestType) {
            case "insertOne":
                await client.db("MemberCatch").collection(collectionName).insertOne(data);
                result = data;
                break;
            case "insertMany":
                await client.db("MemberCatch").collection(collectionName).insertMany(data);
                result = data;
                break;
            case "findOne":
                result = await client.db("MemberCatch").collection(collectionName).findOne(data);
                break;
            case "findMany":
                result = await client.db("MemberCatch").collection(collectionName).find(data);
                break;
            case "updateOne":
                await client.db("MemberCatch").collection(collectionName).updateOne(filter, data);
                break;
            default:
                break;
        }

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close(); 
    }
    return result;
}


module.exports = { run };
