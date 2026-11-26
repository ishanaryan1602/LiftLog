import mongoose, { Schema } from "mongoose";
const opts={timestamps:true};
export const User = mongoose.models.User ?? mongoose.model("User", new Schema({displayName:{type:String,required:true},email:String},opts));
const exerciseSchema=new Schema({id:String,name:String,sets:Number,displayOrder:Number,notes:String,finisher:String},{_id:false});
export const WorkoutTemplate = mongoose.models.WorkoutTemplate ?? mongoose.model("WorkoutTemplate", new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true},name:String,version:Number,durationWeeks:Number,targetRIR:Number,days:[new Schema({dayKey:String,label:String,exercises:[exerciseSchema]},{_id:false})],isActive:Boolean},opts));
const loggedSetSchema=new Schema({setNumber:Number,weight:Number,repetitions:Number,actualRIR:Number,completed:Boolean},{_id:false});
export const WorkoutSession = mongoose.models.WorkoutSession ?? mongoose.model("WorkoutSession", new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true},templateId:{type:Schema.Types.ObjectId,ref:"WorkoutTemplate",required:true},templateVersion:Number,dayKey:String,startedAt:Date,completedAt:Date,status:String,exercises:[new Schema({exerciseId:String,exerciseName:String,prescribedSets:Number,sets:[loggedSetSchema]},{_id:false})],notes:String},opts));
export const Measurement = mongoose.models.Measurement ?? mongoose.model("Measurement", new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true},measuredAt:Date,bodyWeightKg:Number,leftArmCm:Number,rightArmCm:Number,chestCm:Number,waistCm:Number,shouldersCm:Number,leftThighCm:Number,rightThighCm:Number},opts));
export const AnalysisReport = mongoose.models.AnalysisReport ?? mongoose.model("AnalysisReport", new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true},sourceDataHash:String,reportType:String,aiAnalysis:String,generatedAt:Date},opts));
if (!mongoose.models.User) {
  User.schema.index({email:1},{sparse:true});
  WorkoutTemplate.schema.index({userId:1,version:1},{unique:true});
  WorkoutSession.schema.index({userId:1,startedAt:-1});
  Measurement.schema.index({userId:1,measuredAt:-1});
  AnalysisReport.schema.index({userId:1,reportType:1,sourceDataHash:1},{unique:true});
}
for (const model of [User,WorkoutTemplate,WorkoutSession,Measurement,AnalysisReport]) { void model; }
