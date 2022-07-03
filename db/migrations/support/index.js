import fs from 'fs';

export const importSql = (folder, file) => fs.readFileSync(`${__dirname}/${folder}/${file}.sql`, { encoding: 'utf-8' });
