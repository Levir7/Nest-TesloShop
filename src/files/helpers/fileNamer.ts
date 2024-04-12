import { v4 as uuid } from "uuid";

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false); // validamos que venga un archivo y si no regresa el callback que nos pide en el filefilter con un error y un false para que no se ejecute

  const fileExtension = file.mimetype.split('/')[1];

  
  const fileName = `${ uuid() }.${ fileExtension }`

  callback(null, fileName);
};

