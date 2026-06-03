const db = require('./backend/src/config/database');

async function migrate() {
  try {
    await db.query('ALTER TABLE sessions ADD COLUMN symptoms JSON NULL;');
    console.log('Migration successful');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
