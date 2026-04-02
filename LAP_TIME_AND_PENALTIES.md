# Lap Time & Penalty System Documentation

## Overview

The F1 Bot now supports **full lap time tracking** with **automatic penalty recalculation**. This means when stewards assign time penalties, race positions automatically update based on the new corrected times.

---

## How It Works

### 1. **Race Results Entry (`/enter-results`)**

When a manager enters race results, they now provide:
- **Finishing Position** (1, 2, 3, etc.)
- **Lap Time Delta** (time behind winner)
- **Fastest Lap?** (yes/no)
- **DNF?** (yes/no - Did Not Finish)

**Example:**
```
Driver 1 (Winner):   Position 1,  Lap Time +0:00.000
Driver 2:            Position 2,  Lap Time +1:23.456  (1 min 23.456 sec behind)
Driver 3:            Position 3,  Lap Time +2:15.789  (2 min 15.789 sec behind)
```

### 2. **Steward Time Penalties (`/assign-penalty`)**

Stewards can now assign **time penalties** (in seconds):
```
/assign-penalty @Driver 5 10 0 Cutting track limits
```
- `10` = 10 second time penalty
- `0` = 0 point penalty (just time)

**What Happens Automatically:**
1. ✅ Penalty recorded
2. ✅ Driver's adjusted lap time = original time + penalty
3. ✅ **Positions recalculated** based on new times
4. ✅ **Points recalculated** based on new positions
5. ✅ **Standings updated** immediately

### 3. **Example: Time Penalty Scenario**

**Original Results:**
```
1st:  Max     +0:00.000     25 points
2nd:  Lewis   +1:23.456     18 points
3rd:  Charles +2:15.789     15 points
```

**Steward Action:**
```
/assign-penalty @Max 5 10 0 Unsafe driving (10 second penalty)
```

**Auto-Recalculated Results:**
```
1st:  Lewis   +1:23.456     25 points (moved up!)
2nd:  Max     +0:10.000     18 points (original 0:00.000 + 10 sec penalty)
3rd:  Charles +2:15.789     15 points (unchanged)
```

---

## Database Schema Changes

### Race Results Table
Added `lap_time_delta` column:
```sql
ALTER TABLE race_results 
ADD COLUMN lap_time_delta VARCHAR(20) COMMENT '+MM:SS.SSS format'
```

### Penalties Table
Time penalty now stored in seconds:
```sql
ALTER TABLE penalties 
MODIFY COLUMN time_penalty INT COMMENT 'Time penalty in seconds'
```

---

## Lap Time Format

### Format Rules
- **Format:** `+MM:SS.SSS`
- **Example:** `+1:23.456`
- **Breakdown:**
  - `+` = Plus sign (required)
  - `MM` = Minutes (00-59)
  - `:` = Colon separator
  - `SS.SSS` = Seconds with 3 decimal places (milliseconds)

### Examples
```
+0:00.000   ← Winner (reference time)
+0:15.234   ← 15 seconds behind
+1:23.456   ← 1 minute 23 seconds behind
+12:45.678  ← 12 minutes 45 seconds behind
```

---

## Auto-Recalculation Process

### When Positions Recalculate
1. **Steward assigns TIME penalty** → Recalculation triggered
2. **System calculates:** Original Lap Time + Time Penalty = Adjusted Time
3. **System sorts:** All drivers by adjusted time (fastest first)
4. **System assigns:** New positions based on adjusted times
5. **System calculates:** Points based on new positions

### Important Notes
- ✅ **Point penalties alone** do NOT recalculate positions
- ✅ **Time penalties** DO recalculate positions + points
- ✅ Fastest lap bonus still applies if in points + not DNF
- ✅ All changes are **automatic** and **instant**

---

## F1 Points System (Default)

| Position | Points |
|----------|--------|
| 1st      | 25     |
| 2nd      | 18     |
| 3rd      | 15     |
| 4th      | 12     |
| 5th      | 10     |
| 6th      | 8      |
| 7th      | 6      |
| 8th      | 4      |
| 9th      | 2      |
| 10th     | 1      |
| Fastest Lap (if in points) | +1 |
| DNF      | 0      |

---

## Example: Multi-Driver Penalties

### Scenario
Round 5 original results:
```
1. Max      +0:00.000  25 pts
2. Lewis    +0:45.123  18 pts
3. Charles  +1:12.456  15 pts
```

### Stewards Issue Penalties
```
- 5 second penalty to Max (unsafe move at turn 1)
- 3 second penalty to Lewis (forcing off track)
```

### Auto-Recalculated Results
```
1. Charles  +1:12.456  25 pts (moved up by 2 positions!)
2. Lewis    +0:48.123  18 pts (3 sec penalty applied, +0:45 + 3 sec)
3. Max      +0:05.000  15 pts (5 sec penalty applied, +0:00 + 5 sec)
```

---

## Driver Standings After Penalties

The standings automatically update to reflect:
- New positions from any round with penalties
- Recalculated points for that round
- Updated cumulative totals
- View with `/driver-standings`

**Example:**
```
Championship Before Penalties:
1. Max Verstappen   52 points
2. Lewis Hamilton   45 points
3. Charles Leclerc  38 points

Championship After Penalties (Round 5):
1. Lewis Hamilton   43 points  (lost 2 to Charles)
2. Charles Leclerc  43 points  (gained 10 from Max going to 3rd)
3. Max Verstappen   40 points  (lost 15 by dropping to 3rd)
```

---

## Key Features

✅ **Automatic recalculation** - No manual fixing needed
✅ **Full audit trail** - Penalties stored with reason & steward ID
✅ **Real-time standings** - View updates immediately
✅ **Cascade updates** - Constructor standings auto-update from drivers
✅ **Flexible format** - Supports any number of drivers/positions
✅ **Penalty history** - View all penalties with `/view-penalties`

---

## New F1Database Methods

### `enterRaceResult(roundId, driverId, position, lapTimeDelta, fastestLap, dnf)`
Enters a race result with lap time.

### `getAttendingDriversForRound(roundId)`
Gets all drivers marked attending for a round.

### `getRaceResults(roundId)`
Gets all results for a round with driver/team names.

### `recalculatePositionsAfterPenalty(roundId)`
Recalculates all positions after penalties applied.

---

## Steward Workflow

### Step 1: View Race Results
```
/driver-standings
```

### Step 2: Identify Issue
Check lap times and see which drivers need penalties.

### Step 3: Issue Penalty
```
/assign-penalty @Driver <round> <time_sec> <points> <reason>
```

### Step 4: Verify Auto-Update
```
/driver-standings
```
Standings automatically show new positions!

---

## Common Questions

### Q: What if I enter a wrong lap time?
A: Run `/enter-results` again for that round and select the same driver. The system updates (replaces old result). Standings recalculate.

### Q: What if a driver gets multiple penalties?
A: Each penalty adds to their time. System adds all active penalties together for recalculation.

### Q: What if I need to change a penalty?
A: Currently penalties are permanent when `status = 'active'`. Consider adding penalty appeals later if needed.

### Q: Do DNF drivers get penalties?
A: DNF drivers get 0 points regardless. Time penalties still apply if they're re-classed into points.

### Q: Can a penalty make someone drop out of points?
A: Yes! Example: 10th place (1 pt) gets 30 second penalty → drops to 12th place (0 pts).

---

## Migration for Existing Databases

If you have an existing database without lap times:

```sql
-- Add lap_time_delta column
ALTER TABLE race_results 
ADD COLUMN lap_time_delta VARCHAR(20) 
AFTER position;

-- Old results will have NULL lap_time_delta
-- New results will have proper values like +0:00.000
```

---

## Testing the System

### Test Case 1: No Penalties
```
1. Enter results with lap times
2. Check standings
3. Result: Should match positions entered
```

### Test Case 2: Simple Time Penalty
```
1. Enter: 1st +0:00, 2nd +1:00
2. Penalize 1st with 30 seconds
3. Expected: 2nd becomes 1st, 1st drops to 2nd
```

### Test Case 3: Multiple Penalties
```
1. Enter: 1st +0:00, 2nd +0:30, 3rd +1:00
2. Penalize 1st with 45 seconds
3. Penalize 2nd with 20 seconds
4. Expected: 3rd→1st, 2nd→2nd, 1st→3rd
```

---

## Summary

The lap time + penalty system ensures that:
- ✅ **Accurate racing** - Race results based on real lap times
- ✅ **Fair penalties** - Time penalties recalculate positions automatically
- ✅ **Transparent standings** - Everyone can see the real championship
- ✅ **Steward power** - Time penalties instantly update everything
- ✅ **Zero manual work** - No need to manually recalculate positions

When stewards assign penalties, the bot handles all the math automatically! 🏁
