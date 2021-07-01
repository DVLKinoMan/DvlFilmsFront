import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { debounceTime, startWith, switchMap } from "rxjs/operators";
import { Gender } from "src/app/persons/enums";
import { Character, Person } from "src/app/persons/person";
import { PersonsService } from "src/app/persons/services/persons.service";
import { FilmCastMember } from "./filmCastMember";

@Component({
    selector: 'app-film-cast-edit-dialog',
    templateUrl: './film-cast-edit.dialog.component.html',
    styleUrls: ['./film-cast-edit.dialog.component.css']
})

export class FilmCastEditDialogComponent {
    model: FilmCastMember = new FilmCastMember;
    title: string;
    filteredPersons: Observable<Person[]>;
    person: Person = new Person;
    personsCtrl = new FormControl();
    showPersons = 10;
    editMode: boolean = false;
    canEditPerson: boolean = true;

    newCharacter: Character = new Character;
    showAddCharacter: boolean = false;

    @ViewChild('personInput') personInput: ElementRef<HTMLInputElement>;

    constructor(
        public dialogRef: MatDialogRef<FilmCastEditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private personsService: PersonsService
    ) {
        this.title = (data?.model ? 'Edit' : 'Add') + ' Cast Member';
        if (data?.model) {
            this.model = data.model;
            this.editMode = true;
            if (this.model.id) {
                this.person = new Person;
                this.person.id = this.model.id;
                this.person.name = this.model.name;
                this.person.profilePicture = this.model.profilePicture;
                this.canEditPerson = false;
            }
        }
        this.filteredPersons = this.personsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((person: string) => this.personsService.getPersons(person, this.showPersons, false))
        );
    }

    resetButtonClick() {
        this.person = new Person;
        this.canEditPerson = true;
    }

    setDefaultProfilePicture(event: any, person: Person) {
        if (typeof person.sex == "string")
            event.target.src = person.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

    selectedPerson(event: MatAutocompleteSelectedEvent): void {
        this.personInput.nativeElement.value = '';
        this.personsCtrl.setValue(null);
        this.person = event.option.value;
        this.setModel(this.person);
        this.canEditPerson = false;
    }

    addCharacter() {
        if (!this.model.characters)
            this.model.characters = [];
        this.model.characters.push(this.newCharacter);
        this.showAddCharacter = false;
        this.newCharacter = new Character;
    }

    removeCharacter(char: Character) {
        const index = this.model.characters.indexOf(char);

        if (index >= 0)
            this.model.characters.splice(index, 1);
    }

    setModel(person: Person) {
        this.model.id = person.id;
        if (person.sex)
            this.model.gender = person.sex;
        this.model.name = person.name;
        this.model.imdbPageUrl = person.imdbPageUrl;
        this.model.profilePicture = person.profilePicture;
    }
}

export interface DialogData {
    model?: FilmCastMember;
}