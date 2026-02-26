import { FtpSrv } from "ftp-srv";

const host = "127.0.0.1";
const port = 2121;

const ftpServer = new FtpSrv({
  url: `ftp://${host}:${port}`,
  anonymous: false,
});

ftpServer.on("login", ({ username, password }, resolve, reject) => {
  if (username === "test" && password === "test") {
    return resolve({ root: process.cwd() }); // lists your project folder
  }
  return reject(new Error("Invalid credentials"));
});

ftpServer.listen().then(() => {
  console.log(`FTP test server running at ftp://${host}:${port}`);
});
