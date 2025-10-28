import { ObjectId } from 'mongodb';
import clientPromise from './_lib/mongodb.js';

export default async function handler(request, response) {
  const client = await clientPromise;
  const db = client.db("billsnap");
  const sessions = db.collection("sessions");

  // --- LOGIC FOR CREATING A NEW SESSION (POST) ---
  if (request.method === 'POST') {
    try {
      const sessionData = request.body;
      const result = await sessions.insertOne({ ...sessionData, createdAt: new Date() });
      return response.status(200).json({ sessionId: result.insertedId });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Error creating session' });
    }
  }

  // --- NEW LOGIC FOR UPDATING AN EXISTING SESSION (PUT) ---
  if (request.method === 'PUT') {
    try {
      const { sessionId, ...sessionData } = request.body;
      if (!sessionId) {
        return response.status(400).json({ message: 'Session ID is required for updates' });
      }

      // Find the session by its ID and replace its data with the new data
      await sessions.updateOne(
        { _id: new ObjectId(sessionId) },
        { $set: sessionData }
      );
      
      return response.status(200).json({ message: 'Session updated successfully' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Error updating session' });
    }
  }

  // If the request method is not POST or PUT, reject it.
  return response.status(405).json({ message: 'Method Not Allowed' });
}