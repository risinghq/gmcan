import { Injectable } from "@angular/core";

import { GLOBAL } from "../services/global";

@Injectable({
  providedIn: "root",
})
export class UploadService {
  public url: string;
  constructor() {
    this.url = GLOBAL.url;
  }

  makeFileRequest(url: string, _params: Array<string>, files: Array<File>, token: string, _name: string) {
    return new Promise((resolve, reject) => {
      const frmData = new FormData();
      const xhr = new XMLHttpRequest();
      for (let i = 0; i < files.length; i++) {
        frmData.set("file", files[0]);
      }
      xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      });
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", token);
      xhr.send(frmData);
    });
  }
}
