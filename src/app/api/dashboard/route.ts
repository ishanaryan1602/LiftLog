import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Measurement, User, WorkoutSession } from "@/lib/models";
export async function GET(){await connectDb();const user=await User.findOne({displayName:"Local Owner"});if(!user)return NextResponse.json({workouts:0,latestMeasurement:null});const [workouts,latestMeasurement]=await Promise.all([WorkoutSession.countDocuments({userId:user._id,status:"completed"}),Measurement.findOne({userId:user._id}).sort({measuredAt:-1}).lean()]);return NextResponse.json({workouts,latestMeasurement})}
