import pg from "pg";

const client = new pg.Client("get your own db url from postgresql");
await client.connect();
console.log("Connected to DB");
async function getClient(){
    await createTables();
    console.log("Created Tables");
    return client;
}


async function createTables(){
    await client.query(`
        CREATE TABLE IF NOT EXISTS tutor(
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS student(
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS class(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            book_ref TEXT,
            prereqs TEXT,
            tutor_id INTEGER REFERENCES tutor(id) ON DELETE CASCADE
        );
    `);
    await client.query(`
    CREATE TABLE IF NOT EXISTS class_student(
        class_id INTEGER REFERENCES class(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES student(id) ON DELETE CASCADE,
        PRIMARY KEY (class_id, student_id)
    );
`);
    await client.query(`
    CREATE TABLE IF NOT EXISTS assignment(
        id SERIAL PRIMARY KEY,
        link TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        due_date TIMESTAMP NOT NULL,
        class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
    );
    `);
    await client.query(`
    CREATE TABLE IF NOT EXISTS resource(
        id SERIAL PRIMARY KEY,
        type TEXT,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
    );
    `);
    await client.query(`
    CREATE TABLE IF NOT EXISTS announcement(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
    );
    `);
    
    await client.query(`
    CREATE TABLE IF NOT EXISTS doubt(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        student_id INTEGER REFERENCES student(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
    );
    `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS doubt_reply(
        id SERIAL PRIMARY KEY,
        reply TEXT NOT NULL,
        doubt_id INTEGER REFERENCES doubt(id) ON DELETE CASCADE
    );
    `);
    await client.query(`
    CREATE TABLE IF NOT EXISTS doubt_student_discussion(
        id SERIAL PRIMARY KEY,
        reply TEXT,
        doubt_id INTEGER REFERENCES doubt(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES student(id) ON DELETE CASCADE
    );
    `);
    // await client.query(`
    // CREATE TABLE IF NOT EXISTS submission(
    //     id SERIAL PRIMARY KEY,
    //     link TEXT,
    //     assignment_id INTEGER REFERENCES assignment(id) ON DELETE CASCADE,
    //     student_id INTEGER REFERENCES student(id) ON DELETE CASCADE
    // );
    // `);
}  


export { getClient };