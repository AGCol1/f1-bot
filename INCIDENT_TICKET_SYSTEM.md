# Incident Ticket System Documentation

## Overview

Incidents are now managed as **Discord ticket channels** where:
- ✅ Drivers submit incident reports via `/report-incident`
- ✅ Automatic Discord channels created per incident
- ✅ Only stewards can see/access tickets
- ✅ Stewards can resolve by assigning penalties
- ✅ Channels auto-deleted when resolved

---

## User Workflow

### **Driver: Report Incident**

```
/report-incident <round>
```

**Modal prompts:**
1. **Incident Description** - What happened
2. **Additional Context** - More details
3. **Evidence Links** - YouTube timestamps, screenshot URLs
4. **Involved Driver Name** - Who was involved

**What happens automatically:**
- ✅ Incident stored in database
- ✅ **Discord ticket channel created** with auto-permissions
  - Channel name: `ticket-123-round-5` (ticket-{ID}-round-{number})
  - Topic: `Incident Report #123 - Round 5`
  - **Only stewards can see and access**
- ✅ Embed posted with incident details
- ✅ Driver gets confirmation + ticket channel link

**Example Response:**
```
✅ Incident report #156 submitted!
🔗 Ticket channel: #ticket-156-round-5
```

---

### **Steward: Review & Resolve**

#### **Option 1: Resolve with Penalty**

```
/resolve-incident <incident_id>
```

**Modal prompts:**
1. **Time Penalty** - Seconds (e.g., `10` for 10 second penalty)
2. **Points Penalty** - Points (e.g., `3`)
3. **Reason** - Why the penalty (e.g., "Unsafe driving")

**Automatic Actions:**
- ✅ Penalty assigned to driver
- ✅ Race positions recalculated (if time penalty)
- ✅ Driver & constructor standings updated
- ✅ Ticket channel updated with resolution
- ✅ Incident marked as `closed`
- ✅ Ticket channel deleted

**Embed Update in Ticket:**
```
❌ Incident Report #156 - RESOLVED ✅
Description: ...
Resolution: 10s time + 3 points penalty
Reason: Unsafe driving at turn 3
```

#### **Option 2: Close Without Penalty**

```
/close-incident <incident_id> <reason>
```

**Example:**
```
/close-incident 156 "Not substantiated - no evidence"
```

**Automatic Actions:**
- ✅ Incident marked as `closed`
- ✅ No penalty assigned
- ✅ Ticket channel shows closure reason
- ✅ Ticket channel deleted after 5 seconds

---

## Ticket Channel Details

### **Channel Permissions**

**Who can see:**
- ✅ Stewards (via `trusted_roles` with `steward` type)
- ❌ Regular members
- ❌ Drivers
- ❌ Managers

**Permissions per steward:**
- View channel
- Send messages
- Read message history

### **Channel Structure**

**Initial Embed (Auto-Posted):**
```
🚨 Incident Report #156
Round 5 - Awaiting steward review

📝 Description
[Driver description]

📋 Context
[Additional context]

🔗 Evidence
[Links/timestamps]

👤 Reporter: @DriverName
⚠️ Involved Driver: Lewis Hamilton

⚖️ Steward Actions
Use /resolve-incident to assign penalties
Use /close-incident to close without penalty
```

**Resolution Messages:**

When steward resolves:
```
✅ Incident Resolved
Resolved by: @Steward
Penalty: 10s time + 3 points penalty
Reason: Unsafe driving
```

---

## Database Schema

### Updated `incident_reports` Table

```sql
incident_id         - Unique incident ID
season_id          - Season reference
round_id           - Round reference
reporter_id        - Discord user ID of reporter
reporter_driver_id - Driver ID of reporter
involved_driver_id - Driver ID of involved party
description        - Full incident description
context            - Additional context
evidence_links     - Evidence URLs
status             - 'open' | 'under_review' | 'closed'
decision           - Resolution text
decision_made_by   - Steward Discord user ID
ticket_channel_id  - Discord channel ID (NEW)
ticket_message_id  - Message ID of initial embed (NEW)
created_at         - When reported
updated_at         - Last modified
```

---

## Workflow Diagram

```
Driver: /report-incident
   ↓
Database: Create incident record
   ↓
Discord: Create ticket channel (#ticket-{id}-round-{num})
   ↓
Discord: Post incident details embed
   ↓
Database: Store channel_id + message_id
   ↓
Steward: See ticket channel in server
   ↓
Steward: /resolve-incident OR /close-incident
   ↓
If Resolve:
  ├─ Assign penalty to driver
  ├─ Recalculate race positions
  ├─ Update standings
  ├─ Update ticket embed (green, ✅ RESOLVED)
  └─ Delete ticket channel
  
If Close:
  ├─ Mark incident closed
  ├─ Post closure reason in channel
  └─ Delete ticket channel
```

---

## Features

✅ **Automatic Channel Creation**
- One channel per incident
- Auto-permissions set (stewards only)
- Clean naming convention

✅ **Initial Embed**
- Full incident details
- Reporter information
- Evidence links
- Quick command reference for stewards

✅ **Penalty Integration**
- Time penalties auto-recalculate positions
- Points penalties applied
- Standings update automatically

✅ **Auto-Resolution**
- Channels auto-deleted when resolved
- Keeps server clean
- History stored in database

✅ **Permission Control**
- Only stewards can see tickets
- Drivers can't access channels
- Managers can't access channels

---

## Commands Reference

### `/report-incident <round>`
- **Who:** Any driver
- **Modal:** Description, Context, Evidence, Involved Driver
- **Result:** Ticket channel created

### `/resolve-incident <incident_id>`
- **Who:** Stewards only
- **Modal:** Time Penalty, Points Penalty, Reason
- **Result:** Penalty assigned, standings updated, channel deleted

### `/close-incident <incident_id> <reason>`
- **Who:** Stewards only
- **Slash Options:** Incident ID, Reason text
- **Result:** Incident closed, no penalty, channel deleted

### `/view-incidents`
- **Who:** Stewards only (admin check)
- **Result:** Shows all open incidents (database view)
- **Note:** Still available for quick lookup

---

## Error Handling

**Driver submits incident:**
- ❌ No season exists → "No active season found"
- ❌ Round doesn't exist → "Round X not found"
- ✅ Success → Ticket created + confirmation

**Steward resolves incident:**
- ❌ Not a steward → "Only stewards can resolve"
- ❌ Incident not found → "Incident #X not found"
- ❌ Already closed → "Incident #X is already closed"
- ✅ Success → Penalty applied, channel deleted

---

## Best Practices

1. **Quick Reporting**
   - Drivers report immediately after incident
   - Include evidence (timestamps)
   - Mention involved driver clearly

2. **Timely Review**
   - Stewards check ticket channels regularly
   - Resolve before next race when possible
   - Document decision in reason field

3. **Penalty Consistency**
   - Similar infractions = similar penalties
   - Time penalties for race rule violations
   - Point penalties for unsportsmanlike conduct
   - Or both for serious incidents

4. **Communication**
   - Stewards can discuss in ticket channel
   - All discussions visible in one place
   - Deletion after resolution keeps history clean

---

## Steward Workflow Example

1. **Driver reports:** "Max cut turn 3 and gained position"
   - `/report-incident 5`
   - Involved Driver: `Max Verstappen`
   - Evidence: `https://youtube.com/watch?v=...?t=1234`

2. **Ticket channel created:** `#ticket-156-round-5`
   - Only stewards can see

3. **Stewards review:**
   - Read incident details
   - Watch evidence link
   - Discuss in channel

4. **Steward resolves:**
   - `/resolve-incident 156`
   - Time Penalty: `10` (seconds)
   - Points Penalty: `0`
   - Reason: `Cut track at turn 3, gained position`

5. **Auto-updates:**
   - ✅ Penalty applied
   - ✅ Max's race time updated (+10 sec)
   - ✅ Positions recalculated (Max drops from 1st to 2nd)
   - ✅ Points recalculated (Max loses 25pts, gets 18pts)
   - ✅ Standings update
   - ✅ Ticket channel deleted

---

## Database Methods

### `F1Database.reportIncident()`
Creates incident record.

### `F1Database.updateIncidentTicket(incidentId, channelId, messageId)`
Stores ticket channel info.

### `F1Database.getIncidentById(incidentId)`
Retrieves incident details.

### `F1Database.getOpenIncidentsForGuild(guildId)`
Gets all non-closed incidents for a guild.

### `F1Database.closeIncident(incidentId, decision, decidedBy)`
Marks incident as closed.

### `F1Database.getTrustedRoles(guildId, roleType)`
Gets steward/manager roles.

---

## Summary

The ticket system provides:
- **Organized incident management** via Discord channels
- **Permission control** (stewards only)
- **Automatic penalty resolution** with standings updates
- **Clean audit trail** in database
- **Seamless integration** with penalty system

Drivers report → Ticket created → Stewards resolve → Standings update ✅
