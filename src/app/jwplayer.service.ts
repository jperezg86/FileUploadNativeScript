import { Injectable } from '@angular/core';
import { Observable } from 'tns-core-modules/ui/page/page';
import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { JWPlayerAuth } from './models/JWPlayerAuth';
import { isAndroid, isIOS, device, screen } from "tns-core-modules/platform";

@Injectable({
  providedIn: 'root'
})

export class JWPlayerService {
  
  public API_KEY : string = "m31I4KzS";
  public API_SHARED_SECRET : string = "AJjhldd0YCBknyBhAhU6mue6";
  public API_FORMAT : string = 'json';
  private VIDEOS_CREATE_URL : string = "https://api.jwplatform.com/v1/videos/create";
  private session : JWPlayerAuth; 

  private getAuth() : Promise<JWPlayerAuth> {
    return new Promise( (resolve, reject) => {
          let params : any = {
              api_format : this.API_FORMAT,
              api_key : this.API_KEY,
              api_timestamp : Math.floor(Date.now() / 1000),
              api_nonce : this.getNonce().toString(),
              api_signature : ''
          };
          params.api_signature = this.getSignature(params);

          this.http.get <JWPlayerAuth>(this.VIDEOS_CREATE_URL,{params : params})
              .subscribe( data => { 
                  this.session = data; 
                  console.log("***** AUTH ",data);
                  if(this.session.status == "ok") {
                    resolve(this.session);
                  }else{
                    reject(this.session);
                  }
                });
      });
  }


  public uploadVideo (file : any) : Promise<JWPlayerUploadResponse> {
    return new Promise( (resolve, reject) => {
        this.getAuth().then( (success : JWPlayerAuth) => {
            let uploadUrl = success.link.protocol + "://" +  
                          success.link.address + success.link.path +
                          "?api_format=json" + "&key=" + success.link.query.key + 
                          "&token=" + success.link.query.token;
            console.log("***** UPLOAD URL: " + uploadUrl);
            var bghttp = require("nativescript-background-http");
            var session = bghttp.session("video-upload");
            var request = {
              url: uploadUrl,
              method: "POST",
              headers: {
                  "Content-Type": "multipart/form-data"
              },
              description: "Uploading Video"
          };

          let params = [
            { name : 'file', filename : (isIOS) ? file.path : file.file }
          ];
          var task = session.multipartUpload(params, request);

          task.on("complete", (e : any) => {
            console.log(e);
          },this);


          task.on("responded", (e:any) => {
            resolve(e.data);
          },this);

          task.on("error", (e:any) => {
              reject(e);
          });

        }).catch( (error : JWPlayerAuth) => { 
              console.log(error); 
        } );
    });
  }

  private getNonce() : number {
        return Math.floor(10000000 + Math.random() * 10000000);
  }

  private getSignature (params : any ) : string { 
    // const utf8 = require('utf8');
    const sha1 = require('js-sha1');
    // let api_secret = "AJjhldd0YCBknyBhAhU6mue6";
    let api_format = encodeURI(params.api_format);
    let api_key = encodeURI(params.api_key);
    let paramsString = "api_format=" + this.API_FORMAT + "&api_key="+ this.API_KEY + "&api_nonce=" 
                        + params.api_nonce + "&api_timestamp=" + params.api_timestamp+this.API_SHARED_SECRET;
    let signature = sha1(paramsString);
    return signature
  }

  constructor(private http : HttpClient) {
      this.http = http;
   }
}


export interface JWPlayerUploadResponse {
    status : string; 
    key : string;
    md5 : string;
    size : number;

}
