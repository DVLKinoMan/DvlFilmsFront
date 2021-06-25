import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AnotherName } from "../film";

@Component({
    selector: 'app-film-anotherNames-dialog',
    templateUrl: './film-anotherNames-dialog.component.html',
})

export class FilmAnotherNamesDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<FilmAnotherNamesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}

export interface DialogData {
    filmName: string;
    anotherNames: AnotherName[];
}
