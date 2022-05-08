const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
// https://stackoverflow.com/questions/72162289/how-to-update-data-in-mongodb-database-and-show-in-ui
