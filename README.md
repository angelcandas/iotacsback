# iotacsback

REST API for [IoTACS](https://github.com/angelcandas/iotacs), an IoT device dashboard I built in 2018. Archived portfolio project.

- Node + Express, PostgreSQL through Knex
- Sign up / sign in with bcrypt-hashed passwords and JWT-protected routes
- Device tokens: create, list and delete per user
- Stores readings published by devices and serves history and latest value (`/shadow/:token`) to the dashboard
- `/auth` and `/apub` endpoints let the [MQTT broker](https://github.com/angelcandas/iotacsmqtt) check publishers before accepting data

See the [iotacs README](https://github.com/angelcandas/iotacs#how-it-works) for how the pieces fit together.
