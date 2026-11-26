import { connectDb } from "../src/lib/db";
import { User, WorkoutTemplate } from "../src/lib/models";
import { WORKOUT_TEMPLATE } from "../src/features/workouts/data/template";
async function main(){await connectDb();const user=await User.findOneAndUpdate({displayName:"Local Owner"},{displayName:"Local Owner"},{upsert:true,new:true,setDefaultsOnInsert:true});const days=Object.entries(WORKOUT_TEMPLATE).map(([dayKey,day])=>({dayKey,label:day.label,exercises:day.exercises.map((e,displayOrder)=>({...e,displayOrder}))}));await WorkoutTemplate.findOneAndUpdate({userId:user._id,version:1},{userId:user._id,name:"PPL Hypertrophy — Version 1",version:1,durationWeeks:16,targetRIR:1,days,isActive:true},{upsert:true,new:true,setDefaultsOnInsert:true});console.log("Seeded Local Owner and PPL Hypertrophy — Version 1");process.exit(0)}
main().catch((error)=>{console.error(error);process.exit(1)});
