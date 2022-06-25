import mongoose from "mongoose";
import {PasswordUtils} from "../tools/PasswordUtils";

// A interface standards all the attributes pass
interface UserAttrs{
    email:string;
    password:string;
}
// A interface describe all attributes that a User Model has
interface UserModel extends mongoose.Model<UserDoc>{
    build(attrs:UserAttrs):UserDoc;
}

// A interface describe all attributes that a User Doc has
interface UserDoc extends mongoose.Document{
    email:string;
    password:string;
}

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type:String,
        required: true
    }
},    {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            delete ret._id;
            delete ret.password;
        }
    }
});
userSchema.pre('save',async function (done){
    if(this.isModified('password')){
        const hashed = await PasswordUtils.hash(this.get('password'));
        this.set('password',hashed);
    }
    done();
});
userSchema.statics.build = (attrs: UserAttrs) =>{
    return new User(attrs);
}

const User = mongoose.model<UserDoc,UserModel>('User',userSchema);

// const user = User.build({
//     email:'tea@ada.com',
//     password:'sadda'
// });

export { User };