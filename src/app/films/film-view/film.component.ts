import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Person } from "src/app/persons/person";
import { PhotosService } from "src/app/common/services/photos.service";
import { Film } from "../film";
import { FilmsService } from "../services/films.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formatDate } from "@angular/common";
import { FilmCastMember } from "../film-edit/film-cast-crew/filmCastMember";
import { FilmAnotherNamesDialogComponent } from "../film-edit/film-another-names/film-anotherNames.dialog.component";
import { FilmAwardsDialogComponent } from "../film-edit/film-awards/film-awards.dialog.component";
import { FilmCastAndCrewDialogComponent } from "../film-edit/film-cast-crew/film-cast-crew.dialog.component";
import { Gender } from "src/app/persons/enums";
import { FilmPhotosDialogComponent } from "../film-photos/film-photos.dialog.component";
import { FilmEditDialogComponent } from "../film-edit/film-edit.dialog.component";

@Component({
    selector: 'app-film',
    templateUrl: './film.component.html',
    styleUrls: ['./film.component.css']
})

export class FilmComponent implements OnInit {
    id: number;
    model: Film;
    fetched?: Film;
    editMode: boolean = false;
    filmForm: FormGroup;

    cast: FilmCastMember[];
    castItemsPerPage: number = 5;
    castCurrPage: number = 0;
    castPagesLength: number = 0;
    allCast: FilmCastMember[];
    leftCastArrowDisabled: boolean = true;
    rightCastArrowDisabled: boolean = false;

    showPhotos: number = 5;

    constructor(private service: FilmsService,
        private photosService: PhotosService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        public anotherNamesDialog: MatDialog,
        public awardsDialog: MatDialog,
        public castAndCrewDialog: MatDialog,
        public photosDialog: MatDialog,
        public editDialog: MatDialog
    ) {
        this.route.params.subscribe(item => {
            this.id = item['id'];
            this.loadFilm();
            this.loadCast();
        });
    }
    ngOnInit(): void {
        this.filmForm = this.formBuilder.group({

        });
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        if (typeof castMember.gender == "string")
            event.target.src = castMember.gender == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    setDefaultPersonPhoto(event: any, person: Person) {
        if (typeof person.sex == "string")
            event.target.src = person?.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person?.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    openAnotherNamesDialog(): void {
        const dialogRef = this.anotherNamesDialog.open(FilmAnotherNamesDialogComponent, {
            width: '800px',
            data: { filmName: this.model.name, anotherNames: this.model.anotherNames }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    openAwardsDialog() {
        const dialogRef = this.awardsDialog.open(FilmAwardsDialogComponent, {
            width: '800px',
            data: { filmId: this.id, filmName: this.model.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    openCastAndCrewDialog() {
        const dialogRef = this.awardsDialog.open(FilmCastAndCrewDialogComponent, {
            width: '900px',
            data: { filmId: this.id, filmName: this.model.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    openPhotosDialog() {
        const dialogRef = this.photosDialog.open(FilmPhotosDialogComponent, {
            width: '1000px',
            data: { filmId: this.id, filmName: this.model.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    openEditDialog() {
        const dialogRef = this.editDialog.open(FilmEditDialogComponent, {
            width: '1000px',
            data: { filmId: this.id }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    fetchFilmFromImdb() {

    }

    save() {

    }

    loadFilm() {
        this.service.getById(this.id).subscribe(result => {
            this.photosService.fixImage(result.photo);
            this.model = result;
            this.photosService.getFilmPhotos(this.id, 0, this.showPhotos).subscribe(result => {
                this.photosService.fixImages(result);
                this.model.photos = result;
            }, error => console.log(error));
        }, error => console.log(error));
    }

    castPageArrowClicked(right: boolean) {
        this.castCurrPage = right ? this.castCurrPage + 1 : this.castCurrPage - 1;
        this.cast = this.allCast.slice(this.castCurrPage * this.castItemsPerPage,
            this.castCurrPage * this.castItemsPerPage + this.castItemsPerPage);
        this.leftCastArrowDisabled = this.castCurrPage < 1;
        this.rightCastArrowDisabled = this.castCurrPage >= this.castPagesLength - 1;
    }

    formatDate(dateTime: Date | undefined): string | undefined {
        if (dateTime)
            return formatDate(dateTime, 'yyyy-MM-dd', 'en-US');

        return undefined;
    }

    loadCast() {
        this.service.getCast(this.id).subscribe(result => {
            this.photosService.fixImagesForCast(result);
            this.allCast = result;
            this.cast = this.allCast.slice(0, this.castItemsPerPage);
            this.castPagesLength = Math.floor(this.allCast.length / this.castItemsPerPage) +
                (this.allCast.length % this.castItemsPerPage > 0 ? 1 : 0);
            this.leftCastArrowDisabled = true;
            this.rightCastArrowDisabled = this.castPagesLength <= 1;
        }, error => console.log(error));
    }
}