import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { debounceTime, startWith, switchMap } from "rxjs/operators";
import { Gender } from "src/app/persons/enums";
import { Person } from "src/app/persons/person";
import { PersonsService } from "src/app/persons/services/persons.service";

@Component({
    selector: 'app-film-person-dialog',
    templateUrl: './film-person.dialog.component.html',
    styleUrls: ['./film-person.dialog.component.css']
})

export class FilmPersonDialogComponent {
    filteredPersons: Observable<Person[]>;
    model: Person = new Person;
    personsCtrl = new FormControl();
    showPersons = 10;
    canEdit: boolean = true;

    @ViewChild('personInput') personInput: ElementRef<HTMLInputElement>;

    constructor(
        public dialogRef: MatDialogRef<FilmPersonDialogComponent>,
        private personsService: PersonsService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.filteredPersons = this.personsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(400),
            switchMap((person: string) => this.personsService.getPersons(person, this.showPersons, false))
        );
    }

    setDefaultProfilePicture(event: any, person: Person) {
        if (typeof person.sex == "string")
            event.target.src = person.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = person.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    resetButtonClick() {
        this.model = new Person;
        this.canEdit = true;
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

    selectedPerson(event: MatAutocompleteSelectedEvent): void {
        this.personInput.nativeElement.value = '';
        this.personsCtrl.setValue(null);
        this.model = event.option.value;
        this.canEdit = false;
    }

}

export interface DialogData {
    title: string;
}
