import { MongoClient } from "mongodb";

export default async function handler(req, res) {

  // ---- CORS FIX ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // -------------------

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data received" });
    }

    await client.connect();
    const db = client.db("aruhDB");
    const collection = db.collection("form_submissions");

    const result = await collection.insertOne({
      ...data,
      createdAt: new Date()
    });

    return res.status(200).json({
      message: "Form submitted successfully!",
      id: result.insertedId
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

