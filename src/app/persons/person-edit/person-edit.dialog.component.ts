import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Photo } from "src/app/common/photo";
import { PhotosService } from "src/app/common/services/photos.service";

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Gender } from "src/app/persons/enums";
import { Filmography, Person } from "../person";
import { PersonsService } from "../services/persons.service";
import { PersonPhotosDialogComponent } from "../person-photos/person-photos.dialog.component";
import { PersonAlternateNamesDailogComponent } from "./person-alternate-names/person-alternate-names.dialog.component";
import { PersonFilmographyDialogComponent } from "./person-filmography/person-filmography.dialog.component";
import { PersonFetcherService } from "../services/person-fetcher.service";

@Component({
    selector: 'app-person-edit',
    templateUrl: './person-edit.dialog.component.html',
    styleUrls: ['./person-edit.dialog.component.css']
})

export class PersonEditDialogComponent {
    model: Person;
    dbPerson: Person;
    alternateNames: string[];
    genders: any[] = ["Unknown", "Male", "Female"];

    groupedFilmography: Map<string, Filmography[]>;

    allFilmography: Filmography[];

    loading: boolean = true;
    showPhotos: number = 5;

    separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
        public dialogRef: MatDialogRef<PersonEditDialogComponent>,
        private personService: PersonsService,
        private personFetcherSerivce: PersonFetcherService,
        private photosService: PhotosService,
        public alternateNamesDialog: MatDialog,
        public photosDialog: MatDialog,
        public personDialog: MatDialog
    ) {
        if (!data.person)
            this.loadPerson();
        else {
            this.model = data.person;
            this.dbPerson = data.person;
            this.data.personName = data.person.name;
            this.allFilmography = data.person.filmographies;
            this.setGroupedFilmography();
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
                personName: this.model.name,
                editMode: true,
                alternateNames: JSON.parse(JSON.stringify(this.model.alternateNames)),
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
        const dialogRef = this.photosDialog.open(PersonFilmographyDialogComponent, {
            width: '1000px',
            data: {
                title: "Add Filmography Item",
                categoryNames: Array.from(this.groupedFilmography.keys()),
                personId: this.model.id
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.allFilmography.push(result);
                this.setGroupedFilmography();
            }
            console.log('The dialog was closed');
        });
    }

    openEditFilmographyDialog(index: number, filmography: Filmography) {
        const dialogRef = this.photosDialog.open(PersonFilmographyDialogComponent, {
            width: '1000px',
            data: {
                title: "Edit " + filmography.filmItem?.name,
                filmography: filmography,
                categoryNames: Array.from(this.groupedFilmography.keys()),
                personId: this.model.id
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                var ind = this.allFilmography.indexOf(this.groupedFilmography.get(filmography.categoryName)[index]);
                if (ind >= 0) {
                    this.allFilmography[ind] = result;
                    this.setGroupedFilmography();
                }
            }
            console.log('The dialog was closed');
        });
    }

    resetFilmography() {
        this.allFilmography = JSON.parse(JSON.stringify(this.model.filmographies));
        this.setGroupedFilmography();
    }

    removeFilmography(key: string, member: Filmography) {
        if (!this.allFilmography)
            return;

        const index = this.allFilmography.indexOf(member);
        const index2 = this.groupedFilmography.get(key)?.indexOf(member);

        if (index >= 0)
            this.allFilmography.splice(index, 1);
        if (index2 != undefined && index2 >= 0)
            this.groupedFilmography.get(key)?.splice(index2, 1);
    }

    setGroupedFilmography() {
        var map = new Map<string, Filmography[]>();
        this.allFilmography.forEach(function (member) {
            var arr = map.get(member.categoryName);
            if (arr)
                arr.push(member);
            else map.set(member.categoryName, [member]);
        });
        map.forEach(element => {
            element.sort((a, b) => b.year - a.year);
        });
        this.groupedFilmography = map;
    }

    onCloseClick() {
        this.dialogRef.close();
    }

    onSaveClick() {
        this.loading = true;
        this.model.filmographies = this.allFilmography;
        this.personService.update(this.model)
            .subscribe(res => {
                this.loading = false;
                this.onCloseClick();
            }, error => {
                this.loading = false;
                console.log(error);
            });
    }

    loadPerson() {
        if (this.data.personId)
            this.personService.getById(this.data.personId).subscribe(result => {
                this.data.personName = result.name;
                this.model = result;
                this.loading = false;
                this.alternateNames = [...new Set(result.alternateNames.map(item => item.name))];
                this.loadFilmography();
                this.photosService.getPersonPhotos(this.model.id, 0, this.showPhotos)
                    .subscribe(result => {
                        this.model.photos = result;
                    }, error => console.log(error));
            }, error => console.log(error));
    }

    fetchPerson() {
        this.loading = true;
        this.personFetcherSerivce.getByUrl(this.model.imdbPageUrl).subscribe(result => {
            this.loading = false;
            this.dbPerson = this.model;
            this.model = result;
            this.allFilmography = JSON.parse(JSON.stringify(this.model.filmographies));
            this.setGroupedFilmography();
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    restorePerson() {
        this.model = this.dbPerson;
        this.allFilmography = JSON.parse(JSON.stringify(this.model.filmographies));
        this.setGroupedFilmography();
    }

    loadFilmography() {
        this.personService.getFilmographies(this.data.personId).subscribe(result => {
            this.allFilmography = JSON.parse(JSON.stringify(result));
            this.model.filmographies = result;
            this.setGroupedFilmography();
        }, error => console.log(error));
    }
}

export interface DialogData {
    personId?: number;
    personName: string;
    //todo this person doesn't needed
    person?: Person;
}