const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4u6eq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const stockCollection = client.db('bicycleWarehouse').collection('stock');
    const myItemCollection = client.db('bicycleWarehouse').collection('items');

    // auth
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      });
      res.send({ accessToken });
    });

    // stock api
    app.get('/stock', async (req, res) => {
      const query = {};
      const cursor = stockCollection.find(query);
      const stocks = await cursor.toArray();
      res.send(stocks);
    });

    app.get('/stock/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const stock = await stockCollection.findOne(query);
      res.send(stock);
    });

    // My items collection
    app.get('/items', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = myItemCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      } else {
        res.status(403).send({ message: 'forbidden access' });
      }
    });

    app.post('/items', async (req, res) => {
      const items = req.body;
      const result = await myItemCollection.insertOne(items);
      res.send(result);
    });

    app.delete('/items', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myItemCollection.deleteOne(query);
      res.send(result);
    });

    // delete
    app.delete('/stock/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await stockCollection.deleteOne(query);
      res.send(result);
    });

    // post
    app.post('/stock', async (req, res) => {
      const newItem = req.body;
      const result = await stockCollection.insertOne(newItem);
      res.send(result);
    });

    // update user
    app.put('/stock/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedProduct.quantity,
        },
      };
      const result = await stockCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });
  } finally {
    // some code that stop this function
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running warehouse Server');
});

app.listen(port, () => {
  console.log('Listening to port', port);
});
