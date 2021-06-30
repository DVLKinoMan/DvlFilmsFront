import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Country } from "src/app/common/country";
import { CountriesService } from "src/app/common/services/countries.service";
import { FilmsService } from "../../services/films.service";
import { FilmAnotherName } from "./filmAnotherName";

@Component({
    selector: 'app-film-anotherNames-dialog',
    templateUrl: './film-anotherNames.dialog.component.html',
})

export class FilmAnotherNamesDialogComponent {
    anotherNames: FilmAnotherName[];
    newAnotherName: FilmAnotherName;
    showNewAnotherName: boolean = false;
    countries: Country[];
    loading: boolean = true;

    constructor(
        public dialogRef: MatDialogRef<FilmAnotherNamesDialogComponent>,
        private filmService: FilmsService,
        private countriesService: CountriesService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        if (data.editMode)
            this.loadCountries();
        if (data.anotherNames) {
            this.anotherNames = data.anotherNames;
            this.loading = false;
        }
        else this.loadAnotherNames();
    }

    onCloseClick() {
        this.dialogRef.close();
    }

    removeAnotherName(name: FilmAnotherName) {
        var index = this.anotherNames.indexOf(name);

        if (index >= 0)
            this.anotherNames.splice(index, 1);
    }

    addAnotherName() {
        this.anotherNames.push(this.newAnotherName);
        this.showNewAnotherName = false;
    }

    loadAnotherNames() {
        this.filmService.getAnotherNames(this.data.filmId).subscribe(result => {
            this.anotherNames = result;
            this.loading = false;
        }, error => console.log(error));
    }

    loadCountries() {
        this.countriesService.getAllCountries().subscribe(result => {
            this.countries = result;
        }, error => console.log(error));
    }
}

export interface DialogData {
    filmId: number;
    filmName: string;
    editMode?: boolean;
    anotherNames?: FilmAnotherName[];
}
