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
