import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { debounceTime, startWith, switchMap } from "rxjs/operators";
import { FilmsService } from "src/app/films/services/films.service";
import { Character, FilmItem, Filmography, Person } from "src/app/persons/person";

@Component({
    selector: 'app-person-filmography-dialog',
    templateUrl: './person-filmography.dialog.component.html',
    styleUrls: ['./person-filmography.dialog.component.css']
})

export class PersonFilmographyDialogComponent {
    filteredFilms: Observable<FilmItem[]>;
    model: Filmography = new Filmography;
    filmName: string;
    filmImdbPageUrl: string;
    filmsCtrl = new FormControl();
    showFilms = 10;
    editMode: boolean = false;
    showNewCharacter: boolean = false;
    newCharacter: Character = new Character;

    @ViewChild('filmInput') filmInput: ElementRef<HTMLInputElement>;

    constructor(
        public dialogRef: MatDialogRef<PersonFilmographyDialogComponent>,
        private filmsService: FilmsService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.filteredFilms = this.filmsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((film: string) => this.filmsService.getFilmItems(film, this.showFilms, false))
        );
        this.resetButtonClick();
    }

    resetButtonClick() {
        if (this.data.filmography) {
            this.model = JSON.parse(JSON.stringify(this.data.filmography));
            this.editMode = true;
            if (!this.model.year && this.model.filmItem?.year)
                this.model.year = this.model.filmItem.year;
        }
        else {
            this.model = new Filmography;
            this.model.personId = this.data.personId;
            this.model.filmItem = new FilmItem;
            this.model.characters = [];
        }
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

    selectedFilm(event: MatAutocompleteSelectedEvent): void {
        this.filmInput.nativeElement.value = '';
        this.filmsCtrl.setValue(null);
        this.model.filmItem = event.option.value;
        this.model.year = this.model.filmItem.year;
    }

    addNewCharacter() {
        if (this.model.id)
            this.newCharacter.personFilmogbraphyId = this.model.id;
        this.model.characters.push(this.newCharacter);
        this.newCharacter = new Character;
        this.showNewCharacter = false;
    }

    removeCharacter(character: Character) {
        var index = this.model.characters.indexOf(character);
        this.model.characters.splice(index, 1);
    }
}

export class DialogData {
    title: string;
    filmography?: Filmography;
    personId: number;
    categoryNames: string[] = [];
}
