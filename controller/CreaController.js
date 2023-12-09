// CreaController.js

import client from "../index.js";

class CreaController {

  async getAllCollege(req, res) {
    try {
      const colleges = await client.query(`SELECT * FROM colleges`);
      res.json({ colleges: colleges.rows });
    } catch (error) {
      console.error("Erro ao obter todas as faculdades:", error.message);
      // Verifica se o erro é devido à conexão fechada e tenta reconectar
        const colleges = await client.query(`SELECT * FROM colleges`);
        res.json({ colleges: colleges.rows });
      }
    }

  async getCourseByCollegeId(req, res) {
    try {
      const collegeId = req.params.id;

      // Consulta SQL para obter informações do curso por ID do colégio
      const query = `
        SELECT courses.course_id, courses.course_name, colleges.college_name
        FROM courses
        JOIN colleges ON courses.college_id = colleges.college_id
        WHERE courses.college_id = $1;
      `;

      // Executa a consulta no banco de dados
      const result = await client.query(query, [collegeId]);

      // Retorna os resultados como JSON
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao obter informações do curso:", error.message);
      }
    }

  async getSubjectsByCourseId(req, res) {
    try {
      const courseId = req.params.id;

      // Consulta SQL para obter as matérias associadas a um curso diretamente da tabela curriculum
      const query = `
        SELECT subject_name
        FROM curriculum
        WHERE course_id = $1;
      `;

      // Executa a consulta no banco de dados
      const result = await client.query(query, [courseId]);

      // Retorna os resultados como JSON
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao obter matérias do curso:", error.message);
      // Verifica se o erro é devido à conexão fechada e tenta reconectar
      if (error.message.includes("Client was closed")) {
        console.warn("Cliente fechado. Tentando reconectar...");
        await this.reconnect(); // Tenta reconectar
        // Tenta novamente a execução da consulta após a reconexão
        const courseId = req.params.id;
        const query = `
          SELECT subject_name
          FROM curriculum
          WHERE course_id = $1;
        `;
        const result = await client.query(query, [courseId]);
        res.json(result.rows);
      } else {
        // Se o erro não for relacionado à conexão fechada, lança o erro
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }

  async getClassByCourseId(req, res) {
    try {
        const courseId = req.params.courseId;
  
        // Consulta SQL para obter as turmas associadas a um curso
        const query = `
          SELECT *
          FROM classes
          WHERE course_id = $1;
        `;
  
        // Executa a consulta no banco de dados
        const result = await client.query(query, [courseId]);
  
        // Retorna os resultados como JSON
        res.json(result.rows);
      } catch (error) {
        console.error("Erro ao obter turmas do curso:", error.message);
        // Se o erro não for relacionado à conexão fechada, lança o erro
        res.status(500).json({ error: "Erro interno do servidor" });
      }
  }

  async getStudentsByClassId(req, res) {
    try {

      const classId = req.params.id;

      // Consulta SQL para obter informações sobre os alunos, turma, curso e status de aprovação
      const query = `
        SELECT
          students.student_id,
          students.student_name,
          students.is_approved,
          classes.class_name,
          courses.course_name
        FROM students
        JOIN classes ON students.class_id = classes.class_id
        JOIN courses ON classes.course_id = courses.course_id
        WHERE students.class_id = $1;
      `;

      // Executa a consulta no banco de dados
      const result = await client.query(query, [classId]);

      // Retorna os resultados como JSON
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao obter alunos da turma:", error.message);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

}

export default new CreaController();
