import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let clientPromise;

if (!global._mongoClient) {
  global._mongoClient = client.connect();
}
clientPromise = global._mongoClient;

export default async function handler(req, res) {

  // ⭐⭐⭐ CORS HEADERS MUST COME FIRST ⭐⭐⭐
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  // Allow OPTIONS (browser CORS preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data received" });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("aruhDB");
    const collection = db.collection("form_submissions");

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

