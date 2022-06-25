const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

const cors = require('cors');
require('dotenv').config()
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntqc6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);

// jwt 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        await client.connect();
        const usersCollection = client.db("inventoryManagement").collection("users");

        //user create or update 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = req.body;
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
            res.send({ result, token })
        })

        // Profile 
        app.get('/profile/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const profile = await usersCollection.findOne({ email: email })
            res.send(profile)
        })

        // update img
        app.put('/my-image/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const updateInfo = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: updateInfo
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        //27 update profile
        app.put('/profile/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const updateInfo = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: updateInfo
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })


    } 
    finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server is running port ${port}`)
})