# F1 Bot - Complete Setup Guide

## 🚀 Quick Start

### Step 1: Database Setup

**Option A: Using SQL File**
```bash
# Connect to your MariaDB database
mysql -h localhost -u root -p your_database < Schemas/F1_Schema.sql
```

**Option B: Manual Execution**
```sql
-- Execute the entire F1_Schema.sql file in your database client
-- This creates all necessary tables and indexes
```

### Step 2: Initialize F1 Data (Optional but Recommended)

Pre-populate official F1 teams, drivers, and circuits:

```bash
# From your bot directory
node utils/InitializeF1Data.js
```

This adds:
- ✅ 10 Official F1 Teams
- ✅ 20 Official F1 Drivers
- ✅ 22 Official F1 Circuits

### Step 3: Bot Configuration

Ensure `config.json` contains correct database credentials:

```json
{
    "TOKEN": "YOUR_BOT_TOKEN",
    "MySQL": {
        "host": "localhost",
        "user": "root",
        "password": "your_password",
        "database": "f1_bot_db"
    }
}
```

### Step 4: Bot Permissions

Add these permissions to your bot role:
- ✅ Administrator (or specific permissions below)
- ✅ Send Messages
- ✅ Embed Links
- ✅ Manage Roles
- ✅ Manage Channels

### Step 5: Start the Bot

```bash
node index.js
```

---

## 📋 First-Time Setup Workflow

### 1. Create Your Season

```
/create-season
```

Fill in:
- **Season Number**: 2024
- **Total Rounds**: 24
- Select circuits for each round sequentially
- Choose steward roles (optional)

### 2. Configure Your Guild

```
/manage-roles
```
- Set Steward Role ID
- Set Manager Role ID
- Set Admin Role ID

```
/configure-channels
```
- Set Results Channel
- Set Incidents Channel
- Set Standings Channel

### 3. Create Teams (Manual Insert or via Commands)

Add teams to your database:
```sql
INSERT INTO teams (guild_id, name, is_f1_team, f1_team_id) VALUES
(YOUR_GUILD_ID, 'Red Bull Racing', TRUE, 1),
(YOUR_GUILD_ID, 'Mercedes-AMG Petronas', TRUE, 2);
```

Or create custom teams as needed.

### 4. Create Drivers (Manual Insert or via Commands)

Add drivers to your database:
```sql
INSERT INTO drivers (guild_id, user_id, name, is_f1_driver, f1_driver_id) VALUES
(YOUR_GUILD_ID, 123456789, 'Max Verstappen', TRUE, 1),
(YOUR_GUILD_ID, NULL, 'Custom Driver', FALSE, NULL);
```

### 5. Assign Drivers to Teams

```
/assign-drivers
```

- Select a team
- Select drivers to assign
- Repeat for each team

### 6. Configure Points System

```
/setup-points
```

- Standard F1: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1
- Custom: Configure custom points

---

## 🎮 Running a Race Weekend

### Before the Race

1. **Set Attendance**
   ```
   /attendance <round_number>
   ```
   - Mark drivers as Attending, Absent, Reserve, or Retired

2. **View Attendance**
   ```
   /attendance-sheet <round_number>
   ```

### After the Race

1. **Enter Results**
   ```
   /enter-results <round_number>
   ```
   - Input each driver's finishing position
   - System auto-calculates points

2. **Assign Penalties (If Needed)**
   ```
   /assign-penalty
   ```
   - Specify driver and penalty reason
   - Points/time penalties
   - Standings auto-update

3. **Handle Incidents**
   ```
   /view-incidents
   ```
   - Review incident reports
   - Make steward decisions
   - Can assign penalties if needed

### Check Standings

```
/driver-standings
/constructor-standings
```

---

## 📊 Database Queries Reference

### View All Teams in Guild
```sql
SELECT * FROM teams WHERE guild_id = YOUR_GUILD_ID;
```

### View All Drivers
```sql
SELECT * FROM drivers WHERE guild_id = YOUR_GUILD_ID;
```

### View Current Season
```sql
SELECT * FROM seasons WHERE guild_id = YOUR_GUILD_ID AND is_active = TRUE;
```

### View Race Results
```sql
SELECT r.*, d.name, t.name as team_name FROM race_results r
JOIN drivers d ON r.driver_id = d.driver_id
LEFT JOIN team_drivers td ON r.round_id = (SELECT round_id FROM rounds WHERE season_id = ...)
WHERE r.round_id = ROUND_ID;
```

### View Driver Points
```sql
SELECT ds.*, d.name FROM driver_standings ds
JOIN drivers d ON ds.driver_id = d.driver_id
WHERE ds.season_id = SEASON_ID
ORDER BY ds.points DESC;
```

---

## 🔧 Troubleshooting

### Bot Not Responding to Commands
- ✅ Check bot has Administrator permission
- ✅ Verify bot token is correct in config.json
- ✅ Restart bot: `node index.js`

### "No active season found"
- ✅ Run `/create-season` first
- ✅ Check season is marked `is_active = TRUE` in database

### Drivers Not Found When Entering Results
- ✅ Ensure driver names match EXACTLY in database
- ✅ Use `/driver-list` to verify names

### Standings Not Updating
- ✅ Check all drivers are assigned to teams
- ✅ Verify penalties are active (status = 'active')
- ✅ Wait a moment for database to update

### Database Connection Error
- ✅ Verify database credentials in config.json
- ✅ Ensure MariaDB is running
- ✅ Check firewall/network connectivity

### Permission Errors
- ✅ Add required roles to the user in Discord
- ✅ Verify bot has Admin permissions
- ✅ Check user is part of the guild

---

## 📈 Advanced Configuration

### Custom Points System

```sql
UPDATE season_settings 
SET points_system = 'custom',
    custom_points_json = JSON_OBJECT(
        '1', 25, '2', 18, '3', 15, '4', 12, '5', 10,
        '6', 8, '7', 6, '8', 4, '9', 2, '10', 1
    )
WHERE season_id = SEASON_ID;
```

### Fastest Lap Points
```sql
UPDATE season_settings 
SET fastest_lap_points = 2  -- Default is 1
WHERE season_id = SEASON_ID;
```

### DNF Handling
Drivers marked as DNF:
- ❌ Receive 0 points
- ✅ Counted in DNF statistics
- ✅ Not counted as DNF for penalties

---

## 🎯 Common Workflows

### Workflow 1: Setting Up Complete Season
1. `/create-season` → Create season and select tracks
2. `/manage-roles` → Setup stewards
3. Add teams to database
4. Add drivers to database
5. `/assign-drivers` → Assign drivers to teams
6. `/setup-points` → Configure points

### Workflow 2: Running Race Weekend
1. `/attendance` → Set attendance
2. Race happens...
3. `/enter-results` → Input results
4. `/assign-penalty` → If penalties needed
5. `/driver-standings` → Check standings

### Workflow 3: Handling Incidents
1. Drivers submit `/report-incident`
2. `/view-incidents` → Review reports
3. Make decision and close incident
4. `/assign-penalty` → Assign penalty if needed
5. Standings auto-update

---

## 📞 Support

For issues or questions:
1. Check F1_BOT_README.md for feature documentation
2. Review this setup guide for configuration help
3. Check database schema for table structure
4. Contact bot developer for bugs

---

**Setup Complete!** 🎉

Your F1 Bot is ready to manage your esports league!

**Key Reminders:**
- ⚠️ Always run `/create-season` before other commands
- ⚠️ Ensure teams and drivers are added before races
- ⚠️ Double-check driver names when entering results
- ⚠️ Backup your database regularly

**Have Fun!** 🏎️💨
