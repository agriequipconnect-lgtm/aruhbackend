import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;  // Your MongoDB URL
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let clientPromise;
if (!global._mongoClient) {
  global._mongoClient = client.connect();
}
clientPromise = global._mongoClient;

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Read JSON body
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data received" });
    }

    // Connect to DB
    const mongoClient = await clientPromise;
    const db = mongoClient.db("aruhDB");   // Database name
    const collection = db.collection("form_submissions");

    // Insert form data
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date()
    });

    console.log("Inserted:", result.insertedId);

    return res.status(200).json({
      message: "Form submitted successfully!",
      id: result.insertedId
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
