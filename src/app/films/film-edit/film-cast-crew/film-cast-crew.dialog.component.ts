import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Gender } from 'src/app/persons/enums';
import { FilmsService } from '../../services/films.service';
import { FilmCastEditDialogComponent } from './film-cast-edit.dialog.component';
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
        private addEditCastDialog: MatDialog,
        private router: Router
    ) {
        if (data.cast)
            this.cast = data.cast;
        else
            this.loadCast();

        if (data.crew) {
            this.crew = data.crew;
            this.setGroupedCrew();
        }
        else
            this.loadCrew();
    }

    ngOnInit(): void {
    }

    onCloseClick() {
        this.dialogRef.close();
    }

    onClickAddCastMember() {
        const dialogRef = this.addEditCastDialog.open(FilmCastEditDialogComponent, {
            width: '800px'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log("Cast member dialog closed");
            if (result)
                this.cast.push(result);
        });
    }

    onClickCastMember(member: FilmCastMember) {
        if (this.data.editMode) {
            const dialogRef = this.addEditCastDialog.open(FilmCastEditDialogComponent, {
                width: '800px',
                data: { model: JSON.parse(JSON.stringify(member)) }
            });

            dialogRef.afterClosed().subscribe(result => {
                console.log("Cast member dialog closed");
                if (result) {
                    const index = this.cast.indexOf(member);
                    if (index >= 0)
                        this.cast[index] = result;
                }
            });
        }
        else if (member.personId)
            this.router.navigate(['/person/' + member.personId]);
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        if (typeof castMember.gender == "string")
            event.target.src = castMember.gender == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    removeCastMember(member: FilmCastMember) {
        if (!this.cast)
            return;

        const index = this.cast.indexOf(member);

        if (index >= 0)
            this.cast.splice(index, 1);
    }

    removeCrewMember(key: string, member: FilmCrewMember) {
        if (!this.crew)
            return;

        const index = this.crew.indexOf(member);
        const index2 = this.groupedCrew.get(key)?.indexOf(member);

        if (index >= 0)
            this.crew.splice(index, 1);
        if (index2 != undefined && index2 >= 0)
            this.groupedCrew.get(key)?.splice(index2, 1);
    }

    setGroupedCrew() {
        var map = new Map<string, FilmCrewMember[]>();
        this.crew.forEach(function (member) {
            var arr = map.get(member.profession);
            if (arr)
                arr.push(member);
            else map.set(member.profession, [member]);
        });
        this.groupedCrew = map;
    }

    loadCrew() {
        this.filmsService.getCrew(this.data.filmId).subscribe(result => {
            this.crew = result;
            this.setGroupedCrew();
        }, error => console.error(error));
    }

    loadCast() {
        this.filmsService.getCast(this.data.filmId).subscribe(result => {
            this.cast = result;
        }, error => console.error(error));
    }
}

export interface DialogData {
    filmId: number;
    filmName: string;
    cast?: FilmCastMember[];
    crew?: FilmCrewMember[];
    editMode?: boolean;
}