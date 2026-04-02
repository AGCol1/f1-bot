# F1 Bot - Complete Documentation Index

Welcome to the F1 Bot system! This document will guide you to the right resources.

---

## 🚀 First Time Here?

### Start Here (in order):
1. **Read:** `QUICK_REFERENCE.md` (5 min read)
2. **Follow:** `SETUP_GUIDE.md` (15 min setup)
3. **Verify:** Run `node utils/VerifySetup.js`
4. **Start:** Run `node index.js`

---

## 📚 Documentation Files

### 🟢 Quick Reference (QUICK_REFERENCE.md)
**Best for:** Quick lookups, command reference, troubleshooting
- Command cheat sheet
- Quick setup (5 minutes)
- Common issues & fixes
- Useful SQL queries
- Best practices

### 🟡 Setup Guide (SETUP_GUIDE.md)
**Best for:** Complete setup, detailed instructions, workflows
- Step-by-step database setup
- First-time configuration
- Running race weekends
- Advanced configuration
- Common workflows

### 🔵 Feature Guide (F1_BOT_README.md)
**Best for:** Understanding features, permissions, advanced usage
- Complete feature list
- All commands with descriptions
- Database schema explanation
- Permission levels
- Troubleshooting deep-dive

### 🟣 Implementation Summary (IMPLEMENTATION_SUMMARY.md)
**Best for:** Understanding what was built
- File structure overview
- Component descriptions
- Key features
- Database design highlights
- Scalability notes

---

## 🗄️ Database Files

### Schema Files (in Schemas/ folder)

#### `F1_Schema.sql` (PRIMARY)
The main database schema - contains ALL table definitions.
```bash
mysql < Schemas/F1_Schema.sql
```

#### `F1_Migration.sql`
Optional: Data initialization script.
Contains INSERT statements for F1 teams/drivers/circuits.

---

## 🔧 Utility Files (in utils/ folder)

### `DatabasePool.js`
- Database connection management
- Connection pooling
- Used by all commands

### `F1Database.js` (CORE)
- Main database abstraction layer
- 50+ methods for all operations
- Handles standings calculation
- Manages transactions

### `InitializeF1Data.js`
Initializes pre-loaded data:
```bash
node utils/InitializeF1Data.js
```

### `VerifySetup.js`
Checks system health:
```bash
node utils/VerifySetup.js
```

---

## 📋 Command Files (in commands/ folder)

### Season Management (2 files)
- `create-season.js` - Create new season
- `season-info.js` - View season details

### Standings (2 files)
- `driver-standings.js` - Driver championship
- `constructor-standings.js` - Team championship

### Team/Driver (2 files)
- `assign-drivers.js` - Assign drivers to teams
- `driver-list.js` - View driver rosters

### Race Operations (4 files)
- `attendance.js` - Set driver attendance
- `attendance-sheet.js` - View attendance summary
- `enter-results.js` - Input race results
- `view-results.js` - Display race results

### Penalties (2 files)
- `assign-penalty.js` - Assign penalty
- `view-penalties.js` - View penalties

### Incidents (1 file)
- `report-incident.js` - File incident report
- `view-incidents.js` - Review incidents

### Configuration (3 files)
- `manage-roles.js` - Setup roles
- `configure-channels.js` - Setup channels
- `setup-points.js` - Configure points

### Help (1 file)
- `f1help.js` - Show all commands

---

## 🎯 Modal Files (in modals/ folder)

### Season Creation (2)
- `create_season_modal.js`
- `season_steward_roles_modal.js`

### Results & Penalties (2)
- `enter_result_modal.js`
- `assign_penalty_modal.js`

### Incidents (1)
- `report_incident_modal.js`

### Configuration (2)
- `manage_roles_modal.js`
- `configure_channels_modal.js`

---

## 🎮 Menu Files (in menus/ folder)

### Circuit Selection (1)
- `select_circuit_for_round.js`

### Attendance (2)
- `attendance_select.js`
- `attendance_status.js`

### Driver Assignment (2)
- `assign_driver_team_select.js`
- `assign_driver_confirm.js`

### Points System (1)
- `select_points_system.js`

---

## 📊 Database Schema (Quick Overview)

### 18 Tables Total:

**Core (4):** guilds, seasons, circuits, rounds
**Teams/Drivers (6):** teams, drivers, f1_teams, f1_drivers, team_drivers, trusted_roles
**Operations (6):** attendance, race_results, driver_standings, constructor_standings, penalties, incident_reports
**Configuration (3):** settings, season_settings, penalty_appeals

---

## 🎯 Common Tasks

### "I want to start a new season"
→ Read: `SETUP_GUIDE.md` → First-Time Setup Workflow
→ Run: `/create-season`

### "How do I run a race weekend?"
→ Read: `SETUP_GUIDE.md` → Running a Race Weekend
→ Use: `/attendance` → `/enter-results` → `/view-results`

### "I need to assign a penalty"
→ Read: `F1_BOT_README.md` → Penalty System
→ Run: `/assign-penalty`

### "I want to understand how the database works"
→ Read: `IMPLEMENTATION_SUMMARY.md` → Database Schema Overview
→ View: `Schemas/F1_Schema.sql`

### "My setup isn't working"
→ Run: `node utils/VerifySetup.js`
→ Read: `QUICK_REFERENCE.md` → Common Issues & Fixes
→ Check: `SETUP_GUIDE.md` → Troubleshooting

---

## ⚡ Quick Commands

```bash
# Setup
mysql < Schemas/F1_Schema.sql
node utils/InitializeF1Data.js
node utils/VerifySetup.js

# Run
node index.js

# In Discord
/create-season
/f1help
```

---

## 📈 File Map

```
f1-bot/
├── Schemas/
│   ├── F1_Schema.sql (DATABASE SCHEMA)
│   └── F1_Migration.sql (DATA INITIALIZATION)
│
├── utils/
│   ├── DatabasePool.js (CONNECTION MANAGEMENT)
│   ├── F1Database.js (DATABASE OPERATIONS - 50+ methods)
│   ├── InitializeF1Data.js (SETUP DATA)
│   └── VerifySetup.js (HEALTH CHECK)
│
├── commands/ (20+ commands)
│   ├── create-season.js
│   ├── season-info.js
│   ├── driver-standings.js
│   ├── constructor-standings.js
│   ├── assign-drivers.js
│   ├── driver-list.js
│   ├── attendance.js
│   ├── attendance-sheet.js
│   ├── enter-results.js
│   ├── view-results.js
│   ├── assign-penalty.js
│   ├── view-penalties.js
│   ├── report-incident.js
│   ├── view-incidents.js
│   ├── manage-roles.js
│   ├── configure-channels.js
│   ├── setup-points.js
│   └── f1help.js
│
├── modals/ (7 handlers)
│   ├── create_season_modal.js
│   ├── season_steward_roles_modal.js
│   ├── enter_result_modal.js
│   ├── assign_penalty_modal.js
│   ├── report_incident_modal.js
│   ├── manage_roles_modal.js
│   └── configure_channels_modal.js
│
├── menus/ (9 handlers)
│   ├── select_circuit_for_round.js
│   ├── attendance_select.js
│   ├── attendance_status.js
│   ├── assign_driver_team_select.js
│   ├── assign_driver_confirm.js
│   └── select_points_system.js
│
├── QUICK_REFERENCE.md (THIS YOU NOW)
├── SETUP_GUIDE.md (DETAILED SETUP)
├── F1_BOT_README.md (FEATURE GUIDE)
└── IMPLEMENTATION_SUMMARY.md (WHAT WAS BUILT)
```

---

## 🎓 Learning Path

### Beginner (5 minutes)
1. Read `QUICK_REFERENCE.md`
2. Read first section of `SETUP_GUIDE.md`
3. Run `/create-season`

### Intermediate (30 minutes)
1. Read full `SETUP_GUIDE.md`
2. Run full setup workflow
3. Run first race weekend
4. Test all commands

### Advanced (1 hour)
1. Read `F1_BOT_README.md` completely
2. Review `Schemas/F1_Schema.sql`
3. Read `IMPLEMENTATION_SUMMARY.md`
4. Understand database design

### Expert (2 hours)
1. Review all source code
2. Understand F1Database.js methods
3. Modify commands as needed
4. Extend functionality

---

## ✨ What This Bot Does

- ✅ Creates seasons with custom rounds
- ✅ Manages teams and drivers
- ✅ Tracks race attendance
- ✅ Records race results
- ✅ Calculates standings (driver & constructor)
- ✅ Assigns penalties (auto-updates standings)
- ✅ Handles incident reports
- ✅ Configurable points system
- ✅ Role-based access control
- ✅ Multi-server support

---

## 🆘 Need Help?

### For Setup Issues
→ Check `SETUP_GUIDE.md` → Troubleshooting

### For Command Questions
→ Run `/f1help` in Discord

### For Feature Requests
→ Check `F1_BOT_README.md` → Features section

### For Database Questions
→ Review `IMPLEMENTATION_SUMMARY.md` → Database Schema

### For Verification
→ Run `node utils/VerifySetup.js`

---

## 📞 Document Quick Links

| Need | Go To |
|------|-------|
| Quick Commands | `QUICK_REFERENCE.md` |
| Setup Instructions | `SETUP_GUIDE.md` |
| All Features | `F1_BOT_README.md` |
| What Was Built | `IMPLEMENTATION_SUMMARY.md` |
| Database Schema | `Schemas/F1_Schema.sql` |
| Health Check | Run `node utils/VerifySetup.js` |

---

## 🎉 You're All Set!

Your F1 Bot system is fully implemented and documented.

**Next Step:** Follow the setup instructions in `SETUP_GUIDE.md`

**In 15 minutes you'll be running your first F1 season!**

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2024

Happy Racing! 🏎️💨
