import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Photo } from '../person';
import { PersonsService } from '../services/persons.service';

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
        private personsService: PersonsService,
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

        this.personsService.getPhotos(this.personId, skip, take).subscribe(result => {
            this.photos = result;
        });
    }

    loadPhotosCount() {
        this.personsService.getPhotosCount(this.personId).subscribe(result => {
            this.photosCount = result;
        });
    }
}