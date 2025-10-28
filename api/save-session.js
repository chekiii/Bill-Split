import clientPromise from './_lib/mongodb';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("billsnap"); // You can name your database anything you like
    const sessions = db.collection("sessions");

    const sessionData = request.body;
    // Insert the data into the 'sessions' collection
    const result = await sessions.insertOne({ ...sessionData, createdAt: new Date() });

    // Return the unique ID of the newly created session
    return response.status(200).json({ sessionId: result.insertedId });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error saving session' });
  }
}