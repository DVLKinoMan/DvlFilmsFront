import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Photo } from 'src/app/common/photo';
import { PhotosService } from 'src/app/common/services/photos.service';

@Component({
    selector: 'app-person-photos',
    templateUrl: './person-photos.component.html',
    styleUrls: ['./person-photos.component.css']
})
export class PersonPhotosComponent implements OnInit {
    personId: number;
    pageEvent: PageEvent;
    photos: Photo[];
    photosCount: number;

    constructor(private route: ActivatedRoute,
        private photosService: PhotosService,
        private router: Router
    ) {

    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.pageEvent = new PageEvent();
            this.pageEvent.pageIndex = params['pageIndex'] ?? 0;
            this.pageEvent.pageSize = params['pageSize'] ?? 50;
        });
        this.route.params.subscribe(params => {
            this.personId = params['id'];
            this.loadPhotos();
            this.loadPhotosCount();
        });
    }

    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.router.navigate(
            [],
            {
                relativeTo: this.route,
                queryParams: {
                    pageIndex: this.pageEvent.pageIndex,
                    pageSize: this.pageEvent.pageSize,
                },
                replaceUrl: true,
                queryParamsHandling: 'merge'
            });
        this.loadPhotos();
    }

    loadPhotos() {
        var skip = this.pageEvent.pageIndex * this.pageEvent.pageSize;
        var take = this.pageEvent.pageSize;

        this.photosService.getPersonPhotos(this.personId, skip, take).subscribe(result => {
            this.photosService.fixImages(result);
            this.photos = result;
        });
    }

    loadPhotosCount() {
        this.photosService.getPersonPhotosCount(this.personId).subscribe(result => {
            this.photosCount = result;
        });
    }
}