const {Client} = require("pg")

const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    database: 'postgres',
    user: 'postgres.citiifuiprmpkxayffse',
    password: 'Pranay@8118',
    port: 6543
})

module.exports = client