// docker/mongo-init.js
const database = process.env.MONGO_APP_DATABASE || 'cafe_db';
const username = process.env.MONGO_APP_USERNAME || 'cafeapp';
const password = process.env.MONGO_APP_PASSWORD || 'cafeapppass';

const db = db.getSiblingDB(database);

// Create user only if it doesn't exist (safe on restarts)
if (db.getUser(username)) {
  print(`MongoDB: user '${username}' already exists.`);
} else {
  db.createUser({
    user: username,
    pwd: password,
    roles: [{ role: 'readWrite', db: database }],
  });
  print('MongoDB: app user created successfully.');
}

db.createCollection('_init');

print(`  Database : ${database}`);
print(`  Username : ${username}`);
print(`  Password : ${'*'.repeat(password.length)}`);