import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Observable } from "rxjs";
import { debounceTime, startWith, switchMap } from "rxjs/operators";
import { FilmsService } from "src/app/films/services/films.service";
import { Gender } from "src/app/persons/enums";
import { FilmItem, Person } from "src/app/persons/person";
import { PersonsService } from "src/app/persons/services/persons.service";
import { ListSortDialogComponent } from "../list-sort/list-sort.dialog.component";
import { List, ListItem, ListType } from "../list.model";
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
    listTypes: ListType[] = [ListType.Films, ListType.Persons];
    editMode: boolean = false;

    personsCtrl = new FormControl();
    filteredPersons: Observable<Person[]>;
    showPersons = 10;
    @ViewChild('personInput') personInput: ElementRef<HTMLInputElement>;

    filmsCtrl = new FormControl();
    filteredFilms: Observable<FilmItem[]>;
    showFilms = 10;
    @ViewChild('filmInput') filmInput: ElementRef<HTMLInputElement>;

    listType2StringMapping = ListType2StringMapping;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: ListsService,
        private personsService: PersonsService,
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
        this.route.queryParams.subscribe(params => {
            this.queryParams = params;
            this.id = params['id'];
            if (this.id)
                this.loadList();
            else this.editMode = true;
        });
    }

    selectedPerson(event: MatAutocompleteSelectedEvent): void {
        this.personInput.nativeElement.value = '';
        this.personsCtrl.setValue(null);
        const p = event.option.value as Person;
        if (p) {
            if (!this.model.allowDuplicates && this.model.items.find(it => it.itemId == p.id)) {
                this._snackBar.open("Duplicates Not Allowed", "Ok", {
                    duration: 4000
                });
                return;
            }
            this.model.items.push(new ListItem(p.id, p.name, this.model.items.length + 1, p.profilePicture));
        }
    }

    selectedFilm(event: MatAutocompleteSelectedEvent): void {
        this.filmInput.nativeElement.value = '';
        this.filmsCtrl.setValue(null);
        const f = event.option.value as FilmItem;
        if (f) {
            if (!this.model.allowDuplicates && this.model.items.find(it => it.itemId == f.id)) {
                this._snackBar.open("Duplicates Not Allowed", "Ok", {
                    duration: 4000
                });
                return;
            }
            this.model.items.push(new ListItem(f.id, f.name, this.model.items.length + 1, f.photo));
        }
    }

    //todo: shity method
    availableAddingOrNot(type: string) {
        if (typeof this.model.type == 'string')
            return this.model.type == type;
        return type == 'Persons' ? this.model.type == ListType.Persons :
            type == 'Films' ? this.model.type == ListType.Films : false;
    }

    drop(event: CdkDragDrop<any>) {
        var prevIndex = event.previousContainer.data.index;
        var curIndex = event.container.data.index;
        var prevItem = this.model.items[prevIndex];
        this.model.items.splice(prevIndex, 1);
        this.model.items.splice(curIndex, 0, prevItem);
        this.setItemIndexes();
    }

    setItemIndexes() {
        this.model.items.forEach((c, ind) => {
            c.index = ind + 1;
        });
    }

    setDefaultPhoto(event: any, item: ListItem) {
        if (this.model.type == ListType.Films)
            event.target.src = 'assets/DefaultMovie.png';
        else event.target.src = 'assets/DefaultPersonMale.png';
    }

    setDefaultProfilePicture(event: any, person: Person) {
        if (typeof person.sex == "string")
            event.target.src = person.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    onClickItem(item: ListItem) {
        if (this.model.type == ListType.Films)
            this.router.navigate(['/film/' + item.itemId]);
        else if (this.model.type == ListType.Persons)
            this.router.navigate(['/person/' + item.itemId]);
    }

    onSaveClick() {
        if (!this.editMode)
            return;

        if (this.model.id) {
            this.service.update(this.model).subscribe(res => {
                this._snackBar.open("Updated Successfully", "Close");
                this.router.navigate(['/Lists']);
            }, error => {
                this._snackBar.open("Failed to Update", "Close");
                console.log(error);
            });
            return;
        }

        this.service.add(this.model).subscribe(res => {
            this._snackBar.open("Created Successfully", "Close");
            this.router.navigate(['/Lists']);
        }, error => {
            this._snackBar.open("Failed to Save", "Close");
            console.log(error);
        });
    }

    onSortClick() {
        const dialogRef = this.sortListDialog.open(ListSortDialogComponent, {
            width: '500px',
            data: { itemName: this.listType2StringMapping[this.model.type], listItems: this.model.items }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result)
                this.model.items = result;
            console.log('The dialog was closed');
        });
    }

    removeItem(item: ListItem) {
        if (!this.model)
            return;

        const index = this.model.items.indexOf(item);

        if (index >= 0)
            this.model.items.splice(index, 1);
    }

    loadList() {
        this.service.getById(this.id).subscribe(res => {
            this.model = res;
            this.model.items.sort((a, b) => a.index - b.index);
        }, error => console.log(error));
    }

}

export const ListType2StringMapping: Record<ListType, string> = {
    [ListType.Films]: "Films",
    [ListType.Persons]: "Persons",
};