import mongoose from "mongoose";
import {OrderStatus} from "@wyf-ticketing/wyf";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

export {OrderStatus};

interface OrderAttrs{
    id: string;
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

interface OrderDoc extends mongoose.Document{
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
    {
        userId:{
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
        price: {
            type: Number,
            required: true
        },
    },
    {
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

orderSchema.set('versionKey','version');
orderSchema.plugin((updateIfCurrentPlugin));

orderSchema.statics.build = (attrs:OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        status: attrs.status,
        userId: attrs.userId,
        price: attrs.price
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
export {Order};