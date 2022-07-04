import fs from 'fs';
import node_crypto from "crypto";
const algorithm = "aes-256-cbc"; 
const initVector = node_crypto.randomBytes(16);
const Securitykey = node_crypto.randomBytes(32);
const cipher = node_crypto.createCipheriv(algorithm, Securitykey, initVector);
const decipher = node_crypto.createDecipheriv(algorithm, Securitykey, initVector);

type Data = {
    data?: any,
    error?: string,
}

interface DataSource {
    writeData(data: Data):void,
    readData():Data,
}

class FileDataSource implements DataSource{
    constructor(filename: string) {

    }

    writeData(data: Data): void {
        fs.writeFile('/test.txt', data.data, err => {
            if (err) {
              console.error(err)
              return
            }
          })
        }

        readData(): Data  {
            fs.readFile('/test.txt', 'utf8', (err: string, data: string) => {
                if (err) {
                  console.error(err);
                  return {error: err};
                }
                return {data};
              });
              return {error: 'some errors occured'};
        }
}

class DataSourceDecorator implements DataSource{
    protected wrappee: DataSource;

    constructor(source: DataSource) {
        this.wrappee = source;
    }

    writeData(data: Data): void {
        this.wrappee.writeData(data);
        }

        readData(): Data  {
           return this.wrappee.readData();
        }
}

class EncryptionDecorator extends DataSourceDecorator {
    constructor(source: DataSource){
        super(source);
    }

    writeData(data: Data): void {
        let encryptedData = cipher.update(data, "utf-8", "hex");
        encryptedData += cipher.final("hex");

        super.writeData(encryptedData);
    }

    readData(): Data {
        let encryptedData  = super.readData();

        let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

        decryptedData += decipher.final("utf8");

        return decryptedData;
    }
}

class Application {
    records = {data: "Record"};

    usageExample() {
        let source = new FileDataSource('source.dat');
        source.writeData(this.records);
        source = new EncryptionDecorator(source);
        source.writeData(this.records);
    }
}
