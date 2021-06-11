# shrinkifier-api

An Express application built to compress image files.

This app is based off of a node app that I created to compress large batches of image files, and was made so I wouldn't have to use TinyPNG or TinyJPEG anymore for handling image asset filesizes.

Multer handles the initial uploading of files when a request comes in, and then Sharp handles the compression of the image files. AdmZip is used to archive the files, and the resulting zip file is sent with the response.

A more technical description: A separate UI sends a post request with images as form data in the body of the request. Multer takes this form data and creates files at <code>tmp/unprocessed/</code> for each of the images. Following this each image is compressed, and a new file is added at <code>tmp/processed/</code>. A new zip archive is created, and each file at <code>tmp/processed/</code> is added, and a zip file is created at <code>tmp/</code>. This path is then added to the request object for later accessing. Following this each file within the <code>tmp/unprocessed/</code> and <code>tmp/processed/</code> directories is removed, and the zip file is marked to be removed when the <code>res</code> object reaches its finished state. Finally the zip file is sent with the response.
