# F1 Bot - Complete League Management System

A comprehensive Discord bot for automating F1 seasons for esports leagues and servers. Fully manages drivers, teams, results, standings, penalties, and incident reports.

---

## 🚀 Features

### Season Management
- **Create Seasons** - Set up new F1 seasons with custom round counts
- **Track Circuits** - Select specific tracks for each round
- **Season Dashboard** - View active season information and schedule

### Team & Driver Management
- **Assign Drivers to Teams** - Manage team rosters for each season
- **Reserve Drivers** - Add and manage reserve drivers
- **Trusted Roles** - Setup stewards and managers with specific permissions

### Race Operations
- **Attendance Tracking** - Track which drivers are attending/absent/reserves
- **Race Results Entry** - Input race positions and automatically calculate points
- **Fastest Lap** - Award fastest lap points
- **DNF Tracking** - Mark drivers as DNF (Did Not Finish)

### Standings Management
- **Driver Standings** - Real-time driver championship standings
  - Points, Wins, Podiums, DNF tracking
  - Auto-updated after each race and penalty
- **Constructor Standings** - Team championship standings
  - Combined team points from all drivers
  - Wins tracking

### Penalty System
- **Assign Penalties** - Stewards assign penalties (time/points)
- **Auto-Update Standings** - Standings automatically recalculate when penalties applied
- **Penalty Appeals** - Drivers can appeal penalties
- **Penalty Removal** - Managers can overturn penalties

### Incident & Steward Management
- **Incident Reporting** - Drivers submit detailed incident reports
  - Full description and context
  - Evidence links (YouTube timestamps, screenshots)
  - Involved driver tracking
- **Steward Dashboard** - Review open incidents
- **Decision Making** - Close incidents with steward decisions
- **Automatic Penalty Generation** - Convert incident decisions into penalties

### Points System
- **Standard F1 Points** - Default F1 2026 points (25, 18, 15, 12, 10, 8, 6, 4, 2, 1)
- **Custom Points** - Customize points per guild
- **Fastest Lap Points** - Configurable fastest lap points

---

## 📋 Command Reference

### Core Commands
| Command | Description | Permission |
|---------|-------------|-----------|
| `/create-season` | Create a new F1 season | Guild Administrator |
| `/season-info` | View current season details | Everyone |
| `/driver-standings` | View driver championship | Everyone |
| `/constructor-standings` | View team championship | Everyone |

### Team & Driver Management
| Command | Description | Permission |
|---------|-------------|-----------|
| `/assign-drivers` | Assign drivers to teams | Guild Administrator |
| `/add-reserve` | Add reserve drivers | Guild Administrator |
| `/driver-list` | View all drivers and teams | Everyone |

### Race Operations
| Command | Description | Permission |
|---------|-------------|-----------|
| `/attendance` | Set driver attendance for a round | Guild Administrator |
| `/attendance-sheet` | View round attendance summary | Everyone |
| `/enter-results` | Enter race results for a round | Guild Administrator |
| `/view-results` | Display race results | Everyone |

### Penalty & Incident Management
| Command | Description | Permission |
|---------|-------------|-----------|
| `/assign-penalty` | Assign penalty to driver (Steward) | Guild Administrator |
| `/view-penalties` | List all penalties | Everyone |
| `/report-incident` | Submit incident/infraction report | Everyone |
| `/view-incidents` | Review incident reports | Guild Administrator |
| `/close-incident` | Close incident with decision | Guild Administrator |

### Configuration
| Command | Description | Permission |
|---------|-------------|-----------|
| `/setup-points` | Configure points system | Guild Administrator |
| `/manage-roles` | Setup steward/manager roles | Guild Administrator |
| `/configure-channels` | Set announcement channels | Guild Administrator |

---

## 🗄️ Database Schema

### Core Tables
- **guilds** - Discord guild/server information
- **seasons** - F1 seasons per guild
- **circuits** - F1 race tracks
- **rounds** - Race schedule (season → rounds → circuits)

### Team & Driver Tables
- **teams** - Guild teams (custom or F1)
- **drivers** - Guild drivers (custom or F1)
- **f1_teams** - Pre-loaded official F1 teams
- **f1_drivers** - Pre-loaded official F1 drivers
- **team_drivers** - Driver assignments to teams per season
- **trusted_roles** - Steward and manager role assignments

### Season Operations
- **attendance** - Driver attendance per round
- **race_results** - Race results per driver
- **driver_standings** - Driver championship points
- **constructor_standings** - Team championship points

### Penalties & Incidents
- **penalties** - Assigned penalties (time/points)
- **incident_reports** - Driver incident reports
- **penalty_appeals** - Appeals against penalties

### Configuration
- **settings** - Guild settings and channel IDs
- **season_settings** - Points system configuration per season

---

## 🔧 Setup Instructions

### 1. Database Setup
Run the schema migration:
```sql
-- Execute the file: Schemas/F1_Schema.sql
```

This creates all necessary tables with proper indexes and relationships.

### 2. Pre-loaded Data (Optional)
Add standard F1 teams and drivers to `f1_teams` and `f1_drivers` tables for easy selection.

Example:
```sql
INSERT INTO f1_teams (name, country) VALUES 
('Red Bull Racing', 'Austria'),
('Mercedes-AMG Petronas', 'Germany'),
('McLaren Formula 1', 'UK');

INSERT INTO f1_drivers (first_name, last_name, number) VALUES
('Max', 'Verstappen', 1),
('Lewis', 'Hamilton', 44),
('Lando', 'Norris', 81);
```

### 3. Bot Configuration
Ensure config.json contains:
```json
{
    "TOKEN": "your_bot_token",
    "MySQL": {
        "host": "localhost",
        "user": "username",
        "password": "password",
        "database": "f1_bot_db"
    }
}
```

### 4. Bot Permissions
The bot requires these Discord permissions:
- `ADMINISTRATOR` - To manage roles and channels
- `SEND_MESSAGES` - Send messages in channels
- `EMBED_LINKS` - Send embeds
- `CREATE_INSTANT_INVITE` - Create invites (optional)

---

## 📊 Workflow Examples

### Creating a Season
1. Guild manager runs `/create-season`
2. Enter season number (e.g., 2024) and total rounds (e.g., 24)
3. Select trusted steward roles
4. Select circuit for each round sequentially
5. Season is created with all rounds scheduled

### Running a Race
1. Drivers set their attendance using `/attendance`
2. After race completion, manager runs `/enter-results`
3. Manager selects each driver and their finishing position
4. System auto-calculates points based on positions
5. If penalties needed, stewards use `/assign-penalty`
6. Standings automatically update

### Handling Incidents
1. Driver submits `/report-incident` with details
2. Includes incident description, context, and evidence
3. Stewards review with `/view-incidents`
4. Stewards can close incident with decision
5. Decision can automatically generate penalties
6. Standings update to reflect penalties

---

## 🎯 Points System Details

### Standard F1 Points (Default)
```
1st:  25 pts
2nd:  18 pts
3rd:  15 pts
4th:  12 pts
5th:  10 pts
6th:   8 pts
7th:   6 pts
8th:   4 pts
9th:   2 pts
10th: 1 pt
```

### Fastest Lap
- 1 point (configurable)
- Only awarded if driver finishes in top 10

### Customization
Use `/setup-points` to customize:
- Custom points distribution
- Fastest lap points
- DNF handling
- Penalty point values

---

## 🔐 Permission Levels

### Guild Administrator
- Create/manage seasons
- Assign drivers and teams
- Enter race results
- Manage attendance
- Assign penalties
- Configure bot settings

### Stewards (Role-based)
- Assign penalties
- Review and close incidents
- View all standings

### Regular Members
- View standings
- View results
- Report incidents
- Check attendance

---

## 🐛 Troubleshooting

### Season Creation Issues
- **"No active season"** - Run `/create-season` first
- **"Circuits not found"** - Ensure circuits are added to database
- **"Role not found"** - Ensure steward role IDs are correct Discord IDs

### Results Entry Problems
- **Driver not found** - Ensure driver names exactly match database
- **Duplicate positions** - Each position can only be assigned once per race

### Penalty Issues
- **Standings not updating** - Penalties auto-update, but may take a few seconds
- **Can't assign penalty** - Ensure you have steward role
- **Appeal stuck** - Only managers can approve/deny appeals

---

## 📈 Advanced Features

### Multi-Season Tracking
- Run multiple seasons simultaneously
- Archive completed seasons
- Compare season statistics

### Custom Regulations
- Configure points per season
- Set custom penalty values
- Define incident categories

### Reporting
- Driver performance tracking
- Team statistics
- Incident history
- Penalty log

---

## 🤝 Support

For issues or feature requests, contact the bot developer.

---

## 📝 Changelog

### v1.0.0
- Initial release
- Core season management
- Driver/team assignments
- Race results and standings
- Penalty system
- Incident reporting
- Custom points configuration

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
