import { connect, disconnect } from "mongoose";

async function connectToDatabase() {
  try {
    await connect(process.env.MONGODB_URL);
  } catch (error) {
    throw new Error("canot connect to database.");
  }
}

// for security disconnect databse from ther server
async function disconnectFromDatabase() {
  try {
    await disconnect();
    console.log("databse disconnected.");
  } catch (error) {
    throw new Error("canot disconnect from database.");
  }
}

//exports funtctions
export {connectToDatabase, disconnectFromDatabase}