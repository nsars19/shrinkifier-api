# shrinkifier-api

An Express application built to compress image files.

This app is based off of a node app that I created to compress large batches of image files, and was made so I wouldn't have to use TinyPNG or TinyJPEG anymore for handling image asset filesizes.

Multer handles the initial uploading of files when a request comes in, and then Sharp handles the compression of the image files. AdmZip is used to archive the files, and the resulting zip file is sent with the response.
