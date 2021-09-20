import { HttpEventType } from "@angular/common/http";
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
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
    id: string;
    items: FilmWatch[];
    editMode: boolean = false;
    @Output() public uploadStatus: EventEmitter<ProgressStatus>;

    filmsCtrl = new FormControl();
    filteredFilms: Observable<FilmItem[]>;
    showFilms = 10;
    @ViewChild('filmInput') filmInput: ElementRef<HTMLInputElement>;

    importPercentage: number;
    showImportProgress: boolean = false;

    pageEvent: PageEvent;
    defaultPageIndex: number = 0;
    defaultPageSize: number = 50;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private builtInFilmsListService: FilmBuiltInListsService,
        private filmsService: FilmsService,
        private watchHistoryDialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {
        this.uploadStatus = new EventEmitter<ProgressStatus>();
        this.uploadStatus.subscribe(res => {
            switch (res.status) {
                case ProgressStatusEnum.START:
                    this.showImportProgress = true;
                    break;
                case ProgressStatusEnum.IN_PROGRESS:
                    this.importPercentage = res.percentage;
                    break;
                case ProgressStatusEnum.COMPLETE:
                    this.showImportProgress = false;
                    this.importPercentage = 0;
                    this._snackBar.open("Import Completed", "Ok", {
                        duration: 2000
                    });
                    break;
                case ProgressStatusEnum.ERROR:
                    this.showImportProgress = false;
                    this.importPercentage = 0;
                    this._snackBar.open("Import Failed", "Ok", {
                        duration: 2000
                    });
                    break;
            }
        }, error => console.log(error));

        this.filteredFilms = this.filmsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((film: string) => this.filmsService.getFilmItems(film, this.showFilms, false))
        );
    }

    ngOnInit(): void {
        this.pageEvent = new PageEvent();
        this.route.queryParams.subscribe(params => {
            this.pageEvent.pageIndex = params["pageIndex"] ?? this.defaultPageIndex;
            this.pageEvent.pageSize = params["pageSize"] ?? this.defaultPageSize;
            this.loadList();
            this.setPageLength();
        });
        this.loadList();
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

    onFileSelected() {
        const inputNode: any = document.querySelector('#file');
        if (inputNode.files && inputNode.files.length > 0) {
            this.uploadStatus.emit({ status: ProgressStatusEnum.START });
            this.builtInFilmsListService.uploadWatchedFilms(inputNode.files[0]).subscribe(
                data => {
                    if (data)
                        switch (data.type) {
                            case HttpEventType.UploadProgress:
                                this.uploadStatus.emit({
                                    status: ProgressStatusEnum.IN_PROGRESS,
                                    percentage: Math.round((data.loaded / data.total) * 100)
                                });
                                break;
                            case HttpEventType.Response:
                                // this.inputFile.nativeElement.value = '';
                                this.uploadStatus.emit({ status: ProgressStatusEnum.COMPLETE });
                                var count = 0
                                data.body.forEach(it => {
                                    if (it.filmId != 0)
                                        this.items.push(it);
                                    else count++;
                                });
                                if (count != 0)
                                    this._snackBar.open(count + " items were not found in Database", "Ok", {
                                        duration: 4000
                                    });
                                break;
                        }
                },
                error => {
                    // this.inputFile.nativeElement.value = '';
                    this.uploadStatus.emit({ status: ProgressStatusEnum.ERROR });
                    console.log(error);
                });
        }
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


    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.items = [];
        var queryParams: Params = {
            pageIndex: this.pageEvent.pageIndex,
            pageSize: this.pageEvent.pageSize
        };
        this.router.navigate(
            [],
            {
                relativeTo: this.route,
                queryParams: queryParams,
                queryParamsHandling: 'merge', // remove to replace all query params by provided
            });
        this.loadList();
        return event;
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
        this.builtInFilmsListService.listWatchedFilms(
            this.pageEvent.pageIndex + 1,
            this.pageEvent.pageSize).subscribe(res => {
                this.items = res;
            }, error => console.log(error));
    }

    setPageLength() {
        this.builtInFilmsListService.getWatchedFilmsCount().subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }
}

class ProgressStatus {
    status: ProgressStatusEnum;
    percentage?: number;
}

export enum ProgressStatusEnum {
    START,
    IN_PROGRESS,
    COMPLETE,
    ERROR
}