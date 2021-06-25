import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlternateName } from '../../person';
import { PersonAwardResult } from '../../personAwardResult';
import { PersonsService } from '../../services/persons.service';

@Component({
    selector: 'app-person-alternate-names-dialog',
    templateUrl: './person-alternate-names.dialog.component.html',
    styleUrls: ['./person-alternate-names.dialog.component.css']
})

export class PersonAlternateNamesDailogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<PersonAlternateNamesDailogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {

    }

    ngOnInit(): void {

    }
}

export interface DialogData {
    personName: string;
    alternateNames: AlternateName[];
}