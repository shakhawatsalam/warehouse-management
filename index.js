const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;
const app = express();



//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_INVENTORY}:${process.env.DB_PASS}@cluster0.rd1bs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority+`;
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