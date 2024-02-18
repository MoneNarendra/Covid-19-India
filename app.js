const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'covid19India.db')

let db = null

const initilazeDBAndResponse = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server Running... https://narendrakumar3sdyxnjscpaqlbe.drops.nxtwave.tech/states/',
      )
    })
  } catch (e) {
    console.log(`Error Msg: ${e.message}`)
    process.exit(1)
  }
}

initilazeDBAndResponse()

// GET status

app.get('/states/', async (request, response) => {
  const getStatesQuary = `
  SELECT 
    state_id as stateId, 
    state_name as stateName,
    population
  FROM 
    state`

  const dbResponse = await db.all(getStatesQuary)
  response.send(dbResponse)
})

// GET state

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateQuary = `
  SELECT 
    * 
  FROM 
    state
  WHERE
    state_id = ${stateId}`

  const ans = dbResponse => {
    return {
      stateId: dbResponse.state_id,
      stateName: dbResponse.state_name,
      population: dbResponse.population,
    }
  }

  const dbResponse = await db.get(getStateQuary)
  response.send(ans(dbResponse))
})

// POST district

app.post('/districts/', async (request, response) => {
  const requestDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = requestDetails
  const addDistrictQuary = `
  INSERT INTO 
    district (district_name, state_id, cases, cured, active, deaths) 
  VALUES 
    ('${districtName}', 
    ${stateId},
    ${cases},
    ${cured},
    ${active}, 
    ${deaths});`
  const dbResponse = await db.run(addDistrictQuary)
  response.send('District Successfully Added')
})

// GET district

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictQuary = `SELECT 
    *
  FROM 
    district
  WHERE 
    district_id = ${districtId}`
  const responseAns = eachResponse => {
    return {
      districtId: eachResponse.district_id,
      districtName: eachResponse.district_name,
      stateId: eachResponse.state_id,
      cases: eachResponse.cases,
      cured: eachResponse.cured,
      active: eachResponse.active,
      deaths: eachResponse.deaths,
    }
  }
  const dbResponse = await db.get(getDistrictQuary)
  response.send(responseAns(dbResponse))
})

// DELETE district

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrictQuary = `DELETE FROM
    district 
  WHERE
    district_id = ${districtId}`
  await db.run(deleteDistrictQuary)
  response.send('District Removed')
})

// PUT district

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const putDistrictQuary = `
  UPDATE 
    district
  SET 
    district_name='${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured =${cured},
    active = ${active},
    deaths =${deaths}
  WHERE
    district_id = ${districtId}`
  await db.run(putDistrictQuary)
  response.send('District Details Updated')
})

// GET total cases, cured, active, deaths

app.get('/states/:stateId/stats/', async (requse, response) => {
  const {stateId} = requse.params
  const getStateDetailQuary = `
  SELECT 
    SUM(cases) as totalCases,
    SUM(cured) as totalCured,
    SUM(active) as totalActive,
    SUM(deaths) as totalDeaths
  FROM 
    district
  WHERE
    state_id = ${stateId};`
  const dbResponse = await db.get(getStateDetailQuary)
  response.send(dbResponse)
})

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getStateNameQuary = `
  SELECT
    state.state_name as stateName
  FROM
    district INNER JOIN state 
  WHERE 
    district.district_id = ${districtId}`
  const dbResponse = await db.get(getStateNameQuary)
  response.send(dbResponse)
})

module.exports = app
