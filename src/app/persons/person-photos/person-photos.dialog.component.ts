import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Photo } from 'src/app/common/photo';
import { PhotosService } from 'src/app/common/services/photos.service';

@Component({
    selector: 'app-person-photos',
    templateUrl: './person-photos.dialog.component.html',
    styleUrls: ['./person-photos.dialog.component.css']
})

export class PersonPhotosDialogComponent {
    pageEvent: PageEvent;
    photos: Photo[];
    fullScreenPhotos: object[];
    photosCount: number;

    currentIndex: number = -1;
    showFlag: boolean = false;

    constructor(
        private photosService: PhotosService,
        public dialogRef: MatDialogRef<PersonPhotosDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.pageEvent = new PageEvent();
        this.pageEvent.pageIndex = this.data.pageIndex ?? 0;
        this.pageEvent.pageSize = this.data.pageSize ?? 50;
        this.loadPhotos();
        this.loadPhotosCount();
    }

    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.loadPhotos();
    }

    showLightbox(index: number) {
        this.currentIndex = index;
        this.showFlag = true;
    }

    closeEventHandler() {
        this.showFlag = false;
        this.currentIndex = -1;
    }

    loadPhotos() {
        var skip = this.pageEvent.pageIndex * this.pageEvent.pageSize;
        var take = this.pageEvent.pageSize;

        this.photosService.getPersonPhotos(this.data.personId, skip, take).subscribe(result => {
            this.photosService.fixImages(result);
            this.photos = result;
            this.fullScreenPhotos = this.photosService.getImdbFullScreenPhotos(result);
        });
    }

    loadPhotosCount() {
        this.photosService.getPersonPhotosCount(this.data.personId)
            .subscribe(result => {
                this.photosCount = result;
            });
    }
}

export interface DialogData {
    personId: number;
    personName: string;
    pageIndex?: number;
    pageSize?: number;
}