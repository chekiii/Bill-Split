import { ObjectId } from 'mongodb';
import clientPromise from './_lib/mongodb';

export default async function handler(request, response) {
  try {
    const client = await clientPromise;
    const db = client.db("billsnap");
    const sessions = db.collection("sessions");
    
    // Get the session ID from the URL (e.g., /api/get-session?id=...)
    const { id } = request.query;

    // Find the session in the database using its unique ID
    const sessionData = await sessions.findOne({ _id: new ObjectId(id) });

    if (sessionData) {
      return response.status(200).json(sessionData);
    } else {
      return response.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error fetching session' });
  }
}