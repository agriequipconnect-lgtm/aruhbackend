import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Rest of your logic...
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("aruhDB"); // ensure this is your DB name
    const collection = db.collection("leads"); // ensure collection name matches
    const result = await collection.insertOne({
      ...req.body,
      submittedAt: new Date()
    });
    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}

