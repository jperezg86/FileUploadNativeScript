import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { isAndroid, isIOS, device, screen } from "tns-core-modules/platform";
import { Mediafilepicker, ImagePickerOptions, VideoPickerOptions, AudioPickerOptions, FilePickerOptions } from 'nativescript-mediafilepicker';
import { Item } from "./item";
import { ItemService } from "./item.service";
import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { JWPlayerService, JWPlayerUploadResponse } from "../jwplayer.service";
import * as utils from "tns-core-modules/utils/utils";

declare const PHAssetMediaTypeImage, UIApplication, IQMediaPickerControllerSourceType, IQMediaPickerController;

@Component({
    selector: "ns-details",
    moduleId: module.id,
    templateUrl: "./item-detail.component.html"
})
export class ItemDetailComponent implements OnInit {
    item : Item;
    public isBusy : boolean  = false;
    constructor(
        private itemService: ItemService,
        private route: ActivatedRoute,
        private http : HttpClient,
        private jwPlayerService : JWPlayerService
    ) { }

    ngOnInit(): void {
        const id = +this.route.snapshot.params.id;
        this.item = this.itemService.getItem(id);
    }

    onGetFiles(res : any) : void{
        console.log("Después de obtener el archivo");
        this.isBusy = false;
        this.isBusy = false;
    }

    openFileBrowser () : void {
        let allowedVideoQualities = [];
        if (isIOS) {
            allowedVideoQualities = ["AVCaptureSessionPreset1920x1080", "AVCaptureSessionPresetHigh"];  // get more from here: https://developer.apple.com/documentation/avfoundation/avcapturesessionpreset?language=objc
        }
        let options: VideoPickerOptions = {
            android: {
                isCaptureMood: false, // if true then camera will open directly.
                isNeedCamera: true,
                maxNumberFiles: 1,
                isNeedFolderList: true,
                maxDuration: 20,
                
            },
            ios: {
                isCaptureMood: false, // if true then camera will open directly.
                videoMaximumDuration: 10,
                allowedVideoQualities: allowedVideoQualities
            }
        };
         
        let mediafilepicker = new Mediafilepicker(); 
        mediafilepicker.openVideoPicker(options);
        this.isBusy = true;
        mediafilepicker.on("getFiles",this.onGetFiles,this);
        
        // mediafilepicker.on("getFiles", function (res) {
        //     let results = res.object.get('results');
        //     if(results.length > 0){
        //         let file = results[0];
        //         this.jwPlayerService.uploadVideo(file).then( (resp : JWPlayerUploadResponse) => {
        //             this.closeLoader();
        //             console.log(resp);
        //         }).catch( (error: any) => {
        //             this.closeLoader();
        //         }); 
        //     }
        // },this);
         
        mediafilepicker.on("error", function (res) {
            let msg = res.object.get('msg');
            console.log(msg);
            this.isBusy = false;
        },this);
         
        mediafilepicker.on("cancel", function (res) {
            let msg = res.object.get('msg');
            console.log(msg);
           this.closeLoader();
        },this);
    }

    openLoader() : void {
        this.isBusy = true;
    }

    closeLoader() : void {
        this.isBusy = false;
    }

    testIOS () : void {
        let controller = IQMediaPickerController.alloc().init();
        controller.mediaTypes = utils.ios.collections.jsArrayToNSArray([PHAssetMediaTypeImage]);
        controller.sourceType = IQMediaPickerControllerSourceType.Library;

         UIApplication.sharedApplication.keyWindow.rootViewController.presentViewControllerAnimatedCompletion(controller, true, null);


    }

    
  
}
// https://content.jwplatform.com/videos/qNKw6UVW-64CHBly6.mp4
// https://content.jwplatform.com/videos/XrA53USg-64CHBly6.mp4