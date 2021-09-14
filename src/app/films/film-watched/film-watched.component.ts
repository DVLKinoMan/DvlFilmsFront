import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Observable } from "rxjs";
import { debounceTime, startWith, switchMap } from "rxjs/operators";
import { FilmBuiltInListsService } from "src/app/films/services/filmBuiltInLists.service";
import { FilmsService } from "src/app/films/services/films.service";
import { FilmItem } from "src/app/persons/person";
import { FilmWatchHistoryDialogComponent } from "../film-edit/film-watch-history/film-watch-history.dialog.component";
import { FilmWatch } from "../film-watch.model";


@Component({
    selector: 'app-film-watched',
    templateUrl: './film-watched.component.html',
    styleUrls: ['./film-watched.component.css']
})
export class FilmWatchedListComponent implements OnInit {
    queryParams: Params;
    id: string;
    items: FilmWatch[];
    editMode: boolean = false;

    filmsCtrl = new FormControl();
    filteredFilms: Observable<FilmItem[]>;
    showFilms = 10;
    @ViewChild('filmInput') filmInput: ElementRef<HTMLInputElement>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private builtInFilmsListService: FilmBuiltInListsService,
        private filmsService: FilmsService,
        private watchHistoryDialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {
        this.filteredFilms = this.filmsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((film: string) => this.filmsService.getFilmItems(film, this.showFilms, false))
        );
        this.loadList();
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.queryParams = params;
            this.loadList();
        });
    }

    selectedFilm(event: MatAutocompleteSelectedEvent): void {
        this.filmInput.nativeElement.value = '';
        this.filmsCtrl.setValue(null);
        const f = event.option.value as FilmItem;
        if (f) {
            if (this.items.find(it => it.filmId == f.id)) {
                this._snackBar.open("Duplicates Not Allowed", "Ok", {
                    duration: 4000
                });
                return;
            }
            this.builtInFilmsListService.addToWatched(f.id).subscribe(res => {
                var watch = new FilmWatch(null, new Date(), f.name, f.photo);
                watch.filmId = f.id;
                this.items.push(watch);
            }, error => {
                console.log(error);
                this._snackBar.open("Error while adding", "Ok", {
                    duration: 4000
                });
            });
        }
    }

    onClickItem(item: FilmWatch) {
        this.router.navigate(['/film/' + item.filmId]);
    }


    openWatchHistory(film: FilmWatch) {
        const dialogRef = this.watchHistoryDialog.open(FilmWatchHistoryDialogComponent, {
            width: '400px',
            data: { filmId: film.filmId, filmName: film.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const index = this.items.indexOf(film);
                if (index >= 0)
                    this.items.splice(index, 1);
            }
            console.log('The dialog was closed');
        });
    }

    removeItem(item: FilmWatch) {
        if (!this.items)
            return;

        this.builtInFilmsListService.deleteFromWatched(item.filmId).subscribe(res => {
            const index = this.items.indexOf(item);
            if (index >= 0)
                this.items.splice(index, 1);
        }, error => {
            this._snackBar.open("Error while deleting", "Ok", {
                duration: 4000
            });
        });
    }

    loadList() {
        this.builtInFilmsListService.listWatchedFilms().subscribe(res => {
            this.items = res;
        }, error => console.log(error));
    }
}