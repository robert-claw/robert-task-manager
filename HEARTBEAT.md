# HEARTBEAT.md

## Task Notifications Check
Check for unread notifications from the task manager:
```
curl -s http://localhost:3030/api/notifications?unread=true
```
If there are unread notifications, alert Leon via the current session.
