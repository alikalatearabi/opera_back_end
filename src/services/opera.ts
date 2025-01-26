import fs from "node:fs";
import axios, { type AxiosResponse } from "axios";
import FormData from "form-data";

export const transcribe = async (audioFilePath: string) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(audioFilePath));
  const { status, data } = await axios.post<any, AxiosResponse<string>>("https://asr.opera24.net/transcribe", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (status === 200) {
    return data;
  }
  return "";
};
