import fs from 'fs/promises';

async function main() {

  try {
    const instructions = await fs.readFile('instrukce.txt', "utf-8");
    const instructionsStr = instructions.toString();
    const [sourceFile, destFile] = instructionsStr.trim().split(' ');

    try {
      await fs.access(sourceFile);
    } catch {
      console.error('Zdrojový soubor neexistuje!');
      return; 
    }

    const fileContent = await fs.readFile(sourceFile);
    const contentStr = fileContent.toString();
    
    await fs.writeFile(destFile, contentStr);

    console.log('Hotovo!');

  } catch (err) {
    console.error('Chyba!', err.message);
  }

}

main();