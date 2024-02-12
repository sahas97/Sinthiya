import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";


//connection and listeneres
await connectToDatabase();
app.listen(process.env.PORT || 5000, () => console.log("Sever is Open! and connected to databse.🚀"));
