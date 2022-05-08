const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;
const app = express();



//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_INVENTORY}:${process.env.DB_PASS}@cluster0.rd1bs.mongodb.net/myFirstDatabase?retryWrites=true&`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const itemsColletion = client.db('inventory-management').collection('items');

        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsColletion.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsColletion.findOne(query);
            res.send(item);
        });

        //update user
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    quantity: quantity.quantity
                },
            };
            const result = await itemsColletion.updateOne(filter, updatedData, options);
            res.send(result);
        });

        //POST
        app.post('/items', async (req, res) => {
            const newService = req.body;
            const result = await itemsColletion.insertOne(newService);
            res.send(result)
        });

        //My Items Api 
        app.get('/myItems', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = itemsColletion.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });
        //DELETE API


    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running Genius Server');
});

app.listen(port, () => {
    console.log('listening to port hello world', port);
})