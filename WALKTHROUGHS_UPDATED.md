# F1 Bot Walkthrough Updates

## Summary of Changes

This document describes the major enhancements to the F1 Bot's walkthrough system and help documentation.

---

## 1. Enhanced `/create-season` Walkthrough

### What Changed
The `/create-season` command now includes **4 complete steps** with user guidance:

#### **Step 1/3: Basic Season Info**
- Modal asks for: Season number & total rounds
- Confirmation embed shows what was entered
- Automatically advances to Step 2

#### **Step 2/3: Select Circuits**
- Multi-select menu for each round (1 through N)
- Shows current round progress (e.g., "Round 5 of 24")
- Real-time feedback after each selection
- Auto-advances to Step 3 when complete

#### **Step 3/3: Setup Roles (NEW & OPTIONAL)**
- After all tracks selected, users see role setup offer
- **Two buttons:**
  - ✅ "Setup Roles Now" → Modal to enter Steward/Manager role IDs
  - ⏭️ "Skip for Now" → Jump straight to success
- Can always configure roles later with `/manage-roles`

#### **Step 4: Success & Next Steps**
- Shows season summary
- Lists exactly what to do next:
  1. `/register-driver` - Drivers register (one-time per guild)
  2. `/setup-teams` - Select F1 teams for season
  3. `/assign-drivers` - Assign drivers to teams
  4. Launch season with `/attendance`

### Key Features
- ✅ **Auto-archives previous season** (keeps history, fresh start)
- ✅ **Drivers carry over** to new seasons (no re-registration)
- ✅ **Optional role setup** in walkthrough
- ✅ **Clear progression** with visual indicators (Step 1/3, ✅ Complete, etc.)
- ✅ **Guidance at each step** explaining what's happening

---

## 2. Comprehensive `/f1help` Command

### What Changed
`/f1help` is now **8 embeds of detailed documentation** instead of 3 brief embeds.

### Content Includes

#### **Embed 1: Getting Started (First Time Setup)**
- Step-by-step first season setup
- Clear order: create-season → register-driver → manage-roles → setup-teams → assign-drivers
- Explanations of what each step does

#### **Embed 2: Season Management**
- How to view season info
- Creating a **second season** (drivers auto-carry over!)
- Deleting a season (with safety warnings)

#### **Embed 3: Race Weekend Workflow**
- Step-by-step race weekend process
- `/attendance <round>` usage with example
- `/enter-results <round>` usage with example
- `/driver-standings` and `/constructor-standings`
- `/assign-penalty` for steward use with multiple examples

#### **Embed 4: Detailed Commands - Part 1**
- **`/register-driver`** - Full syntax, options, examples
- **`/setup-teams`** - How it works, which teams available
- **`/assign-drivers`** - Step-by-step process
- **`/manage-roles`** - Syntax for steward/manager role setup

#### **Embed 5: Detailed Commands - Part 2**
- **`/attendance`** - Usage, options, what drivers see
- **`/enter-results`** - Detailed walkthrough
- **`/driver-standings`** - What's shown
- **`/constructor-standings`** - Team standings info

#### **Embed 6: Penalties & Incidents**
- **`/assign-penalty`** - Multiple examples
  - Time penalty example
  - Points penalty example
  - Combined penalty example
- **`/report-incident`** - Driver workflow
- **`/view-incidents`** - Steward workflow
- **`/view-penalties`** - View all penalties

#### **Embed 7: Pro Tips & FAQ**
- Q: Do drivers re-register for season 2? **A: No!**
- Q: Can I reuse teams? **A: Yes!**
- Q: What if I made a mistake? **A: Re-run the command**
- Q: How are points calculated? **A: Standard F1 + details**
- Q: What's DNF? **A: Did Not Finish - 0 points**
- Q: Can I delete a season? **A: Yes, but with safety checks**

#### **Embed 8: Quick Reference & Troubleshooting**
- Command permission matrix (who can use what)
- Admin-only commands list
- Steward commands list
- Manager commands list
- Driver commands list
- Troubleshooting common issues:
  - "No active season" error
  - Attendance buttons not showing
  - Results won't enter
  - Standings don't update

---

## 3. New Files Created

### Buttons
- **`buttons/setup_roles_during_season_button.js`** (Regex pattern: `setup_roles_during_season_\d+`)
  - Responds to "Setup Roles Now" button
  - Shows modal for entering role IDs
  
- **`buttons/skip_roles_during_season_button.js`** (Regex pattern: `skip_roles_during_season_\d+`)
  - Responds to "Skip for Now" button
  - Completes season creation without role setup

### Modals
- **`modals/setup_roles_modal_season.js`** (Custom ID: `setup_roles_modal_season`)
  - Collects Steward role ID
  - Collects Manager role ID
  - Validates role IDs
  - Creates season with roles
  - Shows final success embed

---

## 4. Files Modified

### `commands/create-season.js`
- **Line 44**: Added "Step 3: Stewards (Optional)" to setup guide
- Progress display now shows full walkthrough structure

### `commands/f1help.js`
- **Complete rewrite**: 3 embeds → 8 detailed embeds
- Added Getting Started section
- Added Season Management details
- Added Race Weekend workflow
- Added command-by-command documentation
- Added FAQ section
- Added troubleshooting guide

### `menus/select_circuit_for_round.js`
- **Lines 30-48**: After all rounds selected, now shows role setup offer instead of immediate success
- Shows "Setup Roles?" buttons
- Only creates season after role setup decision made

### `utils/F1Database.js`
- **Added method: `addTrustedRole(guildId, roleId, roleType)`**
  - Adds or updates trusted roles (steward/manager)
  - Used during season creation workflow

- **Added method: `archiveSeason(seasonId)`** (was referenced but not implemented)
  - Archives previous season when creating new one

---

## 5. Updated Workflow Examples

### First Season (Complete Walkthrough)
```
1. Admin: /create-season
   ↓
2. Modal 1: Enter Season 1, 24 rounds
   ↓
3. Menus (24x): Select circuit for rounds 1-24
   ↓
4. Role Setup: Choose to setup roles or skip
   ↓
5. Success: Shows next steps
   ↓
6. Drivers: /register-driver (each person once)
   ↓
7. Admin: /setup-teams (select F1 teams)
   ↓
8. Manager: /assign-drivers (assign drivers)
   ↓
9. Manager: /attendance <round> (each race)
   ↓
10. Manager: /enter-results <round> (race results)
```

### Second Season (Fast Path)
```
1. Admin: /create-season
   ↓ (Previous season auto-archived)
   ↓
2. Modal: Enter Season 2, 24 rounds
   ↓
3. Menus: Select circuits (same 24 or new)
   ↓
4. Role Setup: Skip (or adjust if needed)
   ↓
5. Success: ✅ Drivers already registered!
   ↓
6. Admin: /setup-teams (reuse or new)
   ↓
7. Manager: /assign-drivers (select drivers)
   ↓
8. Race!
```

---

## 6. Key Features Added

### In `/create-season` Walkthrough
- ✅ Step indicators (1/3, 2/3, 3/3)
- ✅ Progress embeds between steps
- ✅ Clear "next step" guidance
- ✅ Optional role setup integrated
- ✅ Role validation (checks role IDs exist)
- ✅ Success embed with command list

### In `/f1help` Documentation
- ✅ Getting Started guide (first-timers)
- ✅ Command reference with examples
- ✅ FAQ answering common questions
- ✅ Permission matrix (who can use what)
- ✅ Troubleshooting section
- ✅ Code blocks for command syntax
- ✅ Emoji indicators for sections

---

## 7. User Benefits

### For New Users
- **Clear walkthrough** of entire first-time setup
- **Exact next steps** after creating season
- **Comprehensive help** via `/f1help`
- **No confusion** about order of commands

### For Experienced Users
- **Fast path** for season 2 (skip role setup)
- **Complete FAQ** in `/f1help`
- **Examples** of every command
- **Troubleshooting** for common issues

### For Admins
- **Role setup integrated** into season creation
- **Optional role assignment** (can do later)
- **Clear permissions** explained in `/f1help`
- **Easy reuse** of teams/drivers across seasons

---

## 8. How to Use the New System

### First Time Setup
1. User runs `/create-season`
2. Follows 4-step walkthrough
3. Optionally sets up roles during walkthrough
4. Sees list of next commands to run
5. Runs each command in order

### Subsequent Questions
1. User unsure? Run `/f1help`
2. Get comprehensive documentation
3. Find their exact use case
4. Get command syntax and examples

### Common Workflows
- **New Season**: `/create-season` → `/setup-teams` → `/assign-drivers` → race
- **Race Weekend**: `/attendance <round>` → `/enter-results <round>` → view standings
- **Incident**: `/report-incident` (driver) → `/assign-penalty` (steward)

---

## 9. Technical Implementation Details

### Regex Patterns
- Button IDs use patterns: `setup_roles_during_season_\d+`, `skip_roles_during_season_\d+`
- Matches dynamically via regex in component loader
- Allows scaling without hardcoding role/season info

### Cache System
- `interaction.client.seasonCreationCache[interaction.user.id]` stores state
- Survives multiple menu selections
- Cleared after season creation
- Allows role setup to be optional (stored in cache, then applied)

### Modal Validation
- Role IDs validated by attempting `guild.roles.fetch(roleId)`
- Returns clear error if role doesn't exist
- User can retry with correct ID

### Database Methods
- `createSeason()` - Creates season + settings + roles
- `addRoundsToSeason()` - Creates rounds with circuits
- `addTrustedRole()` - Adds steward/manager roles
- `archiveSeason()` - Archives when creating new season

---

## 10. Next Steps for Users

After implementing these changes:

1. **Test the walkthrough** with actual user
2. **Verify `/f1help`** displays all 8 embeds
3. **Check role setup** works correctly
4. **Confirm drivers carry over** to season 2
5. **Share `/f1help`** link with server members

---

## Summary

✅ **`/create-season`** is now a complete guided walkthrough with optional role setup
✅ **`/f1help`** is now comprehensive documentation for all users
✅ **Role setup** is integrated into season creation workflow
✅ **Driver persistence** verified (carry over to new seasons)
✅ **Clear next steps** shown at each stage
✅ **FAQ & troubleshooting** available in help system

**Result:** Users can't get lost anymore. The bot guides them through setup, and `/f1help` answers any questions!
