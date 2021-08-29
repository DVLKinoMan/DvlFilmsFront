import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Photo } from "src/app/common/photo";
import { PhotosService } from "src/app/common/services/photos.service";

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from "@angular/material/chips";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable } from "rxjs";
import { map, startWith } from 'rxjs/operators';
import { Gender } from "src/app/persons/enums";
import { Filmography, Person } from "../person";
import { PersonsService } from "../services/persons.service";
import { PersonPhotosDialogComponent } from "../person-photos/person-photos.dialog.component";
import { PersonAlternateNamesDailogComponent } from "./person-alternate-names/person-alternate-names.dialog.component";

@Component({
    selector: 'app-person-edit',
    templateUrl: './person-edit.dialog.component.html',
    styleUrls: ['./person-edit.dialog.component.css']
})

export class PersonEditDialogComponent {
    model: Person;
    alternateNames: string[];
    genders: any[] = ["Unknown", "Male", "Female"];

    filmography: Filmography[];
    filmographyItemsPerPage: number = 5;
    filmographyCurrPage: number = 0;
    filmographyPagesLength: number = 0;
    allFilmography: Filmography[];
    leftFilmographyArrowDisabled: boolean = true;
    rightFilmographyArrowDisabled: boolean = false;

    loading: boolean = true;
    showPhotos: number = 5;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
        public dialogRef: MatDialogRef<PersonEditDialogComponent>,
        private personService: PersonsService,
        private photosService: PhotosService,
        public alternateNamesDialog: MatDialog,
        public photosDialog: MatDialog,
        public personDialog: MatDialog
    ) {
        if (!data.person)
            this.loadPerson();
        else {
            this.model = data.person;
            this.data.personName = data.person.name;
        }
    }

    setDefaultProfilePicture(event: any) {
        if (typeof this.model.sex == "string")
            event.target.src = this.model.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        else event.target.src = this.model.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

    openAlternateNamesDialog() {
        const dialogRef = this.alternateNamesDialog.open(PersonAlternateNamesDailogComponent, {
            width: '800px',
            data: {
                filmName: this.model.name,
                filmId: this.model.id,
                editMode: true,
                anotherNames: JSON.parse(JSON.stringify(this.model.alternateNames)),
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.model.alternateNames = result;
                this.alternateNames = [...new Set(this.model.alternateNames?.map(item => item.name))];
            }
        });
    }

    openPhotosDialog() {
        const dialogRef = this.photosDialog.open(PersonPhotosDialogComponent, {
            width: '1000px',
            data: { personId: this.model.id, personName: this.model.name }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

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

    openFilmographyDialog() {

    }

    onCloseClick() {
        this.dialogRef.close();
    }

    onSaveClick() {
        this.loading = true;
        this.personService.update(this.model)
            .subscribe(res => {
                this.loading = true;
                this.onCloseClick();
            }, error => {
                this.loading = false;
                console.log(error);
            });
    }

    filmographyPageArrowClicked(right: boolean) {
        this.filmographyCurrPage = right ? this.filmographyCurrPage + 1 : this.filmographyCurrPage - 1;
        this.filmography = this.allFilmography.slice(this.filmographyCurrPage * this.filmographyItemsPerPage,
            this.filmographyCurrPage * this.filmographyItemsPerPage + this.filmographyItemsPerPage);
        this.leftFilmographyArrowDisabled = this.filmographyCurrPage < 1;
        this.rightFilmographyArrowDisabled = this.filmographyCurrPage >= this.filmographyPagesLength - 1;
    }

    loadPerson() {
        if (this.data.personId)
            this.personService.getById(this.data.personId).subscribe(result => {
                this.data.personName = result.name;
                this.model = result;
                this.loading = false;
                this.alternateNames = [...new Set(result.alternateNames.map(item => item.name))];
                this.photosService.getPersonPhotos(this.model.id, 0, this.showPhotos)
                    .subscribe(result => {
                        this.model.photos = result;
                    }, error => console.log(error));
            }, error => console.log(error));
    }

    loadFilmography() {
        this.personService.getFilmographies(this.model.id).subscribe(result => {
            this.allFilmography = result;
            this.model.filmographies = result;
            this.loadFilmographyPage();
        }, error => console.log(error));
    }

    loadFilmographyPage() {
        this.filmography = this.allFilmography.slice(0, this.filmographyItemsPerPage);
        this.filmographyPagesLength = Math.floor(this.allFilmography.length / this.filmographyItemsPerPage) +
            (this.allFilmography.length % this.filmographyItemsPerPage > 0 ? 1 : 0);
        this.leftFilmographyArrowDisabled = true;
        this.rightFilmographyArrowDisabled = this.filmographyPagesLength <= 1;
    }
}

export interface DialogData {
    personId?: number;
    personName: string;
    //todo this person doesn't needed
    person?: Person;
}