export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false); // validamos que venga un archivo y si no regresa el callback que nos pide en el filefilter con un error y un false para que no se ejecute

  // separamos el tipo del archivo
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'png', 'jpeg', 'gif']; // creamos el array con los tipos de archivos validos
//* validamos que si coincida con algun tipo aceptado en el array y retorne true
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }
  // si no, entnoces false 
  callback(null, false);
};
