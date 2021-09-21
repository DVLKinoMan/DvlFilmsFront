import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { debounceTime, startWith, switchMap } from "rxjs/operators";
import { FilmBuiltInListsService } from "src/app/films/services/filmBuiltInLists.service";
import { FilmsService } from "src/app/films/services/films.service";
import { Gender } from "src/app/persons/enums";
import { FilmItem, Person } from "src/app/persons/person";
import { PersonBuiltInListsService } from "src/app/persons/services/person-builtIn-lists.service";
import { PersonsService } from "src/app/persons/services/persons.service";
import { ListSortDialogComponent } from "../list-sort/list-sort.dialog.component";
import { List, ListItem, ListType } from "../list.model";
import { ListFetcherService } from "../services/list-fetcher.service";
import { ListsService } from "../services/lists.service";


@Component({
    selector: 'app-add-edit-list',
    templateUrl: './list-add-edit.component.html',
    styleUrls: ['./list-add-edit.component.css']
})
export class ListAddEditComponent implements OnInit {
    queryParams: Params;
    id: string;
    model: List = new List;
    listType: ListType;
    listName: string;
    items: ListItem[] = [];
    listTypes: ListType[] = [ListType.Films, ListType.Persons];
    editMode: boolean = false;
    canEdit: boolean = false;
    builtInListMode: boolean = false;
    builtInList: string;
    loading: boolean = false;

    personsCtrl = new FormControl();
    filteredPersons: Observable<Person[]>;
    showPersons = 10;
    @ViewChild('personInput') personInput: ElementRef<HTMLInputElement>;

    filmsCtrl = new FormControl();
    filteredFilms: Observable<FilmItem[]>;
    showFilms = 10;
    @ViewChild('filmInput') filmInput: ElementRef<HTMLInputElement>;

    listType2StringMapping = ListType2StringMapping;

    pageEvent: PageEvent;
    defaultPageIndex: number = 0;
    defaultPageSize: number = 50;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: ListsService,
        private personsService: PersonsService,
        private fetcherService: ListFetcherService,
        private builtInFilmsListService: FilmBuiltInListsService,
        private builtInPersonsListService: PersonBuiltInListsService,
        private filmsService: FilmsService,
        private sortListDialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {
        this.filteredPersons = this.personsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((person: string) => this.personsService.getPersons(person, this.showPersons, false))
        );
        this.filteredFilms = this.filmsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((film: string) => this.filmsService.getFilmItems(film, this.showFilms, false))
        );
    }

    ngOnInit(): void {
        this.pageEvent = new PageEvent();
        this.route.queryParams.subscribe(params => {
            this.queryParams = params;
            this.pageEvent.pageIndex = params["pageIndex"] ?? this.defaultPageIndex;
            this.pageEvent.pageSize = params["pageSize"] ?? this.defaultPageSize;
            this.loadList();
        });
    }

    pageChanged(event: PageEvent) {
        this.pageEvent = event;
        this.items = [];
        var queryParams: Params = {
            pageIndex: this.pageEvent.pageIndex,
            pageSize: this.pageEvent.pageSize,
            id: this.id
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

    selectedPerson(event: MatAutocompleteSelectedEvent): void {
        this.personInput.nativeElement.value = '';
        this.personsCtrl.setValue(null);
        const p = event.option.value as Person;
        if (p) {
            if ((this.builtInListMode || !this.model.allowDuplicates) && this.items.find(it => it.itemId == p.id)) {
                this._snackBar.open("Duplicates Not Allowed", "Ok", {
                    duration: 4000
                });
                return;
            }
            this.items.push(new ListItem(p.id, p.name, this.items.length + 1, p.profilePicture));
        }
    }

    selectedFilm(event: MatAutocompleteSelectedEvent): void {
        this.filmInput.nativeElement.value = '';
        this.filmsCtrl.setValue(null);
        const f = event.option.value as FilmItem;
        if (f) {
            if ((this.builtInListMode || !this.model.allowDuplicates) && this.items.find(it => it.itemId == f.id)) {
                this._snackBar.open("Duplicates Not Allowed", "Ok", {
                    duration: 4000
                });
                return;
            }
            this.items.push(new ListItem(f.id, f.name, this.items.length + 1, f.photo));
        }
    }

    //todo: shity method
    availableAddingOrNot(type: string) {
        if (this.builtInListMode) {
            switch (this.builtInList) {
                case "FavoritePersons":
                    return type == "Persons";
                default:
                    return type == "Films";
            }
        }

        return type == 'Persons' ? this.listType == ListType.Persons :
            type == 'Films' ? this.listType == ListType.Films : false;
    }

    drop(event: CdkDragDrop<any>) {
        var prevIndex = event.previousContainer.data.index;
        var curIndex = event.container.data.index;
        var prevItem = this.items[prevIndex];
        this.items.splice(prevIndex, 1);
        this.items.splice(curIndex, 0, prevItem);
        this.setItemIndexes();
    }

    setItemIndexes() {
        this.items.forEach((c, ind) => {
            c.index = ind + 1;
        });
    }

    setDefaultPhoto(event: any, item: ListItem) {
        if (this.listType == ListType.Films)
            event.target.src = 'assets/DefaultMovie.png';
        else event.target.src = 'assets/DefaultPersonMale.png';
    }

    setDefaultProfilePicture(event: any, person: Person) {
        event.target.src = person.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    onClickItem(item: ListItem) {
        if (this.listType == ListType.Films)
            this.router.navigate(['/film/' + item.itemId]);
        else if (this.listType == ListType.Persons)
            this.router.navigate(['/person/' + item.itemId]);
    }

    onSaveClick() {
        if (!this.editMode)
            return;

        this.loading = true;
        if (!this.builtInListMode) {
            this.model.items = this.items;
            if (this.model.id) {
                this.service.update(this.model).subscribe(res => {
                    this.loading = false;
                    this._snackBar.open("Updated Successfully", "Close");
                    this.router.navigate(['/Lists']);
                }, error => {
                    this.loading = false;
                    this._snackBar.open("Failed to Update", "Close");
                    console.log(error);
                });
                return;
            }

            this.service.add(this.model).subscribe(res => {
                this.loading = false;
                this._snackBar.open("Created Successfully", "Close");
                this.router.navigate(['/Lists']);
            }, error => {
                this.loading = false;
                this._snackBar.open("Failed to Save", "Close");
                console.log(error);
            });
        }
        else {
            switch (this.builtInList) {
                case "FavoritePersons":
                    this.builtInPersonsListService.updateFavorites(this.items).subscribe(res => {
                        this.loading = false;
                        this._snackBar.open("Updated Successfully", "Close");
                        this.router.navigate(['/Lists']);
                    }, error => {
                        this.loading = false;
                        this._snackBar.open("Failed to Save", "Close");
                        console.log(error);
                    });
                    break;
                case "FavoriteFilms":
                    this.builtInFilmsListService.updateFavorites(this.items).subscribe(res => {
                        this.loading = false;
                        this._snackBar.open("Updated Successfully", "Close");
                        this.router.navigate(['/Lists']);
                    }, error => {
                        this.loading = false;
                        this._snackBar.open("Failed to Save", "Close");
                        console.log(error);
                    });
                    break;
                case "WantToSeeFilms":
                    this.builtInFilmsListService.updateWantToSeeFilms(this.items).subscribe(res => {
                        this.loading = false;
                        this._snackBar.open("Updated Successfully", "Close");
                        this.router.navigate(['/Lists']);
                    }, error => {
                        this.loading = false;
                        this._snackBar.open("Failed to Save", "Close");
                        console.log(error);
                    });
                    break;
                default:
                    throwError("not implemented");
            }
        }
    }

    setListType() {
        this.listType = this.model.type;
    }

    onSortClick() {
        const dialogRef = this.sortListDialog.open(ListSortDialogComponent, {
            width: '500px',
            data: { itemName: this.getItemNameForDialog(), listItems: this.items }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result)
                this.items = result;
            console.log('The dialog was closed');
        });
    }

    onFetchClick() {
        this.loading = true;
        this.fetcherService.getByUrl(this.model.imdbPageUrl).subscribe(res => {
            var list: string[] = [];
            res.items.forEach(it => {
                list.push(it.imdbName);
            });
            this.model = res;
            this.items = [];
            var chunks = 50;
            var times = Math.ceil(list.length / chunks);
            if (res.type == ListType.Persons) {
                for (var i = 0; i < list.length; i += chunks + 1) {
                    var chunkedTitles = list.slice(i, i + chunks);
                    this.service.getPersonItems(chunkedTitles).subscribe(res2 => {
                        this.items.push(...res2);
                        times--;
                        if (times == 0)
                            this.afterFetch();
                    }, error => console.log(error));
                }
            }
            else {
                for (var i = 0; i < list.length; i += chunks + 1) {
                    var chunkedTitles = list.slice(i, i + chunks);
                    this.service.getFilmItems(chunkedTitles).subscribe(res2 => {
                        this.items.push(...res2);
                        times--;
                        if (times == 0)
                            this.afterFetch();
                    }, error => console.log(error));
                }
            }
        }, error => {
            this.loading = false;
            console.log(error);
        })
    }

    afterFetch() {
        this.items.forEach(item => {
            var fetchedItem = this.model.items.find(it => it.imdbName == item.imdbName);
            if (fetchedItem) {
                item.index = fetchedItem.index;
                item.description = fetchedItem.description;
            }
        });
        this.items.sort((a, b) => a.index - b.index);
        this.loading = false;
        if (this.model.items.length - this.items.length > 0)
            this._snackBar.open((this.model.items.length - this.items.length) + " items was not found in database", "Ok", {
                duration: 4000
            });
    }

    getItemNameForDialog() {
        if (!this.builtInListMode)
            return this.listType2StringMapping[this.listType];
        //todo another names also
        return "Favorites";
    }

    removeItem(item: ListItem) {
        if (!this.items)
            return;

        const index = this.items.indexOf(item);

        if (index >= 0)
            this.items.splice(index, 1);
    }

    setListPageLength() {
        this.service.getListItemsCount(this.id).subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }

    setFavoritePersonsPageLength() {
        this.builtInPersonsListService.listFavoritesCount().subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }

    setFavoriteFilmsPageLength() {
        this.builtInFilmsListService.listFavoritesCount().subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }

    setWantToSeePageLength() {
        this.builtInFilmsListService.listWantToSeeFilmsCount().subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    }

    loadList() {
        this.id = this.queryParams['id'];
        var builtInList = this.queryParams['builtInList'];
        if (builtInList) {
            this.builtInListMode = true;
            this.builtInList = builtInList;
            switch (this.builtInList) {
                case "FavoritePersons":
                    this.loadFavoritePersons();
                    this.setFavoritePersonsPageLength();
                    break;
                case "FavoriteFilms":
                    this.loadFavoriteFilms();
                    this.setFavoriteFilmsPageLength();
                    break;
                case "WantToSeeFilms":
                    this.loadWantToSeeFilms();
                    this.setWantToSeePageLength();
                    break;
                default:
                    throwError("not implemented");
            }
        }
        else if (!this.id) {
            this.editMode = true;
            this.canEdit = true;
        }

        this.loading = true;
        this.service.getById(this.id, this.pageEvent.pageIndex + 1, this.pageEvent.pageSize).subscribe(res => {
            this.loading = false;
            this.model = res;
            this.listType = this.model.type;
            this.listName = this.model.name;
            this.items = JSON.parse(JSON.stringify(res.items));
            this.items.sort((a, b) => a.index - b.index);
        }, error => {
            this.loading = false;
            console.log(error)
        });

        this.setListPageLength();

        this.service.canEdit(this.id).subscribe(res => {
            this.canEdit = res;
        }, error => console.log(error));
    }

    loadFavoritePersons() {
        this.loading = true;
        this.builtInPersonsListService.listFavorites(this.pageEvent.pageIndex + 1, this.pageEvent.pageSize).subscribe(res => {
            this.loading = false;
            this.listType = ListType.Persons;
            this.listName = "Favorite Persons";
            this.canEdit = true;
            this.items = res;
            this.items.sort((a, b) => a.index - b.index);
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    loadFavoriteFilms() {
        this.loading = true;
        this.builtInFilmsListService.listFavorites(this.pageEvent.pageIndex + 1, this.pageEvent.pageSize).subscribe(res => {
            this.loading = false;
            this.listType = ListType.Films;
            this.listName = "Favorite Films";
            this.canEdit = true;
            this.items = res;
            this.items.sort((a, b) => a.index - b.index);
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    loadWantToSeeFilms() {
        this.loading = true;
        this.builtInFilmsListService.listWantToSeeFilms(this.pageEvent.pageIndex + 1, this.pageEvent.pageSize).subscribe(res => {
            this.loading = false;
            this.listType = ListType.Films;
            this.listName = "Want to See Films";
            this.canEdit = true;
            this.items = res;
            this.items.sort((a, b) => a.index - b.index);
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }
}

export const ListType2StringMapping: Record<ListType, string> = {
    [ListType.Films]: "Films",
    [ListType.Persons]: "Persons",
};