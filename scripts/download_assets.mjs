import https from 'https';
import fs from 'fs';
import path from 'path';

// URL de um modelo 3D de alta qualidade (Ready Player Me corrigido)
// Nota: Usando um modelo público genérico hospedado de forma estável.
const MODEL_URL = 'https://models.readyplayer.me/658da75c02796e6d7616640c.glb?useMesh=true&pose=A'; // Exemplo de URL estável RPM
const TARGET_PATH = path.join(process.cwd(), 'public', 'avatar.glb');

console.log(`Baixando avatar.glb de: ${MODEL_URL}`);
console.log(`Destino: ${TARGET_PATH}`);

const file = fs.createWriteStream(TARGET_PATH);

https.get(MODEL_URL, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Erro ao baixar: Status ${response.statusCode}`);
    process.exit(1);
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Download concluído com sucesso!');
  });
}).on('error', (err) => {
  fs.unlink(TARGET_PATH, () => {});
  console.error(`Erro na requisição: ${err.message}`);
});
