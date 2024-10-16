import { parse } from "csv-parse";
import fs from "node:fs";
import http from "node:http";

export class Database {
  #database = {};

  constructor() {
    (async () => {
      const filePath = new URL("./mocks/fake_tasks.csv", import.meta.url);
      const parser = fs.createReadStream(filePath).pipe(
        parse({
          columns: true,
          high_water_mark: 64 * 64,
        })
      );

      let count = 0;

      for await (const record of parser) {
        count++;
        console.log(record);

        if (count === 1) {
          continue;
        }

        const requestBody = JSON.stringify(record);

        const options = {
          host: "127.0.0.1",
          port: 3333,
          path: "/tasks",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
          },
        };

        const req = http.request(options, (res) => {
          let responseData = "";

          res.on("data", (chunk) => {
            responseData += chunk;
          });

          res.on("end", () => {
            if (!res.complete) {
              console.error(
                "The connection was terminated while the message was still being sent"
              );
            } else {
              console.log("Response received:", responseData);
            }
          });
        });

        req.on("error", (error) => {
          console.error(`Problem with request: ${error.message}`);
        });

        req.write(requestBody);
        req.end();
      }
    })();
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  get(table, id) {
    let data = this.#database?.[table]?.find((row) => row.id === id);

    return data;
  }

  insert(table, data) {
    if (this.#database[table]) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }
    return data;
  }

  update(table, id, data) {
    const index = this.#database[table]?.findIndex((row) => row.id === id);

    if (index >= 0) {
      this.#database[table][index] = data;

      return data;
    }

    return null;
  }

  delete(table, id) {
    const index = this.#database[table]?.findIndex((row) => row.id === id);

    if (index >= 0) {
      this.#database[table].splice(index, 1);

      return true;
    }

    return false;
  }
}
