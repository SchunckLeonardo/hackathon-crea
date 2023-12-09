async function scrapeFaculties() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto("https://www.educabras.com/faculdades/estado/sp");
  
    // Aguarde o seletor específico para garantir que a página foi totalmente carregada
    await page.waitForSelector(".find-bt");
  
    // Extraia os nomes das faculdades
    const faculties = await page.evaluate(() => {
      const facultyElements = document.querySelectorAll(".find-bt");
      const facultyNames = [];
      facultyElements.forEach((element) => {
        facultyNames.push(element.textContent.trim());
      });
      return facultyNames;
    });
  
    await browser.close();
  
    return faculties;
  }
  
  async function insertFacultiesIntoDatabase(faculties) {
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
  
      // Insere as faculdades na tabela "colleges"
      for (const faculty of faculties) {
        await client.query(`
          INSERT INTO colleges (college_name) VALUES ($1);
        `, [faculty]);
      }
  
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