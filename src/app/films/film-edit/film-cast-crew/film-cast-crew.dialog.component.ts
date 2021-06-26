import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PhotosService } from 'src/app/common/services/photos.service';
import { Gender } from 'src/app/persons/person-query';
import { FilmsService } from '../../services/films.service';
import { FilmCastMember } from './filmCastMember';
import { FilmCrewMember } from './filmCrewMember';

@Component({
    selector: 'app-film-awards-dialog',
    templateUrl: './film-cast-crew.dialog.component.html',
    styleUrls: ['./film-cast-crew.dialog.component.css']
})

export class FilmCastAndCrewDialogComponent implements OnInit {
    crew: FilmCrewMember[];
    cast: FilmCastMember[];
    groupedCrew: Map<string, FilmCrewMember[]>;

    constructor(
        public dialogRef: MatDialogRef<FilmCastAndCrewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private filmsService: FilmsService,
        private photosService: PhotosService
    ) {

    }

    ngOnInit(): void {
        this.loadCrew();
        this.loadCast();
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        if (typeof castMember.gender == "string")
            event.target.src = castMember.gender == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    loadCrew() {
        this.filmsService.getCrew(this.data.filmId).subscribe(result => {
            this.crew = result;
            var map = new Map<string, FilmCrewMember[]>();
            result.forEach(function (member) {
                var arr = map.get(member.profession);
                if (arr)
                    arr.push(member);
                else map.set(member.profession, [member]);
            });
            this.groupedCrew = map;
        }, error => console.error(error));
    }

    loadCast() {
        this.filmsService.getCast(this.data.filmId).subscribe(result => {
            this.photosService.fixImagesForCast(result);
            this.cast = result;
        }, error => console.error(error));
    }
}

export interface DialogData {
    filmId: number;
    filmName: string;
}