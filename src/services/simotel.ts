import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import stream from "node:stream";
import axios, { type Axios, AxiosHeaders, type AxiosResponse } from "axios";

import ffmpeg from "fluent-ffmpeg";

const streamAndMergeAudio = async (id: string, type: "incoming" | "outgoing") => {
  let fileUrlOut: string;
  let fileUrlIn: string;
  const tempPathIn = path.join(os.tmpdir(), randomUUID());
  const tempPathOut = path.join(os.tmpdir(), randomUUID());
  const writerIn = fs.createWriteStream(tempPathIn);
  const writerOut = fs.createWriteStream(tempPathOut);

  const responseWriter = (writer: fs.WriteStream) => (response: AxiosResponse) => {
    response.data.pipe(writer);
    let error: Error;
    writer.on("error", (err) => {
      error = err;
      writer.close();
      throw err;
    });
    writer.on("close", () => {
      if (!error) {
        return;
      }
    });
  };

  if (type === "incoming") {
    fileUrlOut = `https:// api-address /stream-audio-incoming.php?recfile=${id}-out`;
    fileUrlIn = `https:// api-address /stream-audio-incoming.php?recfile=${id}-in`;
  } else {
    fileUrlOut = `https:// api-address /stream-audio-outgoing.php?recfile=${id}-out`;
    fileUrlIn = `https:// api-address /stream-audio-outgoing.php?recfile=${id}-in`;
  }

  const outPromise = axios
    .get(fileUrlOut, {
      responseType: "stream",
    })
    .then(responseWriter(writerOut));
  const inPromise = axios
    .get(fileUrlIn, {
      responseType: "stream",
    })
    .then(responseWriter(writerIn));
  ffmpeg().input(tempPathIn).input(tempPathOut).mergeToFile("output.mp3", "");
  await Promise.all([outPromise, inPromise]);
};

interface ICDR {
  event_name: "Cdr";
  starttime: Date;
  endtime: Date;
  src: string;
  dst: string;
  type: "incoming" | "outgoing" | "local" | "feature" | "no defined" | string;
  disposition: "ANSWERED" | "NO ANSWERED" | "BUSY" | string;
  billsec: number;
  wait: number;
  record: string;
  unique_id: string;
}

export class Simotel {
  client: Axios;
  headers: any;
  constructor() {
    const headers = {
      "X-APIKEY": "9UV0BWKRL83PYIH9Gv1fI85d41lO4S932EeX3wHC47sHjMJOMG",
      Authorization: "Basic c2FkcjpTYWRyQDEyMw==",
      "Content-Type": "application/json",
    };
    this.client = axios.create({
      baseURL: "",
      headers,
    });
  }

  /**
   * @returns audio file
   * @param file string like "20200921_1600675211.10033.1.mp3"
   */
  public async downloadAudioFile(file: string) {
    const { status, data } = await this.client.post("/api/v4/reports/audio/download", { file });
    if (status === 200) {
      return data;
    } else {
      throw new Error("Audio file not found");
    }
  }

  public async processCdr(payload: ICDR) {
    console.log({ payload });
  }
}
