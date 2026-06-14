const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(

{

customerId:{

type:
mongoose.Schema.Types.ObjectId,

ref:
'User',

required:true
},

pickup:{
    address:{
type:String,
required:true,
trim:true
}

},

dropoff:{
address:{
type:String,
required:true,
trim:true
},

recipientName:{
type:String,
required:true,
trim:true
},

phone:{
type:String,
required:true,
trim:true
}

},

package:{
type:{

type:String,

enum:[
'document',
'small',
'medium',
'large',
'freight'
],

required:true

},

weight:{

type:Number,

required:true,

min:0.1

}

},

instructions:{

type:String,

default:''

},

price:{

type:Number,

default:0

},

distance:{

type:Number,

default:0

},

status:{

type:String,

enum:[

'pending',

'dispatch_assigned',

'pickup_in_progress',

'in_transit',

'delivered',

'cancelled'

],

default:'pending'

},

driver:{

type:
mongoose.Schema.Types.ObjectId,

ref:
'User',

default:null

},

createdAt:{

type:Date,

default:Date.now

},

updatedAt:{

type:Date,

default:Date.now

}

},

{

timestamps:true

}

);

module.exports =
mongoose.model(
'Order',
orderSchema
);