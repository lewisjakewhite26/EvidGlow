import NebulaSphere from "./NebulaSphere";

/**
 * Demo — shows NebulaSphere filling a panel,
 * just like the Sensory Flow canvas in your app.
 *
 * In your real app, replace this file with wherever
 * you want to drop the component in.
 */
export default function App() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0d1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      boxSizing: "border-box",
    }}>
      {/* Drop NebulaSphere anywhere — it fills its parent */}
      <NebulaSphere
        showMoodPicker={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

/**
 * ─── Integration examples ───────────────────────────────────────────────────
 *
 * 1. Controlled externally by your sidebar (no built-in picker):
 *
 *   const [mood, setMood] = useState("teal");
 *   <NebulaSphere mood={mood} showMoodPicker={false} />
 *
 * 2. Inside a fixed-size panel:
 *
 *   <div style={{ width: 640, height: 480 }}>
 *     <NebulaSphere mood="purple" showMoodPicker={false} />
 *   </div>
 *
 * 3. Full page:
 *
 *   <NebulaSphere style={{ borderRadius: 0 }} />
 *
 * ─── Mood keys ─────────────────────────────────────────────────────────────
 *   "teal"   → deep teal / cyan / midnight navy
 *   "blue"   → indigo / periwinkle / deep navy
 *   "rose"   → deep rose / dusty coral / burgundy
 *   "amber"  → deep amber / golden / ochre
 *   "purple" → deep violet / lavender / plum
 */
