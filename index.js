import express from "express";
import router from "./routes/routes.js";

const app = express();

import { config } from "dotenv";
config();

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

const client = await pool.connect();

async function tableExists(tableName) {
  // Consulta para verificar se a tabela existe
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = $1
    );
  `, [tableName]);

  // Retorna verdadeiro se a tabela existir
  return result.rows[0].exists;
}

async function createTableIfNotExists(tableName, createTableQuery) {
  // Verifica se a tabela existe
  const exists = await tableExists(tableName);

  // Se a tabela não existir, cria a tabela
  if (!exists) {
    await client.query(createTableQuery);
  }
}

async function setupDatabase() {
  try {
    // Inicia uma transação
    await client.query("BEGIN");

    // Criação da tabela "colleges" se não existir
    await createTableIfNotExists("colleges", `
      CREATE TABLE colleges (
        college_id SERIAL PRIMARY KEY,
        college_name VARCHAR(255) NOT NULL
      );
    `);

    // Criação da tabela "courses" se não existir
    await createTableIfNotExists("courses", `
      CREATE TABLE courses (
        course_id SERIAL PRIMARY KEY,
        course_name VARCHAR(255) NOT NULL,
        college_id INT REFERENCES colleges(college_id) ON DELETE CASCADE
      );
    `);

    // Criação da tabela "classes" se não existir
    await createTableIfNotExists("classes", `
      CREATE TABLE classes (
        class_id SERIAL PRIMARY KEY,
        class_name VARCHAR(255) NOT NULL,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE
      );
    `);

    // Criação da tabela "students" se não existir
    await createTableIfNotExists("students", `
      CREATE TABLE students (
        student_id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        class_id INT REFERENCES classes(class_id) ON DELETE CASCADE
      );
    `);

    // Criação da tabela "curriculum" se não existir
    await createTableIfNotExists("curriculum", `
      CREATE TABLE curriculum (
        curriculum_id SERIAL PRIMARY KEY,
        subject_name VARCHAR(255) NOT NULL,
        workload INT NOT NULL,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE
      );
    `);

    // Commit da transação
    await client.query("COMMIT");
  } catch (error) {
    // Rollback em caso de erro
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Libera o cliente de volta para o pool
    client.release();
  }
}

// Chama a função para configurar o banco de dados
setupDatabase();

app.use("/", router);

app.listen(8080, () => {
  console.log("Server starting...");
});

export default client