const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uekolpg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        // Send a ping to confirm a successful connection
        const toysCollection = client.db("toysCollection").collection('toys');
        app.get("/allToys", async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result)
        });
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const catchData = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(catchData);
            res.send(result)
        });
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Marvel Toys Server is running")
});
app.listen(port, () => {
    console.log('server is running')
})