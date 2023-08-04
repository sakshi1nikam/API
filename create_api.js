//Require module
const http = require('http');
const { Client } = require('pg');
const validation = require('./validation');

//Port on which server will run 
const port = 3000;

const dbConfig = {
  user: 'postgres', // PostgreSQL username
  host: 'localhost', // PostgreSQL host
  database: 'postgres', // PostgreSQL database name
  password: 'SQL123', // PostgreSQL password
  port: 5432, // PostgreSQL port
};

//Table Query
const createTableQuery = `
CREATE TABLE IF NOT EXISTS public.student
(
    studid integer NOT NULL DEFAULT nextval('student_studid_seq'::regclass),
    firstname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    dateofbirth date NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default" NOT NULL,
    feepaid numeric NOT NULL,
    grade character(1) COLLATE pg_catalog."default" NOT NULL,
    physics integer NOT NULL DEFAULT 0,
    maths integer NOT NULL DEFAULT 0,
    chemistry integer NOT NULL DEFAULT 0,
    "Total_marks" numeric NOT NULL,
    percentage numeric NOT NULL DEFAULT 0,
    CONSTRAINT student_pkey PRIMARY KEY (studid)
)
`;

//Create server 
const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow requests from any origin 
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


// To fetch all records 
  if (req.method === 'GET' && req.url === '/api/students') {
    
    try {
      const client = new Client(dbConfig);
      await client.connect();

      const query = 'SELECT * FROM student';
      const result = await client.query(query);

      await client.end();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (error) {
      console.error('Error fetching data:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } 

  // Fetch records on query parameters
  else if (req.method === 'GET' && req.url.startsWith('/api/students')) {
  
    const urlParams = new URLSearchParams(req.url.split('?')[1]);

  // Extract pagination parameters
  const page = parseInt(urlParams.get('page')) || 1;
  const limit = parseInt(urlParams.get('limit')) || 10; // Default limit of 10 records per page
  const offset = (page - 1) * limit; // Default offset of 0

  
    if (urlParams.has('id')) {
      // Fetch student by ID
      const studId = parseInt(urlParams.get('id'), 10);
  
      if (Number.isNaN(studId)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid student ID');
        return;
      }
  
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = 'SELECT * FROM student WHERE studId = $1';
        const result = await client.query(query, [studId]);
  
        await client.end();
  
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Student Id record not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows[0]));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else if (urlParams.has('firstname')) {
      // Fetch student by first name
      const firstname = urlParams.get('firstname');

      if(!validation.validateName(firstname))
      {
        res.end('Invalid firstname . Please provide valid values.');
      }
  
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const query = 'SELECT * FROM student WHERE firstname = $1';
        const result = await client.query(query, [firstname]);
  
        await client.end();
  
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No students found with the specified first name');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } 
    else {
      //pagination 
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
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
 }
}
  
    // insert new data
    else if (req.method === 'POST' && req.url === '/api/students') {
    try {
      let requestBody = '';
      req.on('data', (chunk) => {
        requestBody += chunk.toString();
      });

      req.on('end', async () => {
        const studentData = JSON.parse(requestBody);


        //Validation on input values 
        if(!validation.validateName(studentData.firstname) || !validation.validateName(studentData.lastname))
        {
          res.end('Only aplhabets allowed for firstname and lastname');
        }
        //validate email address
        if(!validation.validateEmail(studentData.email))
        {
          res.end('Invalid email address');
        }
        //validate DOB
        if(!validation.isValidDateFormat(studentData.dateofbirth))
        {
          res.end('Invalid Date of Birth');
        }
        //validate grade
        if(!validation.validateGrade(studentData.grade))
        {
          res.end('Invalid Grade');
        }
        //validate feepaid and marks
        if(!validation.validateNumeric(studentData.feepaid) || !validation.validateNumeric(studentData.marks))
        {
          res.end('Invalid value');
        }

        if (!studentData.firstname || !studentData.lastname || !studentData.dateofbirth || !studentData.email || !studentData.address || !studentData.feepaid || !studentData.grade || !studentData.marks) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Please provide values for all the fields (firstname, lastname, dateofbirth, email, address, feepaid, grade, marks)');
          return;
        }

        const client = new Client(dbConfig);
        await client.connect();

        const insertQuery = `
          INSERT INTO student (firstname, lastname, dateofbirth, email, address, feepaid, grade, marks)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING studId
        `;

        const values = [
          studentData.firstname,
          studentData.lastname,
          studentData.dateofbirth,
          studentData.email,
          studentData.address,
          studentData.feepaid,
          studentData.grade,
          studentData.marks,
        ];

        const result = await client.query(insertQuery, values);

        await client.end();

        const insertedStudId = result.rows[0].studId;
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end(`Student added successfully `);
      });
    } catch (error) {
      console.error('Error inserting student:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } 


  //Delete by id and name

  else if (req.method === 'DELETE' && req.url.startsWith('/api/students')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
  
    if (urlParams.has('id')) {
      // Delete student by ID
      const studId = parseInt(urlParams.get('id'), 10);
  
      if (Number.isNaN(studId)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid student ID');
        return;
      }
  
      try {
        const client = new Client(dbConfig);
        await client.connect();
  
        const deleteQuery = 'DELETE FROM student WHERE studId = $1';
        await client.query(deleteQuery, [studId]);
  
        await client.end();
  
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Student deleted successfully');
      }
      catch (error) {
          console.error('Error deleting student:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
    } 
    else if (urlParams.has('firstname')) {
      // DELETE student by first name
      const firstname = urlParams.get('firstname');
  
      try {

        const client = new Client(dbConfig);
        await client.connect();
  
        const deleteQuery = 'DELETE FROM student WHERE firstname = $1';
        const result = await client.query(deleteQuery, [firstname]);
  
        await client.end();
  
        if (result.rowCount === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No students record found with the specified first name');
        }  else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.rows));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid request. Missing query parameters (id or firstname).');
    }
  }
  


  //update by id , firstname

  else if (req.method === 'PUT' && req.url.startsWith('/api/students')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
  
    if (urlParams.has('id')) {
      // Update student by ID
      const studId = parseInt(urlParams.get('id'), 10);
  
      if (Number.isNaN(studId)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid student ID');
        return;
      }
  
      try {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk.toString();
        });
  
        req.on('end', async () => {
          const studentData = JSON.parse(requestBody);
  
          const client = new Client(dbConfig);
          await client.connect();
  
          const updateQuery = `
            UPDATE student 
            SET firstname = $1,
                lastname = $2,
                dateofbirth = $3,
                email = $4,
                address = $5,
                feepaid = $6,
                grade = $7,
                marks = $8
            WHERE studId = $9
          `;
  
          const values = [
            studentData.firstname,
            studentData.lastname,
            studentData.dateofbirth,
            studentData.email,
            studentData.address,
            studentData.feepaid,
            studentData.grade,
            studentData.marks,
            studId,
          ];
  
          await client.query(updateQuery, values);
  
          await client.end();
  
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Student updated successfully');
        });
      } catch (error) {
        console.error('Error updating student:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
    else if (urlParams.has('firstname')) {
      // Update student by first name
      const firstname = urlParams.get('firstname');
  
      try {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk.toString();
        });
  
        req.on('end', async () => {
          const studentData = JSON.parse(requestBody);
  
          const client = new Client(dbConfig);
          await client.connect();
  
          const updateQuery = `
            UPDATE student 
            SET firstname = $1,
                lastname = $2,
                dateofbirth = $3,
                email = $4,
                address = $5,
                feepaid = $6,
                grade = $7,
                marks = $8
            WHERE firstname = $9
          `;
  
          const values = [
            studentData.firstname,
            studentData.lastname,
            studentData.dateofbirth,
            studentData.email,
            studentData.address,
            studentData.feepaid,
            studentData.grade,
            studentData.marks,
            firstname, // Uses the original name to identify the student to be updated
          ];
  
          await client.query(updateQuery, values);
  
          await client.end();
  
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Student(s) updated successfully');
        });
      } catch (error) {
        console.error('Error updating student:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }  else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid request. Missing query parameters (id or firstname).');
    }
  }

else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

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

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
