import dotenv from "dotenv"

import express from "express";
import  app  from "./app.js"
import connectDB from "./db/index.js";
dotenv.config({
    path: './env'
})
connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000,()=> {
        console.log(`server is runing on port ${process.env.PORT}`);        
     }
)})
.catch((err) => {
    console.log("DATABASE CONNECTION ERROR: " , err);    
})

























































// import express from "express";
// const app = express();
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error', (error) => {
//             console.error('Failed to connect to MongoDB');
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on ${process.env.PORT}`);

//         })
//     } catch (error) {
//         console.error(error);
//         throw err;
//     }
// })();
