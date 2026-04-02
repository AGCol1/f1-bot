# F1 Bot - Quick Reference Card

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Execute database schema
mysql < Schemas/F1_Schema.sql

# 2. Initialize F1 data (teams, drivers, circuits)
node utils/InitializeF1Data.js

# 3. Verify everything works
node utils/VerifySetup.js

# 4. Start the bot
node index.js
```

---

## 📋 Command Quick Reference

| Command | Use | Who |
|---------|-----|-----|
| `/create-season` | Setup new season | Admin |
| `/season-info` | View season details | Everyone |
| `/assign-drivers` | Add drivers to teams | Admin |
| `/driver-list` | View driver rosters | Everyone |
| `/attendance` | Set who's racing | Admin |
| `/enter-results` | Input race results | Admin |
| `/driver-standings` | See driver points | Everyone |
| `/constructor-standings` | See team points | Everyone |
| `/assign-penalty` | Give penalty | Steward |
| `/view-penalties` | See all penalties | Everyone |
| `/report-incident` | File complaint | Everyone |
| `/view-incidents` | Review complaints | Steward |
| `/manage-roles` | Setup steward roles | Admin |
| `/configure-channels` | Setup channel IDs | Admin |
| `/setup-points` | Configure points system | Admin |
| `/f1help` | Show all commands | Everyone |

---

## 🎯 Standard F1 Points

```
1st:  25pts
2nd:  18pts
3rd:  15pts
4th:  12pts
5th:  10pts
6th:   8pts
7th:   6pts
8th:   4pts
9th:   2pts
10th: 1pt

Fastest Lap: +1pt (top 10 finish)
DNF: 0pts
```

---

## 🏁 Running a Race Weekend

### Before Race
```
/attendance <round>
```

### After Race
```
/enter-results <round>
```

### Penalties (if needed)
```
/assign-penalty
```

### View Results
```
/view-results <round>
/driver-standings
/constructor-standings
```

---

## 🗄️ Database Tables (Quick View)

### Season Data
- guilds, seasons, rounds, circuits

### Team/Driver
- teams, drivers, f1_teams, f1_drivers, team_drivers

### Race Results
- attendance, race_results, race_results_penalties

### Standings
- driver_standings, constructor_standings

### Incidents
- incident_reports, penalties

### Settings
- settings, season_settings, trusted_roles

---

## 🔑 Key Concepts

### Guild
A Discord server running the bot. Each guild has isolated data.

### Season
One F1 season for a guild with fixed number of rounds.

### Round
A race event on a specific circuit.

### Team Driver
Assignment of driver to team for a specific season.

### Attendance
Whether a driver is racing, absent, reserve, or retired for a round.

### Penalty
Time or points penalty assigned by stewards, auto-updates standings.

### Incident
Driver report of rule violation or incident, reviewed by stewards.

---

## ⚙️ Configuration

### Setup Checklist
- [ ] Run `/create-season`
- [ ] Run `/manage-roles` - set steward roles
- [ ] Run `/configure-channels` - set announcement channels
- [ ] Add teams to database
- [ ] Add drivers to database
- [ ] Run `/assign-drivers` - assign drivers to teams
- [ ] Run `/setup-points` - configure points

### After Each Race
- [ ] Run `/attendance` - verify who's racing
- [ ] Run `/enter-results` - input finishing positions
- [ ] Review `/view-incidents` if any filed
- [ ] Run `/assign-penalty` if stewards need to add penalties
- [ ] Check `/driver-standings` - verify calculations

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "No active season" | Run `/create-season` first |
| Driver not found | Ensure exact name matches database |
| Results not updating | Wait a moment, check database connection |
| Standings not calculating | Verify drivers assigned to teams |
| Bot won't respond | Check admin permissions, restart bot |
| Database error | Check config.json credentials |

---

## 📊 Useful SQL Queries

### View All Drivers in Guild
```sql
SELECT * FROM drivers WHERE guild_id = GUILD_ID;
```

### View Current Season
```sql
SELECT * FROM seasons WHERE guild_id = GUILD_ID AND is_active = TRUE;
```

### View Driver Standings
```sql
SELECT * FROM driver_standings WHERE season_id = SEASON_ID ORDER BY points DESC;
```

### View All Penalties
```sql
SELECT * FROM penalties WHERE status = 'active';
```

### View Incident Reports
```sql
SELECT * FROM incident_reports WHERE status = 'open' ORDER BY created_at DESC;
```

---

## 🎮 User Roles & Permissions

### Guild Admin
- `/create-season`
- `/manage-roles`
- `/configure-channels`
- `/assign-drivers`
- `/attendance`
- `/enter-results`
- `/assign-penalty`

### Steward
- `/assign-penalty`
- `/view-incidents`
- View all standings

### Regular Member
- `/driver-standings`
- `/constructor-standings`
- `/view-results`
- `/report-incident`

---

## 📈 Best Practices

1. **Always** run `/create-season` first
2. **Always** ensure drivers are assigned to teams before races
3. **Double-check** driver names when entering results
4. **Use exact** names in database (case-sensitive)
5. **Backup** your database regularly
6. **Review** incidents promptly
7. **Document** penalty reasons clearly
8. **Update** standings after penalties

---

## 🆘 Support Files

- `F1_BOT_README.md` - Full feature documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `Schemas/F1_Schema.sql` - Database schema
- `utils/VerifySetup.js` - Check system health

---

## ✨ Quick Tips

✅ **Tip 1:** Use `/f1help` to see all commands anytime
✅ **Tip 2:** Standings auto-update when you enter results
✅ **Tip 3:** Penalties auto-deduct points from standings
✅ **Tip 4:** Fastest lap points add to total
✅ **Tip 5:** DNF drivers get 0 points but are tracked
✅ **Tip 6:** Use channels to announce results automatically
✅ **Tip 7:** Archive old seasons to keep data clean

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2024

---

**Questions?** Check the full guides or review the README files!
