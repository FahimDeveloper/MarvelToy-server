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
        // await client.connect();
        // Send a ping to confirm a successful connection
        const toysCollection = client.db("toysCollection").collection('toys');
        app.get("/allToys", async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result)
        });
        app.get("/everyToys", async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 20;
            const skip = page * limit;
            const result = await toysCollection.find().skip(skip).limit(limit).toArray();
            res.send(result)
        });
        app.get('/holeToys', async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 20;
            const skip = page * limit;
            const result = await toysCollection.find().skip(skip).limit(limit).toArray();
            res.send(result)
        })
        app.get('/sellerToys/lowToHigh/:email', async (req, res) => {
            const email = req.params.email;
            const result = await toysCollection.find({ "seller.email": email }).sort({ price: 1 }).toArray();
            res.send(result);
        });
        app.get('/sellerToys/highToLow/:email', async (req, res) => {
            const email = req.params.email;
            const result = await toysCollection.find({ "seller.email": email }).sort({ price: -1 }).toArray();
            res.send(result);
        });
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const catchData = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(catchData);
            res.send(result)
        });
        app.get('/toys/:id/:email', async (req, res) => {
            const id = req.params.id;
            email = req.params.email;
            const catchData = { _id: new ObjectId(id), "seller.email": email };
            const result = await toysCollection.findOne(catchData);
            res.send(result)
        });
        app.get('/sellerToys/:email', async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 20;
            const skip = page * limit;
            const catchData = { "seller.email": req.params.email };
            const result = await toysCollection.find(catchData).skip(skip).limit(limit).toArray();
            res.send(result)
        });
        app.get('/tabData/:text', async (req, res) => {
            const tabText = req.params.text;
            if (tabText === "ironMan" || tabText === "spiderMan" || tabText === "blackPanther") {
                const result = await toysCollection.find({
                    $or: [
                        { category: { $regex: tabText } }
                    ],
                }).toArray();
                res.send(result);
            }
        });
        app.get('/searchToys/:text/', async (req, res) => {
            const searchText = req.params.text;
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 20;
            const skip = page * limit;
            const result = await toysCollection.find({
                $or: [
                    { toyname: { $regex: searchText, $options: "i" } }
                ],
            }).skip(skip).limit(limit).toArray();
            res.send(result)
        });
        app.get('/searchToys/:text/:email', async (req, res) => {
            const searchText = req.params.text;
            const email = req.params.email;
            const result = await toysCollection.find({
                "seller.email": email,
                $or: [
                    { toyname: { $regex: searchText, $options: "i" } }
                ]
            }).toArray();
            res.send(result)
        });
        app.get('/totalToy', async (req, res) => {
            const result = await toysCollection.countDocuments();
            res.send({ total: result })
        })
        app.get('/totalToy/:email', async (req, res) => {
            const email = req.params.email
            const result = await toysCollection.countDocuments({ 'seller.email': email });
            res.send({ total: result })
        })
        app.post('/toys', async (req, res) => {
            const toyInformation = req.body;
            const result = await toysCollection.insertOne(toyInformation);
            res.send(result)
        });
        app.put('/sellerToy/:id', async (req, res) => {
            const filter = { _id: new ObjectId(req.params.id) }
            const updateData = req.body;
            const updateDoc = {
                $set: {
                    ...updateData
                }
            }
            const options = { upsert: true };
            const result = await toysCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        app.delete("/toys/:id", async (req, res) => {
            const id = req.params.id;
            const catchData = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(catchData);
            res.send(result);
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