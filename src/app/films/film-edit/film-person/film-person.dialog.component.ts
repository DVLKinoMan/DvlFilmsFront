import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { debounceTime, map, startWith, switchMap } from "rxjs/operators";
import { Photo } from "src/app/common/photo";
import { PhotosService } from "src/app/common/services/photos.service";
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
    model: Person;
    personsCtrl = new FormControl();
    showPersons = 10;

    constructor(
        public dialogRef: MatDialogRef<FilmPersonDialogComponent>,
        private personsService: PersonsService,
        private photosService: PhotosService,
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

    // selectedPerson(event: MatAutocompleteSelectedEvent): void {
    //     this.addGenreToModel(event.option.viewValue);
    //     this.genreInput.nativeElement.value = '';
    //     this.genreCtrl.setValue(null);
    // }

    // addGenreToModel(value: string) {
    //     var genre = this.genres.find(g => g.name == value);

    //     if (!genre || this.model.genres?.find(g => g.id == genre?.id))
    //         return;

    //     if (!this.model.genres)
    //         this.model.genres = [];
    //     this.model.genres.push(genre);
    // }

    onFileSelected() {
        const inputNode: any = document.querySelector('#file');

        if (typeof (FileReader) !== 'undefined') {
            const reader = new FileReader();

            reader.onload = (e: any) => {
                if (this.model.profilePicture)
                    this.model.profilePicture.image = e.target.result;
                else {
                    this.model.profilePicture = new Photo;
                    this.model.profilePicture.image = e.target.result;
                }
            };

            reader.readAsDataURL(inputNode.files[0]);
        }
    }
}

export interface DialogData {
    title: string;
}
