const {Client} = require("pg")

const client = new Client({
    host: 'db.citiifuiprmpkxayffse.supabase.co',
    database: 'postgres',
    user: 'postgres',
    password: 'Pranay@8118',
    port: 5432
})

module.exports = client