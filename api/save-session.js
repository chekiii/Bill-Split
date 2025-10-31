import { ObjectId } from 'mongodb';
import clientPromise from './_lib/mongodb.js';
import { pusher } from './_lib/pusher.js'; // Import the Pusher client

export default async function handler(request, response) {
  const client = await clientPromise;
  const db = client.db("billsnap");
  const sessions = db.collection("sessions");

  // Logic for creating a new session (POST)
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

  // Logic for updating an existing session (PUT) - Pusher code removed
  if (request.method === 'PUT') {
    try {
      const { sessionId, ...sessionData } = request.body;
      if (!sessionId) {
        return response.status(400).json({ message: 'Session ID is required' });
      }

      await sessions.updateOne(
        { _id: new ObjectId(sessionId) },
        { $set: sessionData }
      );

      // Trigger a Pusher event after the database update
      await pusher.trigger(`session-${sessionId}`, 'session-update', sessionData);

      return response.status(200).json({ message: 'Session updated successfully' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Error updating session' });
    }
  }

  return response.status(405).json({ message: 'Method Not Allowed' });
}