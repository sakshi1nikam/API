'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  const max_total_marks = 300; // Replace this with the maximum total marks possible (e.g., 300 for 3 subjects with 100 marks each)

  return db.insert(
    { 
      studId: 1,
      firstname: 'John',
      lastname: 'Doe',
      dateofbirth: '2000-01-01',
      email: 'john.doe@example.com',
      address: '123 Main St',
      feepaid: 1000,
      grade: 'A',
      physics: 90,
      maths: 95,
      chemistry: 85,
      Total_marks: (90 + 95 + 85),
      percentage: ((90 + 95 + 85) / max_total_marks) * 100,
    }
  ).into('student').then(
    db.insert(
      { 
        studId: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        dateofbirth: '1999-12-15',
        email: 'jane.smith@example.com',
        address: '456 Maple Ave',
        feepaid: 800,
        grade: 'B',
        physics: 85,
        maths: 80,
        chemistry: 75,
        Total_marks: (85 + 80 + 75),
        percentage: ((85 + 80 + 75) / max_total_marks) * 100,
      }
    ).into('student')
  );
};


exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
