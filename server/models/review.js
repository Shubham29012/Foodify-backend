const mongoose=require('mongoose');
const { Schema } = mongoose;
const reviewSchema=new Schema({
    restaurantId:{
        type:Schema.Types.ObjectId,
        ref:'Restaurant',
        required:true,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderId:{
        type:Schema.Types.ObjectId,
        ref:'order',
       
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true,
    },
    comment:{
        type:String,
        trim:true
    },
    images:[{
        type:String,
}]
},
{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)
module.exports=mongoose.model('Review',reviewSchema);