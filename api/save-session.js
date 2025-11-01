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

  // Logic for updating an existing session (PUT) - 
  if (request.method === 'PUT') {
    try {
      // THE FIX: Get the socketId from the request body
      const { sessionId, socketId, ...sessionData } = request.body;
      if (!sessionId) {
        return response.status(400).json({ message: 'Session ID is required' });
      }

      await sessions.updateOne(
        { _id: new ObjectId(sessionId) },
        { $set: sessionData }
      );
      
      // THE FIX: Pass the socketId to the 4th argument of pusher.trigger
      // This tells Pusher: "Send this to everyone EXCEPT the client with this ID."
      await pusher.trigger(
        `session-${sessionId}`,
        'session-update',
        sessionData,
        { socket_id: socketId } 
      );

      return response.status(200).json({ message: 'Session updated successfully' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Error updating session' });
    }
  }

  return response.status(405).json({ message: 'Method Not Allowed' });
}