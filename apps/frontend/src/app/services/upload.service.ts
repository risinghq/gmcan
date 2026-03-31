import { Injectable } from "@angular/core";

import { GLOBAL } from "../services/global";

@Injectable({
  providedIn: "root",
})
export class UploadService {
  public url: String;
  constructor() {
    this.url = GLOBAL.url;
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>, token: string, name: string) {
    return new Promise(function (resolve, reject) {
      var frmData: any = new FormData();
      var xhr = new XMLHttpRequest();
      for (var i = 0; i < files.length; i++) {
        frmData.set("file", files[0]);
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", token);
      xhr.send(frmData);
    });
  }
}
