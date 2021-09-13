import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PhotosService } from "src/app/common/services/photos.service";
import { Film, FilmPerson } from "../film";
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
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { UserRole } from "src/app/auth/user.model";
import { FilmBuiltInListsService } from "../services/filmBuiltInLists.service";
import { FilmWatchHistoryDialogComponent } from "../film-edit/film-watch-history/film-watch-history.dialog.component";

@Component({
    selector: 'app-film',
    templateUrl: './film.component.html',
    styleUrls: ['./film.component.css']
})

export class FilmComponent implements OnInit {
    private userSub: Subscription;

    id: number;
    model: Film;
    editMode: boolean;
    fetched?: Film;
    loading: boolean = true;

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
        private builtInListsService: FilmBuiltInListsService,
        private route: ActivatedRoute,
        public anotherNamesDialog: MatDialog,
        public awardsDialog: MatDialog,
        public castAndCrewDialog: MatDialog,
        public photosDialog: MatDialog,
        public editDialog: MatDialog,
        public watchHistoryDialog: MatDialog,
        private authService: AuthService
    ) {
        this.route.params.subscribe(item => {
            this.id = item['id'];
            this.loadFilm();
            this.loadCast();
        });
    }
    ngOnInit(): void {
        this.userSub = this.authService.user.subscribe(user => {
            if (UserRole.Admin as UserRole === user.role as UserRole)
                this.editMode = true;
            else this.editMode = false;
        });
    }

    addToWatch() {
        this.builtInListsService.addToWatched(this.model.id).subscribe(res => {
            this.model.haveSeen = true;
        }, error => {
            console.log(error);
        });
    }

    openWatchHistory() {
        const dialogRef = this.watchHistoryDialog.open(FilmWatchHistoryDialogComponent, {
            width: '400px',
            data: { filmId: this.id, filmName: this.model.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result)
                window.location.reload();
            console.log('The dialog was closed');
        });
    }

    removeFromWatched() {
        this.builtInListsService.deleteFromWatched(this.model.id).subscribe(res => {
            this.model.haveSeen = false;
        }, error => {
            console.log(error);
        });
    }

    addToWantToWatch() {
        this.builtInListsService.addToWantToSee(this.model.id).subscribe(res => {
            this.model.wantToSee = true;
        }, error => {
            console.log(error);
        });
    }

    removeFromWantToWatch() {
        this.builtInListsService.deleteFromWantToSee(this.model.id).subscribe(res => {
            this.model.wantToSee = false;
        }, error => {
            console.log(error);
        });
    }

    addToFavorites() {
        this.builtInListsService.addToFavorites(this.model.id).subscribe(res => {
            this.model.isFavorite = true;
        }, error => {
            console.log(error);
        });
    }

    removeFromFavorites() {
        this.builtInListsService.deleteFromFavorites(this.model.id).subscribe(res => {
            this.model.isFavorite = false;
        }, error => {
            console.log(error);
        });
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        if (typeof castMember.gender == "string")
            event.target.src = castMember.gender == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    setDefaultPersonPhoto(event: any, person: FilmPerson) {
        if (typeof person.sex == "string")
            event.target.src = person?.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person?.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    openAnotherNamesDialog(): void {
        const dialogRef = this.anotherNamesDialog.open(FilmAnotherNamesDialogComponent, {
            width: '800px',
            data: { filmName: this.model.name, filmId: this.id }
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
        const dialogRef = this.castAndCrewDialog.open(FilmCastAndCrewDialogComponent, {
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
            if (result == true)
                window.location.reload();
            console.log('The dialog was closed');
        });
    }

    loadFilm() {
        this.service.getById(this.id).subscribe(result => {
            result.writers?.sort((wr1, wr2) => wr1.index - wr2.index);
            result.directors?.sort((dr1, dr2) => dr1.index - dr2.index);
            this.model = result;
            this.loading = false;
            this.photosService.getFilmPhotos(this.id, 0, this.showPhotos).subscribe(result => {
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
            this.allCast = result.sort((a, b) => a.index - b.index);
            this.cast = this.allCast.slice(0, this.castItemsPerPage);
            this.castPagesLength = Math.floor(this.allCast.length / this.castItemsPerPage) +
                (this.allCast.length % this.castItemsPerPage > 0 ? 1 : 0);
            this.leftCastArrowDisabled = true;
            this.rightCastArrowDisabled = this.castPagesLength <= 1;
        }, error => console.log(error));
    }
}