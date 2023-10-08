const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const uri = process.env.URI_DATABASE

const app = express()
app.use(cors())

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function incrementPageView(pageName) {
    try {
        const db = client.db("fm-tools");
        const pageViews = db.collection("pageViews");

        const pageViewEntry = await pageViews.findOne({ page: pageName });

        if (pageViewEntry) {
            await pageViews.updateOne({ page: pageName }, { $inc: { count: 1 } });
        } else {
            await pageViews.insertOne({ page: pageName, count: 1 });
        }

    } catch (error) {
        console.error("Error updating page view count:", error);
    }
}

app.get('/totalviews', async (req, res) => {
    try {
        const db = client.db("fm-tools");
        const pageViews = db.collection("pageViews");
        
        const allPageViews = await pageViews.find().toArray();
        
        res.json(allPageViews);
        
    } catch (error) {
        console.error("Error fetching total views:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/:pageName', async (req, res) => {
    try {
        const { pageName } = req.params;
        await incrementPageView(pageName);
        
        const db = client.db("fm-tools");
        const pageViews = db.collection("pageViews");
        const pageData = await pageViews.findOne({ page: pageName });

        res.json({ page: pageName, views: pageData.count });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


const PORT = 3001;
app.listen(process.env.PORT || PORT)