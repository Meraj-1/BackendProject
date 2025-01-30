// import { Schema } from "mongoose";
import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscription : {
        typeof: Schema.Types.ObjectsId, //one whos is subscribing 
        ref: "User"
    },
    channel : {
        typeof : Schema.Types.ObjectsId, // one to whom "subcriber" is subscribing
        ref: "User"
    }
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema)