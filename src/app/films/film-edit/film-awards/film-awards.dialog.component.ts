import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FilmsService } from '../../services/films.service';
import { FilmAwardResult } from './FilmAwardResult';

@Component({
    selector: 'app-film-awards-dialog',
    templateUrl: './film-awards.dialog.component.html',
    styleUrls: ['./film-awards.dialog.component.css']
})

export class FilmAwardsDialogComponent implements OnInit {
    awardResults: FilmAwardResult[];

    constructor(
        public dialogRef: MatDialogRef<FilmAwardsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private filmsService: FilmsService
    ) {

    }

    ngOnInit(): void {
        // this.route.params.subscribe(params => {
        //     this.personId = params['id'];
        //     this.loadAwards();
        // });
        this.loadAwards();
    }

    loadAwards() {
        this.filmsService.getAwards(this.data.filmId).subscribe(result => {
            this.awardResults = result;
        }, error => console.error(error));
    }
}

export interface DialogData {
    filmId: number;
    filmName: string;
}