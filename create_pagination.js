const http = require('http');
const { Client } = require('pg');

const port = 3000;

const dbConfig = {
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost', // Replace with your PostgreSQL host
    database: 'postgres', // Replace with your PostgreSQL database name
    password: 'SQL123', // Replace with your PostgreSQL password
    port: 5432, // Replace with your PostgreSQL port
};

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS student (
    studId SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    dateofbirth DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    feepaid NUMERIC NOT NULL,
    grade CHAR(1) NOT NULL,
    marks NUMERIC NOT NULL
  )
`;

// Function to create the "student" table if it doesn't exist
async function createTableIfNotExists() {
  try {
    const client = new Client(dbConfig);
    await client.connect();

    await client.query(createTableQuery);

    await client.end();

    console.log('Table "student" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTableIfNotExists();

const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow requests from any origin (Replace * with your desired origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET' && req.url.startsWith('/api/students')) {
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(urlParams.searchParams.get('page') || 1, 10);
    const limit = parseInt(urlParams.searchParams.get('limit') || 10, 10);

    try {
      const client = new Client(dbConfig);
      await client.connect();

      const offset = (page - 1) * limit;

      const query = 'SELECT * FROM student ORDER BY studId LIMIT $1 OFFSET $2';
      const result = await client.query(query, [limit, offset]);

      await client.end();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (error) {
      console.error('Error fetching data:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
