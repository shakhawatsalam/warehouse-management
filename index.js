const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;
const app = express();



//middleware
app.use(cors());
app.use(express.json());


//verifyJWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(403).send({ massage: 'Forbidden access!!!', error : true });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })

   

}



const uri = `mongodb+srv://${process.env.DB_INVENTORY}:${process.env.DB_PASS}@cluster0.rd1bs.mongodb.net/myFirstDatabase?retryWrites=true&`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const itemsColletion = client.db('inventory-management').collection('items');

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // Items api
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
        app.get('/myItems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = itemsColletion.find(query);
                const items = await cursor.toArray();
                res.send(items);
            }
            else {
                res.status(403).send({ massage: 'forbidden access' });
            }
        });
        //DELETE API
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsColletion.deleteOne(query);
            res.send(result);
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