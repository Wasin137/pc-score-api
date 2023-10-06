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
        // Select the "myDatabase" database and the "pageViews" collection
        const db = client.db("myDatabase");
        const pageViews = db.collection("pageViews");

        // Check if page already has an entry
        const pageViewEntry = await pageViews.findOne({ page: pageName });

        if (pageViewEntry) {
            // If the page already exists in the database, increment its view count
            await pageViews.updateOne({ page: pageName }, { $inc: { count: 1 } });
        } else {
            // If the page doesn't exist in the database, create an entry with a count of 1
            await pageViews.insertOne({ page: pageName, count: 1 });
        }

    } catch (error) {
        console.error("Error updating page view count:", error);
    }
}

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