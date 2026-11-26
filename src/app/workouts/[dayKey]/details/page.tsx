import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKOUT_TEMPLATE, prescribedSetTotal } from "@/features/workouts/data/template";
import { DetailLayout } from "@/components/detail-layout";
import { SessionSequence } from "../session-sequence";
import { WorkoutExerciseDetails } from "./workout-exercise-details";

const purposes: Record<string, string> = {
  "smith-incline-press": "The inclined pressing angle increases shoulder flexion and places a strong mechanical demand on the clavicular head of the pectoralis major. The guided bar path reduces balance requirements, allowing controlled repetitions and consistent proximity to muscular failure.",
  "lateral-raise": "Shoulder abduction is performed primarily by the middle deltoid, with the load kept away from the torso to maintain a challenging resistance curve. Controlled tempo and a brief pause near peak elevation increase effective time under tension without relying on momentum.",
  "single-arm-lat-pulldown": "This unilateral vertical pull combines shoulder adduction with elbow flexion to train the latissimus dorsi through a long range of motion. Working one side at a time also gives the lifter more control over scapular depression and left-to-right balance.",
  "barbell-curl": "The barbell curl trains the elbow flexors through loaded supination, with the biceps brachii contributing strongly when the forearm remains turned upward. A fixed bar path makes it simple to apply progressive overload while limiting unnecessary shoulder movement.",
  "reverse-curl": "The pronated grip reduces the biceps’ leverage and increases the contribution of the brachialis and brachioradialis during elbow flexion. This makes the exercise useful for developing forearm thickness and strength in the upper portion of the pull.",
  "db-shoulder-press": "Dumbbell pressing trains shoulder flexion and abduction through the anterior and lateral deltoids, with the triceps assisting elbow extension. Independent loading allows each arm to find a natural path while still providing a stable vertical press for progressive volume.",
  "db-shrugs": "Shrugs use scapular elevation to load the upper trapezius, which transfers force from the shoulders into the upper back and neck region. Pausing at the top and lowering under control keeps the work in the target muscles rather than turning it into a bouncing movement.",
  "cable-wrist-curl": "Wrist curls isolate the forearm flexor group through repeated wrist flexion against a consistent cable resistance. The cable maintains tension across the range and supports gradual loading without requiring the elbow or shoulder to become the limiting joint.",
  "incline-smith-press": "Builds upper-chest pressing strength with a stable path that makes controlled hypertrophy work easier. The incline increases shoulder flexion demands while the fixed bar reduces the stabilization cost of each repetition.",
  "machine-flat-press": "Adds chest pressing volume through the midline with consistent resistance and less balance demand. The supported position lets the pectorals and triceps accumulate hard sets without excessive fatigue from stabilizing the torso.",
  "pec-deck-fly": "The pec-deck trains horizontal shoulder adduction, bringing the humerus toward the midline while the elbows remain softly bent. Its supported setup keeps tension on the pectoralis major in the shortened position and complements heavier compound presses.",
  "overhead-cable-extension": "An overhead arm position lengthens the triceps long head before elbow extension, increasing its contribution to the movement. Cable resistance provides a smooth challenge through the full arc and makes controlled lockout mechanics easier to maintain.",
  "single-arm-triceps-pushdown": "The pushdown trains elbow extension with the triceps acting as the primary mover, while the cable maintains tension through the shortened position. Unilateral execution helps the lifter control shoulder position and identify strength differences between sides.",
  "cable-crunch": "Cable crunches train spinal flexion by bringing the rib cage toward the pelvis under external resistance, emphasizing the rectus abdominis. The adjustable load makes the movement suitable for progressive overload while the kneeling position limits assistance from the hips.",
  "wrist-curl": "Wrist curls develop the forearm flexors through repeated wrist flexion against a controlled load. Strengthening these muscles supports grip endurance and complements the elbow-flexor work performed elsewhere in the session.",
  "lat-pulldown": "The lat pulldown combines shoulder adduction with elbow flexion to train the latissimus dorsi for upper-body pulling strength and back width. A controlled stretch at the top followed by scapular depression helps maintain tension in the back instead of shifting it entirely to the arms.",
  "chest-supported-row": "This horizontal pull trains shoulder extension and scapular retraction for upper-back thickness, with the chest support reducing lumbar stabilization demands. That support lets the lifter focus on driving the elbows back and accumulating quality back volume.",
  "single-arm-cable-row": "The unilateral cable row trains horizontal shoulder extension while allowing the scapula to move naturally around the rib cage. One-sided loading improves control and gives the lats, upper back, and elbow flexors a balanced stimulus.",
  "alternating-db-curl": "Alternating curls train elbow flexion with independent arm loading and allow each repetition to be performed through a deliberate supinated range. The alternating format reduces momentum and makes it easier to keep the shoulder from assisting the biceps.",
  "hammer-curl": "The neutral grip increases the contribution of the brachialis and brachioradialis while still training the biceps through elbow flexion. This combination adds upper-arm density and builds forearm strength without requiring a fully supinated wrist.",
  "wrist-extension": "Wrist extensions target the forearm extensor compartment through controlled extension against resistance. Balanced development of the flexors and extensors can improve wrist control and support repeated gripping tasks.",
  "leg-press": "The leg press trains knee extension and hip extension with the torso supported, allowing high-output work for the quadriceps and gluteus maximus. Foot position and depth change the relative joint demands, but controlled depth keeps the stimulus focused and repeatable.",
  "leg-extension": "Leg extensions isolate the quadriceps by resisting knee extension while the hip remains fixed against the pad. The open-chain setup makes it useful for adding targeted hypertrophy volume after compound leg work.",
  "leg-curl": "Leg curls train the hamstrings through knee flexion, complementing exercises that load them through hip extension. Maintaining pelvic control and a deliberate eccentric keeps the resistance on the hamstrings across the shortened and lengthened positions.",
  "cuffed-cable-lateral-raise": "The cuff places resistance directly through the arm during shoulder abduction, reducing the need to grip a dumbbell. This can help maintain a smooth line of pull and keep the middle deltoid under continuous tension as the arm rises.",
  "reverse-pec-deck": "The reverse pec-deck trains horizontal shoulder abduction with emphasis on the rear deltoids and the muscles that retract the scapula. Chest support reduces body English, making it easier to keep the movement controlled and symmetrical.",
  "romanian-deadlift": "The Romanian deadlift loads the hamstrings and glutes through hip extension while the knees remain slightly flexed. A controlled eccentric increases tension in the lengthened posterior chain and reinforces a strong hinge without turning the lift into a squat.",
};

const targets: Record<string, string[]> = {
  "smith-incline-press": ["Chest", "Shoulders", "Triceps"],
  "lateral-raise": ["Shoulders"],
  "single-arm-lat-pulldown": ["Lats", "Biceps"],
  "barbell-curl": ["Biceps"],
  "reverse-curl": ["Biceps", "Forearms"],
  "db-shoulder-press": ["Shoulders", "Triceps"],
  "db-shrugs": ["Upper back", "Shoulders"],
  "cable-wrist-curl": ["Forearms"],
  "incline-smith-press": ["Upper chest", "Front delts", "Triceps"],
  "machine-flat-press": ["Chest", "Front delts", "Triceps"],
  "pec-deck-fly": ["Chest"],
  "overhead-cable-extension": ["Triceps"],
  "single-arm-triceps-pushdown": ["Triceps"],
  "cable-crunch": ["Abs"],
  "wrist-curl": ["Forearms"],
  "lat-pulldown": ["Lats", "Biceps"],
  "chest-supported-row": ["Upper back", "Lats", "Rear delts"],
  "single-arm-cable-row": ["Lats", "Upper back", "Biceps"],
  "alternating-db-curl": ["Biceps"],
  "hammer-curl": ["Brachialis", "Forearms"],
  "wrist-extension": ["Forearms"],
  "leg-press": ["Quads", "Glutes"],
  "leg-extension": ["Quads"],
  "leg-curl": ["Hamstrings"],
  "cuffed-cable-lateral-raise": ["Lateral delts"],
  "reverse-pec-deck": ["Rear delts", "Upper back"],
  "romanian-deadlift": ["Hamstrings", "Glutes", "Lower back"],
};

export default async function WorkoutDetails({ params }: { params: Promise<{ dayKey: string }> }) {
  const { dayKey } = await params;
  const day = WORKOUT_TEMPLATE[dayKey as keyof typeof WORKOUT_TEMPLATE];
  if (!day) notFound();

  return <DetailLayout backHref="/training?section=workouts" backLabel="Training" breadcrumbSection="Workouts" breadcrumbSectionHref="/training?section=workouts" currentLabel={day.label} scrollable showHeader={false} sidebar={<SessionSequence exercises={day.exercises} />}>
    <div className="mb-6 shrink-0"><h1 className="text-2xl font-medium tracking-tight">{day.label}</h1><p className="mt-2 text-sm text-muted">{day.exercises.length} exercises · {prescribedSetTotal(dayKey as keyof typeof WORKOUT_TEMPLATE)} sets</p></div>
    <WorkoutExerciseDetails exercises={day.exercises} purposes={purposes} targets={targets} />
    <div className="workout-action-bar flex justify-end"><Link href={`/workouts/${dayKey}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-purple px-4 text-sm font-semibold text-white transition hover:brightness-110">Log this workout</Link></div>
  </DetailLayout>;
}
